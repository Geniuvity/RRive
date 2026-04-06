import requests
import json
from app.config import AUTH0_DOMAIN, AUTH0_MGMT_API_TOKEN


def debug_auth0_user(user_id: str):
    """
    Fetches user details from Auth0 Management API for debugging.
    Returns the full user object from Auth0 for the given user ID.
    It is useful during development to inspect connections and metadata.
    """

    url = f"https://{AUTH0_DOMAIN}/api/v2/users/{user_id}"

    headers = {
        "Authorization": f"Bearer {AUTH0_MGMT_API_TOKEN}"
    }

    res = requests.get(url, headers=headers)

    return res.json()


def upload_to_drive(token: str, file_path: str, file_name: str):
    """
    Uploads a PDF file to the user's Google Drive.
    Uses the provided Google token, file path, and name.
    Returns a success message with file ID or an error message if it fails.
    """

    if not token:
        return " Google Drive not available. Please login with Google."

    url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"

    headers = {
        "Authorization": f"Bearer {token}",
    }

    metadata = {
        "name": file_name,
        "mimeType": "application/pdf"
    }

    with open(file_path, "rb") as f:
        files = {
            "metadata": (
                "metadata",
                json.dumps(metadata), 
                "application/json; charset=UTF-8"
            ),
            "file": (
                file_name,
                f,
                "application/pdf"
            ),
        }

        res = requests.post(url, headers=headers, files=files)

    if res.status_code not in [200, 201]:
        print("Drive upload failed:", res.text)
        return "Failed to save to Google Drive."

    file_id = res.json().get("id")
    return f"Summary saved to Google Drive! File ID: {file_id}"