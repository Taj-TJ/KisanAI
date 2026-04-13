# app.py -- Flask API server

from flask import Flask, request, jsonify
from flask_cors import CORS
from model import load_model, predict, train_and_save
from utils import get_response
import os
import requests
import random

app = Flask(__name__)
CORS(app)

# Train/load model at startup
print("[app] Loading model...")
model = load_model()
print("[app] Model ready.")

OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY", "")


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
def weather():
    lat = request.args.get("lat", "28.6139")   # default: Delhi
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

            # Farm alerts
            alerts = []
            rain_prob = cur.get("rain", {}).get("1h", 0)
            if rain_prob > 0 or "rain" in cur["weather"][0].get("description", "").lower():
                alerts.append("Rain expected -- avoid pesticide spraying today.")
            if cur["main"]["humidity"] > 80:
                alerts.append("High humidity -- watch for fungal disease on crops.")
            if cur["wind"]["speed"] * 3.6 > 25:
                alerts.append("Strong winds -- secure crop covers and supports.")

            return jsonify({
                "source": "live",
                "location": cur.get("name", "Unknown"),
                "current": {
                    "temp": round(cur["main"]["temp"]),
                    "feels_like": round(cur["main"]["feels_like"]),
                    "humidity": cur["main"]["humidity"],
                    "wind": round(cur["wind"]["speed"] * 3.6, 1),
                    "description": cur["weather"][0]["description"],
                    "icon": cur["weather"][0]["icon"],
                },
                "forecast": list(days.values()),
                "alerts": alerts,
            })

        except Exception as e:
            print(f"[weather] Live API error: {e}")
            # Fall through to mock data

    # --- Mock weather data (when no API key) ---
    descriptions = ["Clear sky", "Partly cloudy", "Light rain", "Scattered clouds", "Moderate rain"]
    mock_current = {
        "temp": random.randint(28, 38),
        "feels_like": random.randint(30, 40),
        "humidity": random.randint(40, 85),
        "wind": round(random.uniform(5, 25), 1),
        "description": random.choice(descriptions),
        "icon": "02d",
    }
    mock_forecast = []
    from datetime import datetime, timedelta
    for i in range(5):
        d = datetime.now() + timedelta(days=i)
        mock_forecast.append({
            "date": d.strftime("%Y-%m-%d"),
            "temp_high": random.randint(32, 40),
            "temp_low": random.randint(22, 28),
            "description": random.choice(descriptions),
            "icon": random.choice(["01d", "02d", "09d", "10d"]),
            "humidity": random.randint(40, 80),
            "wind": round(random.uniform(5, 20), 1),
        })

    mock_alerts = []
    if mock_current["humidity"] > 70:
        mock_alerts.append("High humidity -- monitor crops for fungal diseases.")
    if "rain" in mock_current["description"].lower():
        mock_alerts.append("Rain expected -- postpone fertiliser application.")

    return jsonify({
        "source": "mock",
        "location": "Demo Location",
        "current": mock_current,
        "forecast": mock_forecast,
        "alerts": mock_alerts,
    })


# ─── Crop Prices (proxy + mock) ──────────────────────────────────────
@app.route("/prices", methods=["GET"])
def crop_prices():
    # In production, this would call a real Mandi API like data.gov.in or agmarknet.
    # For now, we generate realistic randomised prices each call to simulate "live" data.

    base_prices = {
        "Wheat":    {"variety": "Lok-1",    "base": 2650, "market": "Bhopal Mandi"},
        "Rice":     {"variety": "Basmati",  "base": 3800, "market": "Karnal Mandi"},
        "Soybean":  {"variety": "Yellow",   "base": 4700, "market": "Indore Mandi"},
        "Cotton":   {"variety": "BT",       "base": 7100, "market": "Rajkot Mandi"},
        "Mustard":  {"variety": "Black",    "base": 5200, "market": "Jaipur Mandi"},
        "Maize":    {"variety": "Hybrid",   "base": 2100, "market": "Patna Mandi"},
        "Sugarcane":{"variety": "CO-0238",  "base": 3550, "market": "Lucknow Mandi"},
        "Gram":     {"variety": "Desi",     "base": 5100, "market": "Nagpur Mandi"},
    }

    result = []
    for crop, info in base_prices.items():
        change = random.randint(-200, 250)
        result.append({
            "crop":    crop,
            "variety": info["variety"],
            "price":   info["base"] + change,
            "change":  change,
            "market":  info["market"],
        })

    return jsonify({"prices": result, "updated_at": __import__("datetime").datetime.now().isoformat()})


