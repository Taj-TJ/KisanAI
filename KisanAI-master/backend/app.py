# app.py -- Flask API server

from flask import Flask, request, jsonify
from flask_cors import CORS
from model import load_model, predict, train_and_save
from utils import get_response
import os
import requests
import random
from dotenv import load_dotenv

# Load .env file
load_dotenv()

from prisma import Prisma
import bcrypt
import jwt
from datetime import datetime, timedelta
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Initialize Prisma
db = Prisma()

# JWT & API Config
JWT_SECRET = os.environ.get("JWT_SECRET", "kisanai-secret-vibe-2026")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

gemini_model = None
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel(
            model_name="gemini-flash-latest",
            system_instruction=(
                "You are KisanAI, a professional agricultural expert. "
                "Provide concise, actionable advice to Indian farmers. "
                "Use simple language. Focus on pests, fertilizers, crop selection, and irrigation."
            )
        )
        print("[app] Gemini AI Engine ready.")
    except Exception as e:
        print(f"[app] Gemini initialization failed: {e}")

# Connect to DB at startup
try:
    db.connect()
    print("[app] Connected to Prisma DB.")
except Exception as e:
    print(f"[app] DB connection failed: {e}")

# Train/load model at startup
print("[app] Loading model...")
model = load_model()
print("[app] Model ready.")

# Removed redundant before_request connection check as we connect at startup

def create_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY", "")


# ─── Auth ────────────────────────────────────────────────────────────
@app.route("/auth/signup", methods=["POST"])
def signup():
    body = request.get_json(silent=True) or {}
    email = body.get("email")
    password = body.get("password")
    name = body.get("name", "")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        user = db.user.create(data={
            "email": email,
            "password": hashed,
            "name": name
        })
        token = create_token(user.id)
        return jsonify({
            "message": "User created",
            "token": token,
            "user": {"id": user.id, "email": user.email, "name": user.name}
        }), 201
    except Exception as e:
        error_msg = str(e)
        print(f"[auth] Signup error: {error_msg}")
        if "unique constraint" in error_msg.lower() or "already exists" in error_msg.lower():
            return jsonify({"error": "A user with this email already exists"}), 400
        return jsonify({"error": f"Database error: {error_msg}"}), 500

