import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load .env file from root
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)

key = os.environ.get("GEMINI_API_KEY")
print(f"Key: {key}")

if key:
    try:
        genai.configure(api_key=key)
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print(f"Error: {e}")
else:
    print("No key found")
