from utils.hf_client import hf_chat

class PlannerAgent:

    SYSTEM_PROMPT = (
        "You are a professional travel itinerary planner. Your output will be used "
        "inside a travel planning application UI. Be clear, structured, and avoid hallucination."
    )

    def run(self, user_prompt: str):
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
        return hf_chat(messages)
