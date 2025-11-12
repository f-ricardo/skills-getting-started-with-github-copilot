import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

def test_signup_and_unregister():
    email = "testuser@mergington.edu"
    activity = "Chess Club"
    # Remove if already present
    client.delete(f"/activities/{activity}/unregister", params={"email": email})
    # Signup
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]
    # Try duplicate signup
    response_dup = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response_dup.status_code == 400
    # Unregister
    response_del = client.delete(f"/activities/{activity}/unregister", params={"email": email})
    assert response_del.status_code == 200
    assert f"{email} removido de {activity}" in response_del.json()["message"]
    # Try unregister again
    response_del2 = client.delete(f"/activities/{activity}/unregister", params={"email": email})
    assert response_del2.status_code == 404

def test_signup_invalid_activity():
    response = client.post("/activities/InvalidActivity/signup", params={"email": "x@x.com"})
    assert response.status_code == 404

def test_unregister_invalid_activity():
    response = client.delete("/activities/InvalidActivity/unregister", params={"email": "x@x.com"})
    assert response.status_code == 404
