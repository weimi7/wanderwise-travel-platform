import os
import re
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

# ============================================================================
# CONFIGURATION
# ============================================================================

HF_API_KEY = os.getenv("HF_API_KEY")
if not HF_API_KEY:
    raise RuntimeError("❌ Missing HF_API_KEY in .env")

DEFAULT_MODEL = os.getenv("HF_DEFAULT_MODEL", "meta-llama/Llama-3.3-70B-Instruct:groq")
FALLBACK_MODEL = "meta-llama/Llama-3.3-70B-Instruct:groq"

client = InferenceClient(api_key=HF_API_KEY)

# ============================================================================
# MAIN CHAT FUNCTION
# ============================================================================

def hf_chat(
    messages: list,
    model:  str = DEFAULT_MODEL,
    max_tokens: int = 3000,
    temperature: float = 0.7
):
    """
    Production-grade HuggingFace chat with automatic cleanup
    """
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )

        raw_text = response.choices[0].message.get("content", "")
        return clean_output(raw_text)

    except Exception as e: 
        print(f"⚠️ Primary model failed:  {e}")
        try:
            print("🔄 Trying fallback model...")
            response = client.chat.completions.create(
                model=FALLBACK_MODEL,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            raw_text = response.choices[0].message.get("content", "")
            return clean_output(raw_text)
        except Exception as e2:
            return f"❌ All models failed: {str(e2)}"

# ============================================================================
# TEXT CLEANUP (Production-Grade)
# ============================================================================

def clean_output(text: str) -> str:
    """
    Remove all LLM artifacts and formatting issues
    """
    if not text: 
        return ""

    # Normalize Unicode
    try:
        text = text.normalize("NFC")
    except:
        pass

    # Remove HTML tags
    text = re.sub(r"<br\s*/?>", "\n", text)
    text = re.sub(r"</?p>", "\n", text)
    text = re.sub(r"</?div[^>]*>", "\n", text)
    text = re.sub(r"<[^>]+>", "", text)

    # Remove code fences
    text = re. sub(r"```[\w]*\n? ", "", text)
    text = re.sub(r"```", "", text)

    # Remove markdown bold/italic
    text = re. sub(r"\*\*\*(. +?)\*\*\*", r"\1", text)
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    text = re.sub(r"__(.+?)__", r"\1", text)
    text = re.sub(r"_(.+?)_", r"\1", text)

    # Remove markdown headers
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)

    # Fix broken tables
    text = re.sub(r"\|[-\s]+\|", "", text)
    text = text.replace("|---|", "")
    text = text.replace("| ---- |", "")

    # Normalize bullets
    text = re.sub(r"^[•●▪‣]\s+", "- ", text, flags=re. MULTILINE)
    text = re.sub(r"^[-–—]{2,}\s+", "- ", text, flags=re. MULTILINE)

    # Remove control characters
    text = re.sub(r"[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]", " ", text)

    # Trim each line
    text = "\n".join(line. rstrip() for line in text.splitlines())

    # Remove excessive blank lines
    text = re. sub(r"\n{3,}", "\n\n", text)

    # Remove excessive spaces
    text = re.sub(r" {2,}", " ", text)

    return text.strip()