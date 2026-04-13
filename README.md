# 🌾 KisanAI — AI-Powered Agricultural Advisory System

An intelligent, multilingual farming assistant that helps Indian farmers make data-driven decisions about crops, pests, fertilisers, irrigation, and more. Built with **React + Vite** (frontend) and **Flask + scikit-learn** (backend).

![KisanAI](https://img.shields.io/badge/KisanAI-Agricultural%20AI-green?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Flask](https://img.shields.io/badge/Flask-3.x-black?style=flat-square&logo=flask)

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 **AI Chat** | NLP-powered chatbot that classifies farmer queries into pest, fertiliser, crop, or irrigation intents using TF-IDF + Logistic Regression |
| 🌍 **Multilingual** | Full support for English, Hindi, Punjabi, and Malayalam — including voice input |
| 🎤 **Voice Input** | Web Speech API integration for hands-free query input |
| 🌦️ **Weather Dashboard** | Real-time weather data with farm-specific alerts (via OpenWeatherMap API or mock fallback) |
| 📊 **Market Prices** | Live Mandi crop prices with trend indicators and search filtering |
| 🌱 **Crop Recommender** | AI-driven crop recommendations based on soil type, season, water availability, and auto-detected GPS location |
| 📱 **Mobile-First** | Fully responsive design with bottom tab navigation on mobile and sidebar on desktop |
| 🔄 **Auto-Location** | Uses browser Geolocation API to auto-detect the farmer's location for weather and crop recommendations |

---

## 🏗️ Project Structure

```
farmer-ai/
├── backend/
│   ├── app.py              # Flask API server (all endpoints)
│   ├── model.py            # ML model (TF-IDF + LogReg pipeline)
│   ├── utils.py            # Multilingual response dictionary
│   ├── requirements.txt    # Python dependencies
│   ├── farm_model.pkl      # Trained model (auto-generated)
│   └── data/
│       └── dataset.json    # Training data for intent classification
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Root component with React Router
│   │   ├── main.jsx        # Entry point with BrowserRouter
│   │   ├── index.css       # Global styles & Tailwind imports
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Responsive navigation (sidebar + bottom tabs + hamburger)
│   │   │   ├── Chat.jsx         # AI chat interface with voice input
│   │   │   ├── Weather.jsx      # Real-time weather dashboard
│   │   │   ├── CropPrices.jsx   # Live market price cards
│   │   │   └── CropRecommend.jsx# Crop recommendation engine
│   │   └── services/
│   │       └── api.js      # Axios API helper functions
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   ├── package.json        # Node.js dependencies
│   └── index.html          # HTML entry point
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+** installed
- **Node.js 18+** and npm installed
- (Optional) An [OpenWeatherMap API key](https://openweathermap.org/api) for live weather data

### 1. Backend Setup

```bash
cd farmer-ai/backend

# Install Python dependencies
pip install -r requirements.txt
pip install requests

# (Optional) Set OpenWeatherMap API key for live weather
set OPENWEATHER_API_KEY=your_api_key_here   # Windows
# export OPENWEATHER_API_KEY=your_api_key_here  # Linux/Mac

# Start the Flask server
python app.py
```

The backend will start on **http://localhost:5000**.

### 2. Frontend Setup

```bash
cd farmer-ai/frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will start on **http://localhost:5174** (Vite default).

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | Health check |
| `POST` | `/query` | Chat query — send `{ text, language }`, get `{ response, intent, language }` |
| `POST` | `/retrain` | Retrain the ML model from `dataset.json` |
| `GET`  | `/weather?lat=...&lon=...` | Weather data (live OpenWeatherMap or mock) |
| `GET`  | `/prices` | Current crop market prices |
| `POST` | `/recommend` | Crop recommendations — send `{ soil, season, water, lat, lon }` |

---

## 🧠 ML Model

The intent classifier uses a **TF-IDF Vectorizer + Logistic Regression** pipeline from scikit-learn:

- **Input**: Raw English text query from the farmer
- **Output**: Intent label (`pest`, `fertilizer`, `crop`, `irrigation`)
- **Training Data**: 50+ labelled examples in `data/dataset.json`
- **Features**: Unigrams and bigrams, max 5000 features
- **Model File**: Serialised to `farm_model.pkl` via joblib

---

## 🌐 Technologies Used

### Frontend
- **React 18** — Component-based UI
- **Vite** — Fast build tool
- **Tailwind CSS 3** — Utility-first styling
- **React Router v6** — Client-side routing
- **Lucide React** — Icon library
- **Axios** — HTTP client
- **Web Speech API** — Voice input

### Backend
- **Flask** — Lightweight WSGI web framework
- **Flask-CORS** — Cross-origin resource sharing
- **scikit-learn** — Machine learning (TF-IDF + LogReg)
- **joblib** — Model serialisation
- **requests** — HTTP client for external APIs
- **OpenWeatherMap API** — Real-time weather data

---

## 📱 Responsive Design

- **Mobile (< 768px)**: Top header bar with hamburger menu + bottom tab navigation
- **Tablet/Desktop (≥ 768px)**: Collapsible sidebar navigation
- **Large Desktop (≥ 1024px)**: Expanded sidebar with labels

---

## 🌍 Language Support

| Language | Code | Voice Input |
|----------|------|-------------|
| English  | `en` | `en-IN` |
| Hindi    | `hi` | `hi-IN` |
| Punjabi  | `pa` | `pa-IN` |
| Malayalam| `ml` | `ml-IN` |

---

## 📄 License

This project is built for educational purposes as part of an academic project.

---

## 👨‍💻 Authors

Built with ❤️ for Indian farmers.
