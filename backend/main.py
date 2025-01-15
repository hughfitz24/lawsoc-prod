from google.cloud import secretmanager
import os
from google.cloud import secretmanager
from flask import jsonify

# Replace with your secret details
SECRET_NAME = "gcal-api-privkey"
PROJECT_ID = "lawsocie-prod"
SECRET_VERSION = "latest"  # Use "latest" to always fetch the latest version

def access_secret():
    """
    Access the secret from Google Cloud Secret Manager.
    """
    client = secretmanager.SecretManagerServiceClient()
    secret_path = f"projects/{PROJECT_ID}/secrets/{SECRET_NAME}/versions/{SECRET_VERSION}"

    # Access the secret
    response = client.access_secret_version(name=secret_path)
    secret_data = response.payload.data.decode("utf-8")
    return secret_data

def get_secret(request):
    """
    Entry point for the Google Cloud Function
    This retrieves the secret from Secret Manager.
    """
    try:
        secret = access_secret()
        return jsonify({"secret": secret})
    except Exception as e:
        return jsonify({"error": "Failed to retrieve secret", "details": str(e)}), 500
