import requests
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse, JSONResponse
from authlib.integrations.starlette_client import OAuth
from app.config import (
    AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_AUDIENCE, FRONTEND_URL, BACKEND_URL)
from app.auth.connected_accounts import (
    get_my_account_token,
    initiate_connected_account,
    complete_connected_account,
    check_connected_accounts
)

auth_router = APIRouter(prefix="/auth")

oauth = OAuth()
oauth.register(
    name="auth0",
    server_metadata_url=f'https://{AUTH0_DOMAIN}/.well-known/openid-configuration',
    client_id=AUTH0_CLIENT_ID,
    client_secret=AUTH0_CLIENT_SECRET,
    client_kwargs={
        "scope": "openid profile email offline_access",
        "audience": AUTH0_AUDIENCE,
    },
)


@auth_router.get("/login")
async def login(request: Request):
    """
    Starts the Auth0 login flow.
    Redirects the user to Auth0 with Google OAuth for login.
    Requests an offline refresh token for later use.
    """

    redirect_uri = f'{BACKEND_URL}/auth/callback'
    return await oauth.auth0.authorize_redirect(
        request,
        redirect_uri,
        connection="google-oauth2",
        access_type="offline",
        prompt="consent",
    )


@auth_router.get("/callback")
async def callback(request: Request):
    try:
        token = await oauth.auth0.authorize_access_token(request)
    except Exception as e:
        print("Callback error:", e)
        return RedirectResponse(url=f'{FRONTEND_URL}?error=login_failed')

    user_info = token.get("userinfo")

    if not user_info:
        return RedirectResponse(url=f'{FRONTEND_URL}?error=login_failed')

    request.session["user"] = dict(user_info)
    request.session["access_token"] = token.get("access_token")
    request.session["refresh_token"] = token.get("refresh_token")

    print("Session saved for user:", user_info.get("email"))  # ← debug log
    print("Session contents:", dict(request.session))         # ← debug log

    return RedirectResponse(url=FRONTEND_URL)

@auth_router.get("/me")
async def me(request: Request):
    """
    Returns the currently logged-in user information from the session.
    Returns None if the user is not logged in.
    """

    user = request.session.get("user")
    if not user:
        return None
    return user


@auth_router.get("/logout")
async def logout(request: Request):
    """
    Logs the user out by clearing the session.
    Redirects to Auth0 logout page which sends the user back to the frontend.
    """

    request.session.clear()
    return RedirectResponse(
        url=(
            f'https://{AUTH0_DOMAIN}/v2/logout'
            f'?returnTo={FRONTEND_URL}'
            f'&client_id={AUTH0_CLIENT_ID}'
        )
    )


@auth_router.get("/connect-google")
async def connect_google(request: Request):
    """
    Initiates Connected Accounts flow to store Google tokens in Token Vault.
    It is called after login to connect Google Drive.
    """

    # Checks session first
    if request.session.get("google_connected"):
        return JSONResponse({"status": "already_connected"})

    refresh_token = request.session.get("refresh_token")
    if not refresh_token:
        return JSONResponse({"error": "Not authenticated"}, status_code=401)

    # Get My Account API token
    my_account_token = get_my_account_token(refresh_token)
    if not my_account_token:
        return JSONResponse({"error": "Failed to get My Account API token"}, status_code=500)

    # Check if already connected
    already_connected = check_connected_accounts(my_account_token)
    if already_connected:
        request.session["google_connected"] = True
        return JSONResponse({"status": "already_connected"})

    # Initiate Connected Accounts flow
    redirect_uri = f'{BACKEND_URL}/auth/connected-accounts/callback'
    auth_session, connect_uri, ticket = initiate_connected_account(
        my_account_token,
        redirect_uri
    )

    if not auth_session:
        return JSONResponse({"error": "Failed to initiate Connected Accounts"}, status_code=500)

    # Store auth_session and my_account_token in session for callback
    request.session["ca_auth_session"] = auth_session
    request.session["ca_my_account_token"] = my_account_token
    request.session["ca_redirect_uri"] = redirect_uri

    # Redirect user to Google consent screen
    connect_url = f"{connect_uri}?ticket={ticket}"
    return RedirectResponse(url=connect_url)


@auth_router.get("/connected-accounts/callback")
async def connected_accounts_callback(request: Request):
    """
    Called after user authorizes Google in the Connected Accounts flow.
    Completes the flow and stores tokens in Token Vault.
    """
    
    connect_code = request.query_params.get("connect_code") or request.query_params.get("code")

    auth_session = request.session.get("ca_auth_session")
    my_account_token = request.session.get("ca_my_account_token")
    redirect_uri = request.session.get("ca_redirect_uri")

    if not connect_code or not auth_session:
        return RedirectResponse(url=f'{FRONTEND_URL}?error=connect_failed')

    # Complete the Connected Accounts flow
    result = complete_connected_account(
        my_account_token,
        auth_session,
        connect_code,
        redirect_uri
    )

    if not result:
        return RedirectResponse(url=f'{FRONTEND_URL}?error=connect_failed')

    # Clean up session
    request.session.pop("ca_auth_session", None)
    request.session.pop("ca_my_account_token", None)
    request.session.pop("ca_redirect_uri", None)

    # Mark Google as connected in session
    request.session["google_connected"] = True

    return RedirectResponse(url=f'{FRONTEND_URL}?google_connected=true')