@app.route("/auth/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    try:
        user = db.user.find_unique(where={"email": email})
        if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            token = create_token(user.id)
            return jsonify({
                "token": token,
                "user": {"id": user.id, "email": user.email, "name": user.name}
            })
    except Exception as e:
        print(f"[auth] Login error: {e}")
        return jsonify({"error": "Server error during login"}), 500

    return jsonify({"error": "Invalid email or password"}), 401


# ─── Health ───────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "OK", "message": "Farmer AI backend is running."})


# ─── Chat Query ───────────────────────────────────────────────────────
@app.route("/query", methods=["POST"])
def query():
    body = request.get_json(silent=True)
    if not body or "text" not in body:
        return jsonify({"error": "Missing 'text' field"}), 400

    user_text = body.get("text", "").strip()
    language  = body.get("language", "en").strip().lower()

    if not user_text:
        return jsonify({"error": "Empty text"}), 400

    intent   = predict(user_text, model)
    
    # --- Try Gemini for high-quality response ---
    if GEMINI_API_KEY:
        try:
            prompt = f"User asks in {language}: {user_text}"
            res = gemini_model.generate_content(prompt)
            response = res.text
        except Exception as e:
            print(f"[chat] Gemini error: {e}")
            response = get_response(intent, language)
    else:
        response = get_response(intent, language)

    return jsonify({
        "response": response,
        "intent":   intent,
        "language": language
    })


# ─── Retrain ──────────────────────────────────────────────────────────
@app.route("/retrain", methods=["POST"])
def retrain():
    global model
    model = train_and_save()
    return jsonify({"status": "Model retrained successfully."})


# ─── Weather (proxy to OpenWeatherMap) ────────────────────────────────
@app.route("/weather", methods=["GET"])
def get_weather():
    lat = request.args.get("lat", "28.6139")
    lon = request.args.get("lon", "77.2090")
    # --- Try live OpenWeatherMap if key is configured ---
    if OPENWEATHER_API_KEY:
        try:
            # Current weather
            cur_url = (
                f"https://api.openweathermap.org/data/2.5/weather"
                f"?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
            )
            cur = requests.get(cur_url, timeout=8).json()

            # 5-day forecast (3-hour steps)
            fc_url = (
                f"https://api.openweathermap.org/data/2.5/forecast"
                f"?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric&cnt=40"
            )
            fc = requests.get(fc_url, timeout=8).json()

            # Build daily forecast (pick one entry per day)
            days = {}
            for item in fc.get("list", []):
                date_str = item["dt_txt"].split(" ")[0]
                if date_str not in days and len(days) < 5:
                    days[date_str] = {
                        "date": date_str,
                        "temp_high": round(item["main"]["temp_max"]),
                        "temp_low":  round(item["main"]["temp_min"]),
                        "description": item["weather"][0]["description"],
                        "icon": item["weather"][0]["icon"],
                        "humidity": item["main"]["humidity"],
                        "wind": round(item["wind"]["speed"] * 3.6, 1),
                    }

            # --- Use Gemini for expert farming advice based on weather ---
            ai_alerts = []
            if GEMINI_API_KEY:
                try:
                    advice_prompt = (
                        f"Current weather in {cur.get('name', 'this area')}: {cur['main']['temp']}°C, "
                        f"{cur['weather'][0]['description']}, {cur['main']['humidity']}% humidity. "
                        "Provide 2-3 short, expert farming alerts for an Indian farmer today based on these conditions."
                    )
                    ai_res = gemini_model.generate_content(advice_prompt)
                    ai_alerts = [line.strip("- ").strip() for line in ai_res.text.strip().split("\n") if line.strip()]
                except:
                    ai_alerts = ["Monitor soil moisture regularly.", "Check for pest activity in current conditions."]

            return jsonify({
                "source": "live",
                "location": cur.get("name", "Current Location"),
                "current": {
                    "temp": round(cur["main"]["temp"]),
                    "feels_like": round(cur["main"]["feels_like"]),
                    "humidity": cur["main"]["humidity"],
                    "wind": round(cur["wind"]["speed"] * 3.6, 1),
                    "description": cur["weather"][0]["description"],
                    "icon": cur["weather"][0]["icon"],
                    "sunrise": cur.get("sys", {}).get("sunrise"),
                    "sunset": cur.get("sys", {}).get("sunset"),
                },
                "forecast": list(days.values()),
                "alerts": ai_alerts,
            })

        except Exception as e:
            print(f"[weather] API error: {e}")
            return jsonify({"error": "Weather service unavailable"}), 503

    return jsonify({"error": "Weather API key missing"}), 500


# ─── Crop Prices (proxy + mock) ──────────────────────────────────────
@app.route("/prices", methods=["GET"])
def crop_prices():
    # In production, this would call a real Mandi API like data.gov.in or agmarknet.
    # For now, we generate realistic randomised prices each call to simulate "live" data.

    mandi_key = os.environ.get("MANDI_API_KEY")
    resource_id = os.environ.get("MANDI_RESOURCE_ID", "35985678-0d79-46b4-9ed6-6f13308a1d24")
    
    live_prices = []
    if mandi_key:
        try:
            # Fetch last 15 records for variety and freshness
            url = f"https://api.data.gov.in/resource/{resource_id}?api-key={mandi_key}&format=json&limit=15"
            resp = requests.get(url, timeout=5)
            data = resp.json()
            print(f"[mandi-api] Status: {resp.status_code}")
            
            if "records" in data:
                def safe_int(val, default=0):
                    try:
                        return int(val) if val else default
                    except:
                        return default

                for r in data["records"]:
                    base = safe_int(r.get("modal_price"))
                    min_p = safe_int(r.get("min_price"), base)
                    max_p = safe_int(r.get("max_price"), base)
                    
                    history = [
                        {"value": min_p},
                        {"value": (min_p + base)//2},
                        {"value": base},
                        {"value": (max_p + base)//2},
                        {"value": max_p}
                    ]
                    
                    live_prices.append({
                        "crop":    r.get("commodity", "Unknown"),
                        "variety": r.get("variety", "Normal"),
                        "price":   base,
                        "trend":   random.choice(["up", "down"]),
                        "change":  random.randint(5, 50),
                        "market":  f"{r.get('market', 'Local')} ({r.get('state', 'IN')})",
                        "history": history
                    })
        except Exception as e:
            print(f"[mandi-api] Error/Timeout: {e}. Using intelligent fallback.")
            
    # Intelligent Fallback if API fails or key is missing
    if not live_prices:
        base_prices = {
            "Wheat": 2200, "Rice": 2800, "Soybean": 4500, 
            "Cotton": 6000, "Mustard": 5200, "Maize": 1900,
            "Onion": 1500, "Potato": 1200, "Tomato": 1800
        }
        markets = ["Bhopal", "Indore", "Pune", "Nashik", "Karnal", "Amritsar"]
        for crop, base in base_prices.items():
            current_price = base + random.randint(-200, 200)
            history = [{"value": current_price + random.randint(-100, 100)} for _ in range(5)]
            live_prices.append({
                "crop": crop,
                "variety": "Common",
                "price": current_price,
                "trend": random.choice(["up", "down"]),
                "change": random.randint(10, 100),
                "market": f"{random.choice(markets)} (Fallback)",
                "history": history
            })

    return jsonify({
        "prices": live_prices, 
        "updated_at": datetime.now().isoformat(),
        "source": "Agmarknet (Official)" if live_prices else "Service Unavailable"
    })


# ─── Price AI Analysis ──────────────────────────────────────────────
@app.route("/prices/analysis", methods=["GET"])
def price_analysis():
    # In a real app, we'd fetch the latest prices from the DB or Mandi API
    # Here we'll generate the same base list to analyze
    base_crops = ["Wheat", "Rice", "Soybean", "Cotton", "Mustard"]
    
    if not gemini_model:
        return jsonify({"analysis": "AI Analysis unavailable. Check API configuration."})

    try:
        prompt = (
            f"Analyze the current market situation for these crops in India: {', '.join(base_crops)}. "
            "Provide a short, expert summary (3-4 sentences) for a farmer. "
            "Tell them which crop has the best selling potential right now and why. "
            "Keep it professional and encouraging."
        )
        res = gemini_model.generate_content(prompt)
        return jsonify({"analysis": res.text})
    except Exception as e:
        print(f"[price-ai] Analysis error: {e}")
        return jsonify({"error": "Market analysis is currently offline"}), 500


# ─── Crop Recommendation (Gemini AI) ────────────────────────────────
@app.route("/recommend", methods=["POST"])
def get_recommendation():
    body = request.get_json(silent=True) or {}
    soil = body.get("soil", "Alluvial")
    season = body.get("season", "Kharif")
    water = body.get("water", "Medium")
    lat = body.get("lat")
    lon = body.get("lon")

    if not GEMINI_API_KEY:
        return jsonify({"error": "AI Engine unavailable"}), 500

    try:
        # Fetch current weather to inform the AI
        weather_info = "Unknown climate"
        if lat and lon and OPENWEATHER_API_KEY:
            try:
                w_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
                w_res = requests.get(w_url, timeout=5).json()
                if w_res.get("main"):
                    weather_info = f"{w_res['main']['temp']}°C, {w_res['weather'][0]['description']}"
            except: pass

        prompt = (
            f"You are a professional agronomist. Recommend the best 4 crops for an Indian farmer with: "
            f"Soil Type: {soil}, Season: {season}, Water Availability: {water}, Current Weather: {weather_info}. "
            "For each crop, provide: 1. Name, 2. Expert Reason, 3. Estimated profit potential (High/Medium), 4. Growth cycle (days). "
            "Format the response as a valid JSON list of objects ONLY: "
            "[{\"name\": \"...\", \"reason\": \"...\", \"profit\": \"...\", \"cycle\": \"...\"}]"
        )
        
        res = gemini_model.generate_content(prompt)
        # Extract JSON from potential markdown wrapping
        raw_text = res.text.strip().replace("```json", "").replace("```", "").strip()
        recommendations = json.loads(raw_text)
        
        return jsonify({
            "soil": soil,
            "season": season,
            "recommendations": recommendations,
            "weather_context": weather_info,
            "source": "Gemini AI Expert"
        })
    except Exception as e:
        print(f"[recommend-ai] Error: {e}")
        return jsonify({"error": "Could not generate AI recommendations"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
