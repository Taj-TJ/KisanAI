import requests
import os
from dotenv import load_dotenv

# Load .env file from root
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)
mandi_key = os.environ.get("MANDI_API_KEY")
resource_id = os.environ.get("MANDI_RESOURCE_ID", "35985678-0d79-46b4-9ed6-6f13308a1d24")

print(f"Testing Mandi API with key: {mandi_key[:5]}...")
url = f"https://api.data.gov.in/resource/{resource_id}?api-key={mandi_key}&format=json&limit=1"

try:
    resp = requests.get(url, timeout=5)
    print("Status:", resp.status_code)
    print(resp.json())
except Exception as e:
    print("Error:", e)
