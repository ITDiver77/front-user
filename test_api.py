#!/usr/bin/env python3
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def test_api():
    # Test root
    try:
        r = requests.get(f"{BASE_URL}/")
        print(f"GET / -> {r.status_code} {r.text[:100]}")
    except Exception as e:
        print(f"GET / error: {e}")
    
    # Test health endpoint
    r = requests.get(f"{BASE_URL}/health")
    print(f"GET /health -> {r.status_code} {r.text[:100]}")
    
    # Test with possible API keys
    keys = [
        "default-api-key",
        "your-secret-key-here",
        "test-api-key-1234567890abcdef",
        "secret",
        "admin",
    ]
    
    for key in keys:
        r = requests.get(f"{BASE_URL}/users/", headers={"X-API-Key": key})
        if r.status_code == 200:
            print(f"Valid API key found: {key}")
            print(f"Response: {r.json()}")
            return key
        else:
            print(f"Key {key}: {r.status_code} {r.text[:50]}")
    
    return None

def test_auth():
    # Try registration
    data = {
        "username": "testuser",
        "password": "password123",
        "telegram_id": 123
    }
    r = requests.post(f"{BASE_URL}/auth/register", json=data)
    print(f"POST /auth/register -> {r.status_code} {r.text}")
    if r.status_code == 200:
        token = r.json().get("access_token")
        print(f"Token: {token}")
        # Test login with same credentials
        login_data = {
            "username": "testuser",
            "password": "password123"
        }
        r = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"POST /auth/login -> {r.status_code} {r.text}")
        return token
    return None

if __name__ == "__main__":
    print("Testing API...")
    key = test_api()
    print("\nTesting auth...")
    token = test_auth()