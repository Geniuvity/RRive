import requests
from app.config import AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET

MY_ACCOUNT_API = f"https://{AUTH0_DOMAIN}/me"


def get_my_account_token(refresh_token: str):
    """
    Exchanges the Auth0 refresh token for a My Account API token.
    Used to perform Connected Accounts operations (Google Drive link).
    Returns None if the token exchange fails.
    """
     
    url = f"https://{AUTH0_DOMAIN}/oauth/token"

    payload = {
        "grant_type": "refresh_token",
        "client_id": AUTH0_CLIENT_ID,
        "client_secret": AUTH0_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "audience": f"https://{AUTH0_DOMAIN}/me/",
        "scope": "openid profile offline_access create:me:connected_accounts read:me:connected_accounts delete:me:connected_accounts"
    }

    res = requests.post(url, json=payload)
    data = res.json()

    if res.status_code not in [200, 201]:
        return None

    return data.get("access_token")


def initiate_connected_account(my_account_token: str, redirect_uri: str):
    """
    Starts Auth0 Connected Accounts flow for Google Drive.
    Prepares a session and returns the URL where the user must consent.
    Returns auth_session, connect_uri, and ticket, or None on failure.
    """

    import secrets
    state = secrets.token_urlsafe(16)

    url = f"https://{AUTH0_DOMAIN}/me/v1/connected-accounts/connect"

    headers = {
        "Authorization": f"Bearer {my_account_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "connection": "google-oauth2",
        "redirect_uri": redirect_uri,
        "state": state,
        "scopes": [
            "openid",
            "profile",
            "email",
            "https://www.googleapis.com/auth/drive.file"
        ]
    }

    res = requests.post(url, json=payload, headers=headers)
    data = res.json()

    if res.status_code not in [200, 201]:
        return None, None, None

    auth_session = data.get("auth_session")
    connect_uri = data.get("connect_uri")
    ticket = data.get("connect_params", {}).get("ticket")

    return auth_session, connect_uri, ticket


def complete_connected_account(my_account_token: str, auth_session: str, connect_code: str, redirect_uri: str):
    """
    Finishes the Connected Accounts flow after user consents.
    Tells Auth0 to store the Google tokens in the Token Vault.
    Returns the server response, or None if something fails.
    """

    url = f"https://{AUTH0_DOMAIN}/me/v1/connected-accounts/complete"

    headers = {
        "Authorization": f"Bearer {my_account_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "auth_session": auth_session,
        "connect_code": connect_code,
        "redirect_uri": redirect_uri
    }

    res = requests.post(url, json=payload, headers=headers)
    data = res.json()
           
    if res.status_code not in [200, 201]:
        return None

    return data


def check_connected_accounts(my_account_token: str):
    """
    Checks if the user already has a Google Connected Account.
    Queries Auth0's accounts list and returns True if any exist.
    Returns False if the request fails or no accounts are found.
    """

    url = f"https://{AUTH0_DOMAIN}/me/v1/connected-accounts/accounts?connection=google-oauth2"

    headers = {
        "Authorization": f"Bearer {my_account_token}",
        "Content-Type": "application/json"
    }

    res = requests.get(url, headers=headers)

    if res.status_code != 200:
        return False

    data = res.json()
    accounts = data.get("accounts", [])
    return len(accounts) > 0