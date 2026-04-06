import os
from dotenv import load_dotenv

load_dotenv()

# For authentication purposes - Auth0
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE")
ALGORITHMS = ["RS256"]
AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID")
AUTH0_CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET")
AUTH0_MGMT_API_TOKEN = os.getenv("AUTH0_MGMT_API_TOKEN")

# API Keys
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

# URLs
FRONTEND_URL = os.getenv("FRONTEND_URL")
BACKEND_URL = os.getenv("BACKEND_URL")

# Developer generated secret key
APP_SECRET_KEY = os.getenv("APP_SECRET_KEY")