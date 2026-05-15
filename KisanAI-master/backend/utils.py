# utils.py -- Utility functions and high-fidelity fallbacks

def get_expert_advice(intent, language="en"):
    """
    Returns high-quality, intent-specific agricultural advice when AI is offline.
    """
    # Expert-curated responses for common farming intents
    database = {
        "crop": {
            "en": "Focus on high-demand local crops like Wheat or Mustard. Ensure certified seeds and check soil pH (6.5-7.5) before sowing.",
            "hi": "गेहूं या सरसों जैसी उच्च मांग वाली स्थानीय फसलों पर ध्यान दें। प्रमाणित बीजों का उपयोग करें और बुवाई से पहले मिट्टी के पीएच (6.5-7.5) की जांच करें।",
            "pa": "ਕਣਕ ਜਾਂ ਸਰ੍ਹੋਂ ਵਰਗੀਆਂ ਉੱਚ ਮੰਗ ਵਾਲੀਆਂ ਸਥਾਨਕ ਫ਼ਸਲਾਂ 'ਤੇ ਧਿਆਨ ਦਿਓ। ਪ੍ਰਮਾਣਿਤ ਬੀਜਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ ਅਤੇ ਬਿਜਾਈ ਤੋਂ ਪਹਿਲਾਂ ਮਿੱਟੀ ਦੇ ਪੀਐਚ (6.5-7.5) ਦੀ ਜਾਂਚ ਕਰੋ।"
        },
        "pest": {
            "en": "Monitor for early signs of infestation. Use Neem Oil (1500ppm) for organic control or consult a local officer for specific pesticides.",
            "hi": "कीड़ों के शुरुआती संकेतों की निगरानी करें। जैविक नियंत्रण के लिए नीम के तेल (1500ppm) का उपयोग करें या कीटनाशकों के लिए स्थानीय अधिकारी से सलाह लें।",
            "pa": "ਕੀੜਿਆਂ ਦੇ ਸ਼ੁਰੂਆਤੀ ਸੰਕੇਤਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ। ਜੈਵਿਕ ਨਿਯੰਤਰਣ ਲਈ ਨਿੰਮ ਦੇ ਤੇਲ (1500ppm) ਦੀ ਵਰਤੋਂ ਕਰੋ।"
        },
        "fertilizer": {
            "en": "Apply fertilizers based on soil test reports. Generally, NPK 12:32:16 is effective for grain crops during initial growth stages.",
            "hi": "मिट्टी परीक्षण रिपोर्ट के आधार पर उर्वरक डालें। अनाज की फसलों के लिए शुरुआती चरणों में एनपीके 12:32:16 प्रभावी होता है।",
            "pa": "ਮਿੱਟੀ ਟੈਸਟ ਰਿਪੋਰਟਾਂ ਦੇ ਅਧਾਰ ਤੇ ਖਾਦਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ। ਅਨਾਜ ਦੀਆਂ ਫ਼ਸਲਾਂ ਲਈ ਐਨਪੀਕੇ 12:32:16 ਪ੍ਰਭਾਵਸ਼ਾਲੀ ਹੁੰਦਾ ਹੈ।"
        },
        "weather": {
            "en": "Stay alert to sudden temperature shifts. Ensure proper drainage to avoid waterlogging during unexpected rainfall.",
            "hi": "अचानक तापमान परिवर्तन के प्रति सतर्क रहें। अचानक बारिश के दौरान जलभराव से बचने के लिए उचित जल निकासी सुनिश्चित करें।",
            "pa": "ਤਾਪਮਾਨ ਵਿੱਚ ਅਚਾਨਕ ਤਬਦੀਲੀ ਪ੍ਰਤੀ ਸੁਚੇਤ ਰਹੋ। ਮੀਂਹ ਦੌਰਾਨ ਪਾਣੀ ਦੇ ਨਿਕਾਸ ਦਾ ਪ੍ਰਬੰਧ ਰੱਖੋ।"
        },
        "offline": {
            "en": "The live advisory engine is currently updating. Please follow standard seasonal practices for your region.",
            "hi": "लाइव एडवाइजरी इंजन वर्तमान में अपडेट हो रहा है। कृपया अपने क्षेत्र के लिए मानक मौसमी प्रथाओं का पालन करें।",
            "pa": "ਲਾਈਵ ਐਡਵਾਈਜ਼ਰੀ ਇੰਜਣ ਅਪਡੇਟ ਹੋ ਰਿਹਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਖੇਤਰ ਲਈ ਮਿਆਰੀ ਮੌਸਮੀ ਅਭਿਆਸਾਂ ਦੀ ਪਾਲਣਾ ਕਰੋ।"
        }
    }

    intent_data = database.get(intent, database["offline"])
    return intent_data.get(language, intent_data["en"])

def get_fallback_recommendations(soil, season):
    """Rule-based recommendations when AI is unreachable."""
    if season.lower() == 'rabi':
        return [
            {"name": "Wheat", "reason": f"Excellent fit for {soil} soil in winter. High demand in regional mandis.", "profit": "High", "cycle": "120-140"},
            {"name": "Mustard", "reason": "Low water requirement and pest resistant. Great for winter rotation.", "profit": "Medium", "cycle": "110-130"},
            {"name": "Chickpea", "reason": "Restores nitrogen levels in soil. Minimal fertilizer required.", "profit": "Medium", "cycle": "100-120"}
        ]
    else: # Kharif or default
        return [
            {"name": "Rice (Basmati)", "reason": f"Highly profitable for {soil} soil with monsoon irrigation.", "profit": "High", "cycle": "130-150"},
            {"name": "Soybean", "reason": "Stable market price and nitrogen-fixing properties.", "profit": "High", "cycle": "90-100"},
            {"name": "Maize", "reason": "Fast growing and versatile for feed and food markets.", "profit": "Medium", "cycle": "80-110"}
        ]

def get_response(intent, language="en"):
    """Legacy wrapper for backward compatibility."""
    return get_expert_advice(intent, language)
