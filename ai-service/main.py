from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import re

from utils.hf_client import hf_chat

app = FastAPI(
    title="WanderWise AI Service",
    description="AI-powered itinerary generator",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# REQUEST MODELS
# ============================================================================

class ItineraryRequest(BaseModel):
    destinations: List[str]
    days: int
    preferences: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []
    context: Optional[str] = "travel-sri-lanka"

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/")
def health_check():
    return {"message": "WanderWise AI service is running 🚀"}

# ============================================================================
# GENERATE ITINERARY (Enhanced Prompt)
# ============================================================================

@app.post("/api/itinerary/generate")
@app.post("/itinerary")
def generate_itinerary(req: ItineraryRequest):
    """
    Generate a beautiful, structured itinerary for Sri Lanka travel
    """
    
    prompt = f"""
You are a professional Sri Lankan travel planner creating beautifully structured itineraries.  

CREATE A {req.days}-DAY ITINERARY FOR:  
Destinations: {", ".join(req.destinations)}
Preferences: {req.preferences or "General sightseeing, culture, and nature"}

CRITICAL FORMATTING RULES:
===========================

**IMPORTANT**:  Each section header MUST be on its own line with a blank line before and after. 

STRUCTURE FOR EACH DAY: 

DAY [NUMBER] - [DESTINATION NAME]

[One sentence description of the day's theme]

MORNING

⏰ 8:00 AM - Breakfast at [Place Name]
📍 [Location Name] - [Brief description]
🎯 [Specific activity description]
⏰ 9:30 AM - [Next activity]
📍 [Location] - [Description]

AFTERNOON

⏰ 12:30 PM - Lunch at [Restaurant Name]
🍽️ [Dish recommendations] (LKR [price range])
📍 [Afternoon Location] - [Activity]
🎯 [What to do here]
⏰ 3:00 PM - [Next activity]

EVENING

⏰ 6:00 PM - [Evening activity]
📍 [Location] - [Description]
🍽️ Dinner at [Restaurant] (LKR [price range])
💡 [Evening tip or recommendation]

DAILY BUDGET

💰 Budget: LKR [amount] (guesthouse, street food, public transport)
💰 Mid-Range: LKR [amount] (boutique hotel, restaurant meals, taxi)
💰 Luxury: LKR [amount] (5-star resort, fine dining, private car)

TRAVEL TIPS

🚗 [Transportation advice for getting around]
💡 [Helpful local tip or cultural note]
⏰ [Best time to visit certain attractions]

---

AFTER ALL DAYS, ADD: 

ESSENTIAL TRAVEL INFORMATION

PACKING ESSENTIALS
- Light, breathable cotton clothing
- Sunscreen SPF 50+ and wide-brimmed hat
- Comfortable walking shoes
- Reusable water bottle
- Power adapter (Type D/M/G plugs)
- Basic first aid kit
- Insect repellent

CULTURAL ETIQUETTE
- Dress modestly at temples (cover shoulders and knees)
- Always remove shoes before entering temples
- Ask permission before photographing people
- Use right hand for giving and receiving items
- Avoid public displays of affection

EMERGENCY CONTACTS
🚨 Police: 119
🏥 Ambulance: 110
🚓 Tourist Police: 011-2421052
📞 Fire Service: 110

MONEY & PAYMENTS
💳 Currency: Sri Lankan Rupee (LKR)
💵 ATMs widely available in cities
💰 Carry cash for small towns and vendors
📱 Credit cards accepted in major establishments

IMPORTANT REQUIREMENTS: 
- Section headers (MORNING, AFTERNOON, EVENING, DAILY BUDGET, TRAVEL TIPS) MUST be on their own line
- Add blank lines between sections
- Use real Sri Lankan location names
- Use realistic LKR pricing (meals:  500-2000, hotels: 3000-20000)
- Include at least 3 time slots per section
- Include specific restaurant/cafe names
- NO markdown code blocks (no ```)
- Keep it well-spaced and readable
"""

    result = hf_chat([
        {"role": "system", "content": "You are a professional Sri Lankan travel planner.  Create clean, well-structured itineraries with clear section breaks.  Each section header (MORNING, AFTERNOON, etc.) must be on its own line with blank lines before and after."},
        {"role": "user", "content":  prompt}
    ])

    return {"itinerary": result}

# ============================================================================
# HELPER:  EXTRACT JSON FROM TEXT
# ============================================================================

def extract_json_from_text(text: str):
    """Extract JSON from LLM response"""
    if not text:
        return None

    # Try fenced JSON first
    m = re.search(r"```json\s*(\{[\s\S]*?\})\s*```", text, re.I)
    if not m:
        m = re. search(r"(\{[\s\S]*\})", text)
    if not m:
        return None

    candidate = m.group(1)
    try:
        return json.loads(candidate)
    except Exception:
        # Cleanup and retry
        cleaned = re.sub(r",\s*}", "}", candidate)
        cleaned = re.sub(r",\s*]", "]", cleaned)
        try:
            return json.loads(cleaned)
        except Exception:
            return None

# ============================================================================
# AI CHATBOT ENDPOINT
# ============================================================================

@app.post("/chat")
@app.post("/api/chatbot/chat")
async def ai_chat(req: ChatRequest):
    """Structured chatbot responses"""
    try:
        # Build history
        history_messages = []
        for msg in req.history or []:
            if "role" in msg and "content" in msg:
                content = msg["content"]
                if isinstance(content, dict):
                    content = content.get("summary") or content.get("body_markdown") or json.dumps(content)
                history_messages.append({"role":  msg["role"], "content": content})

        system_prompt = """
You are WanderWise AI - a helpful Sri Lankan travel assistant. 

CRITICAL:  Respond ONLY with valid JSON. No extra text before or after. 

{
  "title": "Short title with emoji",
  "summary": "1-2 line summary (markdown allowed)",
  "sections": [
    {"heading": "Section title", "body_markdown": "Content with lists, links, etc."}
  ],
  "quick_replies": ["Question 1? ", "Question 2?"],
  "cta": {"label": "Action", "action": "open_map", "data": {}}
}

RULES:
- Friendly, concise tone
- Use emojis naturally in title/summary
- Markdown in summary/body_markdown for formatting
- Always include 2-4 quick_replies
- Return ONLY valid JSON (no code fences, no extra text)
"""

        final_messages = [
            {"role": "system", "content": system_prompt},
            *history_messages,
            {"role": "user", "content": req.message}
        ]

        raw_response = hf_chat(final_messages)

        print("=== AI RAW RESPONSE ===")
        print(raw_response[: 500])  # Print first 500 chars
        print("======================")

        # Try multiple parsing strategies
        structured = None
        
        # Strategy 1: Extract JSON from markdown fence
        structured = extract_json_from_text(raw_response)
        
        # Strategy 2: Try direct JSON parse
        if not structured:
            try: 
                structured = json.loads(raw_response. strip())
            except:
                pass
        
        # Strategy 3: Look for JSON object anywhere in text
        if not structured:
            try:
                # Find first { and last }
                start = raw_response.find('{')
                end = raw_response.rfind('}')
                if start != -1 and end != -1:
                    json_str = raw_response[start:end+1]
                    structured = json.loads(json_str)
            except:
                pass

        # If we have valid structured response, return it
        if structured and isinstance(structured, dict):
            # Ensure it has at least a title or body
            if "title" in structured or "body_markdown" in structured or "summary" in structured:
                return {"structured": structured}

        # Fallback:  Create structured response from plain text
        print("⚠️ Falling back to plain text response")
        return {
            "structured": {
                "title": "🗨️ WanderWise",
                "body_markdown": raw_response or "I'm here to help!  Could you tell me more?  😊",
                "quick_replies": [
                    "Tell me about popular destinations",
                    "Help me plan a trip",
                    "What's the best time to visit?"
                ]
            }
        }

    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            "structured": {
                "title": "⚠️ Error",
                "body_markdown": "I'm having trouble processing that.  Could you try rephrasing?  😅",
                "quick_replies":  [
                    "Show me destinations",
                    "Help with itinerary planning"
                ]
            }
        }