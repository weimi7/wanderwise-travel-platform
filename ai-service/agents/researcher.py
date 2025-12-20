from utils.hf_client import hf_chat

class ResearcherAgent:

    SYSTEM_PROMPT = (
        "You are an expert travel researcher. Provide structured, factual, "
        "easy-to-read destination insights that will be used by a travel application."
    )

    def run(self, user_prompt: str):
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
        return hf_chat(messages)
