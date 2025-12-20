import re
from typing import Tuple, List


# -------------------------------------------------
# Basic cleaning utilities (HTML, bullets, tables)
# -------------------------------------------------
def remove_html(text: str) -> str:
    # Convert common break tags first
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"</?p[^>]*>", "\n", text, flags=re.I)

    # Replace block-level tags with newline
    block_tags = ["div", "span", "ul", "ol", "li", "section", "article"]
    for tag in block_tags:
        text = re.sub(rf"</?{tag}[^>]*>", "\n", text, flags=re.I)

    # Remove headings but keep their text
    for h in ["h1", "h2", "h3", "h4", "h5", "h6"]:
        text = re.sub(rf"</?{h}[^>]*>", "\n", text, flags=re.I)

    # Remove emphasis tags only
    text = re.sub(r"</?(strong|em|b|i)[^>]*>", "", text, flags=re.I)

    return text


def remove_tables_and_pipes(text: str) -> str:
    """
    Removes markdown tables safely without deleting normal paragraphs.
    """
    # Remove multi-line markdown tables
    text = re.sub(
        r"(?:\n?\|.*?\|\n)+", 
        "\n",
        text,
        flags=re.MULTILINE
    )

    # Remove stray pipes only when surrounded by spaces
    text = re.sub(r"\s\|\s", " ", text)

    return text


def normalize_bullets(text: str) -> str:
    bullet_variants = [
        "•", "●", "▪", "‣", "–", "—", "○", "♦", "✔", "➤", "➜", "→"
    ]
    for b in bullet_variants:
        text = text.replace(b, "- ")

    # collapse cases like "-- item" → "- item"
    text = re.sub(r"-\s*-+", "- ", text)

    # enforce dash + space
    text = re.sub(r"-(?!\s)", "- ", text)

    return text


def remove_code_fences(text: str) -> str:
    text = re.sub(r"```[\s\S]*?```", "", text)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    return text


def compact_blanklines(text: str) -> str:
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def remove_duplicate_lines(text: str) -> str:
    """
    Removes consecutive duplicate lines (LLMs often repeat sections).
    """
    cleaned = []
    last = None
    for line in text.splitlines():
        if line.strip() and line.strip() == last:
            continue
        cleaned.append(line)
        last = line.strip()
    return "\n".join(cleaned)


# -------------------------------------------------
# High-level cleaning pipeline
# -------------------------------------------------
def clean_full_text(text: str) -> str:
    if not text:
        return ""

    text = str(text)

    text = remove_html(text)
    text = remove_tables_and_pipes(text)
    text = normalize_bullets(text)
    text = remove_code_fences(text)

    # Trim trailing spaces
    text = "\n".join([ln.rstrip() for ln in text.splitlines()])

    text = compact_blanklines(text)
    text = remove_duplicate_lines(text)

    return text


# -------------------------------------------------
# Structure validation (improved)
# -------------------------------------------------
REQUIRED_SECTIONS = {
    "Overview": ["overview"],
    "Schedule": ["schedule", "timeline"],
    "Locations": ["locations", "places"],
    "Activities": ["activities", "things to do"],
    "Food Suggestions": ["food", "foods", "meals", "restaurants"],
    "Budget": ["budget", "cost", "pricing", "expenses"],
    "Travel Notes": ["notes", "tips", "travel notes", "guidelines"],
}


WRITTEN_NUMBERS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
}


def find_day_headers(text: str) -> List[Tuple[int, str]]:
    headers = []

    # Match numeric days: Day 1, Day01, Day-2
    numeric_pattern = r"(?:###\s*)?(day|itinerary day)\s*[-:]?\s*(\d{1,2})"
    for m in re.finditer(numeric_pattern, text, re.I):
        headers.append((int(m.group(2)), m.group(0)))

    # Match written days: "Day One"
    written_pattern = r"(?:day)\s+(one|two|three|four|five|six|seven|eight|nine|ten)"
    for m in re.finditer(written_pattern, text, re.I):
        num = WRITTEN_NUMBERS.get(m.group(1).lower())
        headers.append((num, m.group(0)))

    return headers


def validate_itinerary_structure(text: str) -> Tuple[bool, List[str]]:
    missing = []
    lower = text.lower()

    for canonical, variants in REQUIRED_SECTIONS.items():
        if not any(v in lower for v in variants):
            missing.append(canonical)

    return (len(missing) == 0, missing)


# -------------------------------------------------
# Optimizations
# -------------------------------------------------
def shorten_sentences(text: str, max_words_per_sentence: int = 22) -> str:
    """
    Break long sentences unless they contain URLs, times, numbers.
    """
    words = text.split()
    if len(words) <= max_words_per_sentence:
        return text

    if any(x in text for x in ["http", "www.", "Rs.", "$", "€", "am", "pm"]):
        return text  # avoid breaking structured text

    out = []
    cur = []

    for w in words:
        cur.append(w)
        if len(cur) >= max_words_per_sentence:
            out.append(" ".join(cur))
            cur = []

    if cur:
        out.append(" ".join(cur))

    return "\n".join(out)


def bulletify_paragraphs(text: str) -> str:
    paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    transformed = []

    for p in paras:
        # Do not bulletify short lines
        if len(p.split()) < 6:
            transformed.append(p)
            continue

        # Convert paragraph to bullets when heavy punctuation is detected
        if "," in p or ";" in p:
            parts = re.split(r"[;,.]\s+", p)
            parts = [pt.strip() for pt in parts if pt.strip()]
            if len(parts) > 1:
                transformed.append("\n".join([f"- {pt}" for pt in parts]))
                continue

        transformed.append(p)

    return "\n\n".join(transformed)


# -------------------------------------------------
# Lightweight summarizer
# -------------------------------------------------
def summarize_light(text: str, max_lines: int = 6) -> str:
    if not text:
        return ""

    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    keywords = [
        "beach", "temple", "train", "hike",
        "food", "market", "drive", "duration",
        "waterfall", "sunrise", "sunset"
    ]

    scored = []
    for ln in lines:
        score = len(ln)
        for k in keywords:
            if k in ln.lower():
                score += 40
        scored.append((score, ln))

    scored.sort(reverse=True)
    return "\n".join([ln for _, ln in scored[:max_lines]])


# -------------------------------------------------
# Public API
# -------------------------------------------------
def format_and_validate(text: str) -> dict:
    cleaned = clean_full_text(text)

    cleaned = bulletify_paragraphs(cleaned)
    cleaned = shorten_sentences(cleaned)

    valid, missing = validate_itinerary_structure(cleaned)
    days = len(find_day_headers(cleaned))
    preview = summarize_light(cleaned, max_lines=5)

    return {
        "cleaned": cleaned,
        "valid": valid,
        "missing_sections": missing,
        "days_detected": days,
        "preview": preview
    }
