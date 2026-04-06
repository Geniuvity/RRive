from pydantic import BaseModel

class ChatRequest(BaseModel):
    """
    Represents the data expected in a chat request.
    Contains only the user's message as a plain string.
    Used to validate and parse the JSON body of /chat requests.
    """
    message: str