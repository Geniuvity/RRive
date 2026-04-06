import json
from app.services.ai_service import generate_text


def decide_action(message: str, history: list):
    """
    Decides whether to use a tool or AI for this message.
    Based on the user's words and conversation history,
    it returns which tool (like GitHub or Drive) to call,
    or fall back to an AI text response.
    """


    prompt = f"""
    You are an AI agent.

    Available tools:
    1. github_search → Use when user wants to find/search repositories on GitHub
    2. summarize_repo → Use when user wants to summarize a specific repo
       (e.g. "summarize facebook/react", "tell me about torvalds/linux")
       Extract the repo in owner/repo format for the input field.
    3. save_summary → Use when user wants to save to Google Drive
       (e.g. "save to drive", "save this", "store this", "save the summary")
       ALWAYS use this tool for save requests, NEVER respond with AI text.
    4. drive_search → Use when user wants to find files in Google Drive

    Conversation history:
    {history}

    Instructions:
    - If user asks to search or find repos → use github_search
    - If user asks to summarize a repo → use summarize_repo, extract owner/repo as input
    - If user says "summarize the first repo" or "summarize the top result" →
      look at conversation history to find the first repo name and use summarize_repo
    - If user says "save", "store", "upload", "save to drive", "save this", "save the summary"
      → ALWAYS use save_summary, NEVER respond with AI text
    - If user says "show more", "more", "next" → CONTINUE previous tool
    - If explanation needed → use ai

    IMPORTANT: Respond with a single JSON object only. Do NOT wrap it in an array.

    JSON format:
    {{
      "type": "tool" or "ai",
      "tool": "tool_name (if type is tool)",
      "input": "processed user request — for summarize_repo use owner/repo format"
    }}

    User message:
    "{message}"
    """

    try:
        response = generate_text(prompt)

        if not response:
            return {"type": "ai", "input": message}

        response = response.replace("```json", "").replace("```", "").strip()
        action = json.loads(response)

        if isinstance(action, list):
            action = action[0] if action else {"type": "ai", "input": message}

        return action

    except Exception:
        return {
            "type": "ai",
            "input": message
        }