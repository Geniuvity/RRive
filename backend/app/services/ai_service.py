import requests
from app.config import SARVAM_API_KEY
import re

SARVAM_URL = "https://api.sarvam.ai/v1/chat/completions"


def clean_response(text: str):
    """
    Removes tool calling or thinking blocks from the model's raw output.
    Strips any special tags (like think-blocks) and extra whitespace.
    Returns a clean, readable text string for the user.
    """

    # Removes <think> blocks
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)

    # Removes any leftover tags just in case
    text = re.sub(r"</?think>", "", text)

    return text.strip()


def generate_text(prompt: str) -> str:
    """
    Sends a text prompt to the Sarvam AI model and gets a clean reply.
    Handles API errors and returns a safe fallback message if anything fails.
    Used by the agent to generate AI responses and summaries.
    """

    try:
        response = requests.post(
            SARVAM_URL,
            headers={
                "Authorization": f"Bearer {SARVAM_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "sarvam-105b",
                "messages": [
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.1,
            },
        )

        if response.status_code != 200:
            print("Sarvam Error:", response.text)
            return "Error generating response."

        data = response.json()

        raw_text = data["choices"][0]["message"]["content"]

        cleaned_text = clean_response(raw_text)

        return cleaned_text



    except Exception as e:
        print("Sarvam Exception:", e)
        return "Error generating response."