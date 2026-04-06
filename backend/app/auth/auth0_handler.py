from fastapi import Request, HTTPException

def get_current_user(request: Request):
    """
    Extracts the currently logged‑in user from the session.
    Raises a 401 error if no user is found in the session.
    Used as a dependency to protect routes that require login.
    """
     
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user