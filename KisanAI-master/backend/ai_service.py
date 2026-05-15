import os
import json
import time
import google.generativeai as genai
from datetime import datetime

class AIService:
    def __init__(self, api_key):
        self.enabled = False
        if api_key:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=(
                        "You are KisanAI, a wise and friendly agricultural expert. "
                        "Keep advice CONCISE (max 3 bullet points), ACTIONABLE, and SIMPLE. "
                        "Focus ONLY on farming. Professional and encouraging."
                    )
                )
                self.enabled = True
                print("[AIService] Gemini Engine initialized.")
            except Exception as e:
                print(f"[AIService] Initialization failed: {e}")

    def call_gemini(self, prompt, is_json=False, is_vision=False, image_data=None):
        if not self.enabled:
            return None

        for attempt in range(2): # Simple 2-attempt retry for transient issues
            try:
                if is_vision and image_data:
                    # Vision call
                    response = self.model.generate_content([
                        prompt,
                        {"mime_type": "image/jpeg", "data": image_data}
                    ])
                else:
                    # Text call
                    response = self.model.generate_content(prompt)
                
                return response.text
            except Exception as e:
                err_str = str(e).lower()
                if "429" in err_str or "quota" in err_str:
                    print(f"[AIService] Quota exceeded on attempt {attempt+1}")
                    return "QUOTA_EXCEEDED"
                
                print(f"[AIService] Error on attempt {attempt+1}: {e}")
                if attempt == 0:
                    time.sleep(1) # Short wait before retry
                else:
                    return None
        return None

# Global instance will be initialized in app.py
