import requests
import sys

try:
    print("Testing /prices...")
    r = requests.get('http://127.0.0.1:5000/prices', timeout=15)
    print("Status:", r.status_code)
    print("Response:", r.text[:200])
except Exception as e:
    print("Error /prices:", e)

try:
    print("\nTesting /prices/analysis...")
    r = requests.get('http://127.0.0.1:5000/prices/analysis', timeout=15)
    print("Status:", r.status_code)
    print("Response:", r.text[:200])
except Exception as e:
    print("Error /prices/analysis:", e)
