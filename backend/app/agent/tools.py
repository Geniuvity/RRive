from app.services.github_service import search_repositories, get_repo_readme
from app.services.pdf_service import create_pdf
from app.services.drive_service import upload_to_drive
from app.services.ai_service import generate_text
import os


def execute_tool(tool_name, tool_input, page=1, google_token=None, user_id=None):
    """
    Runs the requested tool and returns its result.
    Supports GitHub search, repo summarization, and saving to Google Drive.
    Handles missing or invalid tokens and cleans up temporary files afterwards.
    """

    if tool_name == "github_search":
        return search_repositories(tool_input, page)

    if tool_name == "summarize_repo":
        readme = get_repo_readme(tool_input)
        summary = generate_text(
            f"""Summarize this GitHub repository clearly for the user.
            Include: purpose, main features, tech stack, and who it's for.
            Do NOT use JSON. Write in clean readable paragraphs.
            
            Repository: {tool_input}
            README content: {readme}
            """
        )
        return summary

    if tool_name == "save_summary":
        if not google_token:
            return "Google Drive not available. Please login with Google."

        # ← tool_input is now the actual summary text, not a keyword
        summary = tool_input

        if not summary:
            return "No summary to save."

        file_path, file_name = create_pdf("repo_summary", summary)
        result = upload_to_drive(google_token, file_path, file_name)

        if os.path.exists(file_path):
            os.remove(file_path)

        return result

    return "Tool not found."