from app.config import AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET
import requests


def get_google_token(refresh_token: str):
    """
    Exchanges Auth0 refresh token for Google access token via Token Vault.
    Requires Connected Accounts to be set up first.
    """

    if not refresh_token:
        return None

    url = f"https://{AUTH0_DOMAIN}/oauth/token"

    payload = {
        "client_id": AUTH0_CLIENT_ID,
        "client_secret": AUTH0_CLIENT_SECRET,
        "subject_token": refresh_token,
        "grant_type": "urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token",
        "subject_token_type": "urn:ietf:params:oauth:token-type:refresh_token",
        "requested_token_type": "http://auth0.com/oauth/token-type/federated-connection-access-token",
        "connection": "google-oauth2"
    }

    res = requests.post(url, json=payload)
    data = res.json()

    if res.status_code != 200:
        return None

    return data.get("access_token")