# ─── Crop Recommendation ─────────────────────────────────────────────
CROP_DB = {
    "alluvial":  {
        "kharif": {"high": ["Rice", "Sugarcane", "Jute", "Cotton"], "medium": ["Maize", "Bajra"], "low": ["Millets"]},
        "rabi":   {"high": ["Wheat", "Mustard", "Potato"], "medium": ["Gram", "Peas"], "low": ["Barley"]},
        "zaid":   {"high": ["Sunflower", "Moong Dal"], "medium": ["Watermelon", "Cucumber"], "low": ["Sesame"]},
    },
    "black":     {
        "kharif": {"high": ["Cotton", "Soybean", "Sugarcane"], "medium": ["Jowar", "Maize"], "low": ["Bajra"]},
        "rabi":   {"high": ["Wheat", "Chickpea", "Linseed"], "medium": ["Safflower"], "low": ["Barley"]},
        "zaid":   {"high": ["Sunflower", "Ground nut"], "medium": ["Watermelon"], "low": ["Sesame"]},
    },
    "red":       {
        "kharif": {"high": ["Groundnut", "Millets", "Rice"], "medium": ["Maize", "Ragi"], "low": ["Niger"]},
        "rabi":   {"high": ["Wheat", "Barley", "Potato"], "medium": ["Lentil", "Gram"], "low": ["Mustard"]},
        "zaid":   {"high": ["Watermelon", "Muskmelon"], "medium": ["Cucumber"], "low": ["Sesame"]},
    },
    "laterite":  {
        "kharif": {"high": ["Cashew", "Tea", "Coffee", "Rice"], "medium": ["Tapioca"], "low": ["Millets"]},
        "rabi":   {"high": ["Cassava", "Pineapple", "Sweet Potato"], "medium": ["Vegetables"], "low": ["Pulses"]},
        "zaid":   {"high": ["Banana", "Jackfruit"], "medium": ["Coconut"], "low": ["Pepper"]},
    },
}

# Climate-zone crop boosters keyed by climate keywords
CLIMATE_BOOSTERS = {
    "tropical":    ["Rice", "Sugarcane", "Coconut", "Banana", "Cotton"],
    "subtropical":  ["Wheat", "Maize", "Mustard", "Potato"],
    "arid":        ["Bajra", "Jowar", "Millets", "Groundnut"],
    "temperate":   ["Apple", "Wheat", "Barley", "Potato"],
}


@app.route("/recommend", methods=["POST"])
def recommend():
    body = request.get_json(silent=True) or {}
    soil   = body.get("soil", "alluvial").lower()
    season = body.get("season", "kharif").lower()
    water  = body.get("water", "medium").lower()
    lat    = body.get("lat")
    lon    = body.get("lon")

    soil_data = CROP_DB.get(soil, CROP_DB["alluvial"])
    season_data = soil_data.get(season, soil_data["kharif"])

    # Build candidate lists
    primary   = season_data.get("high", [])
    secondary = season_data.get("medium", [])
    tertiary  = season_data.get("low", [])

    # Select crops based on water availability
    if water == "high":
        candidates = primary + secondary
    elif water == "medium":
        candidates = primary[:2] + secondary
    else:
        candidates = primary[:1] + tertiary

    # If geolocation provided, try to look up climate and boost matching crops
    location_name = None
    if lat and lon:
        try:
            geo_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY or 'demo'}&units=metric"
            geo_data = requests.get(geo_url, timeout=5).json()
            location_name = geo_data.get("name")
            temp = geo_data.get("main", {}).get("temp", 25)

            # Determine climate zone from temperature
            if temp > 30:
                zone = "tropical"
            elif temp > 22:
                zone = "subtropical"
            elif temp > 15:
                zone = "temperate"
            else:
                zone = "arid"

            boosters = CLIMATE_BOOSTERS.get(zone, [])
            # Promote any candidate that matches booster crops
            boosted = [c for c in candidates if c in boosters]
            others  = [c for c in candidates if c not in boosters]
            candidates = boosted + others
        except Exception as e:
            print(f"[recommend] Geo lookup failed: {e}")

    # Build results (max 5)
    results = []
    for i, crop in enumerate(candidates[:5]):
        results.append({
            "name":       crop,
            "confidence": max(95 - i * 7, 50),
            "cycle":      f"{random.randint(80, 150)} days",
            "profit":     "High" if i < 2 else ("Medium" if i < 4 else "Low"),
        })

    return jsonify({
        "recommendations": results,
        "location": location_name,
        "soil": soil,
        "season": season,
        "water": water,
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
