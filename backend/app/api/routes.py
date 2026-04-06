from fastapi import APIRouter, Depends, Request
from app.auth.auth0_handler import get_current_user
from app.agent.agent_controller import handle_user_query, handle_save_to_drive
from app.models.schemas import ChatRequest
from app.auth.token_vault import get_google_token
import requests

router = APIRouter()

@router.get("/protected")
def protected_route(user=Depends(get_current_user)):
    """
    Tests the endpoint that requires authentication.
    Shows a simple success message and returns the logged-in user information.
    """
    return {"message": "Access granted", "user": user}


@router.post("/chat")
def chat(request: Request, body: ChatRequest, user=Depends(get_current_user)):
    """
    Main chat endpoint for user queries.
    Passes the message to the agent controller and returns the response.
    Also uses the user's Google refresh token if available.
    """
    refresh_token = request.session.get("refresh_token")
    response = handle_user_query(body.message, user, refresh_token)
    return response


@router.post("/save-to-drive")
def save_to_drive(request: Request, user=Depends(get_current_user)):
    """
    Endpoint to save a generated summary to Google Drive.
    Called when the user clicks Approve in the chat UI.
    Uses the user's Google refresh token and session data.
    """
    refresh_token = request.session.get("refresh_token")
    user_id = user.get("sub", "default_user")
    response = handle_save_to_drive(user_id, refresh_token)
    return response


@router.get("/drive-files")
def get_drive_files(request: Request, user=Depends(get_current_user)):
    """
    Fetches PDF files saved by the app from the user's Google Drive.
    Returns a list of file names, IDs, and links, sorted by creation time.
    If no token or error occurs, returns an empty list with an error message.
    """
    refresh_token = request.session.get("refresh_token")
    google_token = get_google_token(refresh_token)

    if not google_token:
        return {"files": [], "error": "Google Drive not available"}

    # Fetch files from Google Drive - only files created by this app
    res = requests.get(
        "https://www.googleapis.com/drive/v3/files",
        headers={"Authorization": f"Bearer {google_token}"},
        params={
            "fields": "files(id, name, createdTime, webViewLink)",
            "orderBy": "createdTime desc",
            "pageSize": 20,
            "q": "mimeType='application/pdf'"
        }
    )

    if res.status_code != 200:
        print("Drive files fetch failed:", res.text)
        return {"files": [], "error": "Failed to fetch files"}

    return {"files": res.json().get("files", [])}