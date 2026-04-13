# utils.py — Multilingual response dictionary

RESPONSES = {
    "pest": {
        "en": "🌿 Pest Alert: Use neem oil spray or an appropriate pesticide. Inspect leaves daily. Avoid spraying before rain. Remove infected plants to prevent spreading.",
        "hi": "🌿 कीट चेतावनी: नीम का तेल या उचित कीटनाशक का उपयोग करें। रोजाना पत्तियों की जांच करें। बारिश से पहले छिड़काव न करें। प्रसार रोकने के लिए संक्रमित पौधों को हटाएं।",
        "pa": "🌿 ਕੀੜੇ ਚੇਤਾਵਨੀ: ਨਿੰਮ ਦਾ ਤੇਲ ਜਾਂ ਉਚਿਤ ਕੀਟਨਾਸ਼ਕ ਵਰਤੋ। ਰੋਜ਼ਾਨਾ ਪੱਤਿਆਂ ਦੀ ਜਾਂਚ ਕਰੋ। ਮੀਂਹ ਤੋਂ ਪਹਿਲਾਂ ਛਿੜਕਾਅ ਨਾ ਕਰੋ। ਸੰਕਰਮਿਤ ਪੌਦਿਆਂ ਨੂੰ ਹਟਾਓ।",
        "ml": "🌿 കീട മുന്നറിയിപ്പ്: വേപ്പ് എണ്ണ അല്ലെങ്കിൽ ഉചിതമായ കീടനാശിനി ഉപയോഗിക്കുക. ദിനംപ്രതി ഇലകൾ പരിശോധിക്കുക. മഴയ്ക്ക് മുമ്പ് തളിക്കരുത്. രോഗബാധിത ചെടികൾ നീക്കം ചെയ്യുക."
    },
    "fertilizer": {
        "en": "🌱 Fertilizer Advice: Use balanced NPK fertilizer based on soil test. Apply nitrogen (urea) at early growth stage. Use organic compost to improve soil health. Avoid over-fertilizing.",
        "hi": "🌱 उर्वरक सलाह: मिट्टी परीक्षण के आधार पर संतुलित NPK उर्वरक का उपयोग करें। प्रारंभिक विकास चरण में नाइट्रोजन (यूरिया) लगाएं। मिट्टी की सेहत सुधारने के लिए जैविक खाद का उपयोग करें।",
        "pa": "🌱 ਖਾਦ ਸਲਾਹ: ਮਿੱਟੀ ਦੀ ਜਾਂਚ ਦੇ ਅਧਾਰ 'ਤੇ ਸੰਤੁਲਿਤ NPK ਖਾਦ ਵਰਤੋ। ਸ਼ੁਰੂਆਤੀ ਵਿਕਾਸ ਪੜਾਅ 'ਤੇ ਨਾਈਟ੍ਰੋਜਨ (ਯੂਰੀਆ) ਲਗਾਓ। ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਸੁਧਾਰਨ ਲਈ ਜੈਵਿਕ ਖਾਦ ਵਰਤੋ।",
        "ml": "🌱 വളം ഉപദേശം: മണ്ണ് പരിശോധനയുടെ അടിസ്ഥാനത്തിൽ ബാലൻസ്ഡ് NPK വളം ഉപയോഗിക്കുക. വളർച്ചയുടെ ആദ്യഘട്ടത്തിൽ നൈട്രജൻ (യൂറിയ) പ്രയോഗിക്കുക. ജൈവ കമ്പോസ്റ്റ് ഉപയോഗിക്കുക."
    },
    "crop": {
        "en": "🌾 Crop Advisory: Choose crops based on your soil type, local climate, and current season. Rotate crops to maintain soil fertility. Use certified hybrid seeds for better yield. Kharif crops: rice, maize, cotton. Rabi crops: wheat, mustard, gram.",
        "hi": "🌾 फसल सलाह: मिट्टी के प्रकार, स्थानीय जलवायु और मौसम के आधार पर फसलें चुनें। मिट्टी की उर्वरता बनाए रखने के लिए फसल चक्र अपनाएं। बेहतर उपज के लिए प्रमाणित हाइब्रिड बीजों का उपयोग करें।",
        "pa": "🌾 ਫਸਲ ਸਲਾਹ: ਮਿੱਟੀ ਦੀ ਕਿਸਮ, ਸਥਾਨਕ ਜਲਵਾਯੂ ਅਤੇ ਮੌਸਮ ਦੇ ਆਧਾਰ 'ਤੇ ਫਸਲਾਂ ਚੁਣੋ। ਮਿੱਟੀ ਦੀ ਉਪਜਾਊ ਸ਼ਕਤੀ ਬਣਾਈ ਰੱਖਣ ਲਈ ਫਸਲ ਚੱਕਰ ਅਪਣਾਓ।",
        "ml": "🌾 വിള ഉപദേശം: മണ്ണിന്റെ തരം, പ്രാദേശിക കാലാവസ്ഥ, ഋതു എന്നിവ അടിസ്ഥാനമാക്കി വിളകൾ തിരഞ്ഞെടുക്കുക. മണ്ണിന്റെ ഫലഭൂയിഷ്ഠത നിലനിർത്താൻ വിള പരിക്രമണം നടത്തുക."
    },
    "irrigation": {
        "en": "💧 Irrigation Advice: Water crops early morning or late evening to minimize evaporation. Drip irrigation saves 40-50% water. Avoid overwatering — check soil moisture before irrigating. Schedule based on crop growth stage and weather.",
        "hi": "💧 सिंचाई सलाह: वाष्पीकरण कम करने के लिए सुबह या शाम को सिंचाई करें। ड्रिप सिंचाई 40-50% पानी बचाती है। अत्यधिक सिंचाई से बचें — सिंचाई से पहले मिट्टी की नमी जांचें।",
        "pa": "💧 ਸਿੰਚਾਈ ਸਲਾਹ: ਭਾਫ਼ਬੰਦੀ ਘਟਾਉਣ ਲਈ ਸਵੇਰੇ ਜਾਂ ਸ਼ਾਮ ਨੂੰ ਸਿੰਚਾਈ ਕਰੋ। ਡ੍ਰਿਪ ਸਿੰਚਾਈ 40-50% ਪਾਣੀ ਬਚਾਉਂਦੀ ਹੈ। ਜ਼ਿਆਦਾ ਸਿੰਚਾਈ ਤੋਂ ਬਚੋ।",
        "ml": "💧 ജലസേചന ഉപദേശം: ബാഷ്പീകരണം കുറയ്ക്കാൻ രാവിലെ അല്ലെങ്കിൽ വൈകുന്നേരം നനയ്ക്കുക. തുള്ളി ജലസേചനം 40-50% വെള്ളം ലാഭിക്കുന്നു. അമിതമായി നനയ്ക്കാതിരിക്കുക."
    },
    "default": {
        "en": "🤔 I'm not sure about that specific query. Please ask about: pests & diseases, fertilizers, crop selection, or irrigation methods. I'm here to help with your farming needs!",
        "hi": "🤔 मुझे उस विशिष्ट प्रश्न के बारे में यकीन नहीं है। कृपया पूछें: कीट और रोग, उर्वरक, फसल चयन, या सिंचाई विधियों के बारे में।",
        "pa": "🤔 ਮੈਨੂੰ ਉਸ ਖਾਸ ਸਵਾਲ ਬਾਰੇ ਯਕੀਨ ਨਹੀਂ। ਕਿਰਪਾ ਕਰਕੇ ਪੁੱਛੋ: ਕੀੜੇ ਅਤੇ ਬਿਮਾਰੀਆਂ, ਖਾਦ, ਫਸਲ ਚੋਣ, ਜਾਂ ਸਿੰਚਾਈ ਵਿਧੀਆਂ ਬਾਰੇ।",
        "ml": "🤔 ആ നിർദ്ദിഷ്ട ചോദ്യത്തെക്കുറിച്ച് എനിക്ക് ഉറപ്പില്ല. ദയവായി ചോദിക്കുക: കീടങ്ങൾ, വളങ്ങൾ, വിള തിരഞ്ഞെടുക്കൽ, അല്ലെങ്കിൽ ജലസേചന രീതികൾ."
    }
}


def get_response(intent: str, language: str) -> str:
    lang = language if language in ["en", "hi", "pa", "ml"] else "en"
    category = intent if intent in RESPONSES else "default"
    return RESPONSES[category][lang]
