# Simple in-memory storage (per user)
memory_store = {}

def get_memory(user_id: str):
    """
    Returns the saved conversation history for a user.
    If no history exists, then returns an empty list.
    """
    return memory_store.get(user_id, [])

def add_to_memory(user_id: str, role: str, content: str):
    """
    Adds a new message (user or assistant) to a user's history.
    Keeps only the last 10 messages to limit memory size.
    """
    if user_id not in memory_store:
        memory_store[user_id] = []

    memory_store[user_id].append({
        "role": role,
        "content": content
    })

    # Optional: limit memory size
    memory_store[user_id] = memory_store[user_id][-10:]


# Add this new store
session_store = {}

def get_session(user_id: str):
    """
    Returns the current session data for a user.
    If no session exists, then returns an empty dictionary.
    """
    return session_store.get(user_id, {})

def update_session(user_id: str, data: dict):
    """
    Updates or creates session data for a user.
    Existing fields are kept, and new ones are added or overwritten.
    """
    if user_id not in session_store:
        session_store[user_id] = {}

    session_store[user_id].update(data)