# model.py — TF-IDF + Logistic Regression classifier

import json
import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

MODEL_PATH = os.path.join(os.path.dirname(__file__), "farm_model.pkl")
DATA_PATH  = os.path.join(os.path.dirname(__file__), "data", "dataset.json")

def train_and_save():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    texts  = [d["text"]  for d in data]
    labels = [d["label"] for d in data]

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=5000)),
        ("clf",   LogisticRegression(max_iter=1000, C=5.0)),
    ])
    pipeline.fit(texts, labels)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"[model] Trained and saved -> {MODEL_PATH}")
    return pipeline


def load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return train_and_save()


def predict(text: str, model) -> str:
    return model.predict([text])[0]
