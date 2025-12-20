from utils.hf_client import hf_chat

class TipsAgent:

    SYSTEM_PROMPT = (
        "You are a helpful travel assistant. Provide safety tips, cultural advice, "
        "packing guidance, and must-know information about the user's destination."
    )

    def run(self, user_prompt: str):
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
        return hf_chat(messages)
