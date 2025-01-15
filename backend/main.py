from google.cloud import secretmanager
import logging
from flask import jsonify, make_response

# Replace with your secret details
SECRET_NAME = "gcal-api-privkey"
PROJECT_ID = "lawsocie-prod"
SECRET_VERSION = "latest"  # Use "latest" to always fetch the latest version

# Initialize Flask app (if needed locally for testing, Cloud Function doesn't require Flask)

def access_secret():
    """
    Access the secret from Google Cloud Secret Manager.
    """
    client = secretmanager.SecretManagerServiceClient()
    secret_path = f"projects/{PROJECT_ID}/secrets/{SECRET_NAME}/versions/{SECRET_VERSION}"

    # Access the secret
    try:
        response = client.access_secret_version(name=secret_path)
        secret_data = response.payload.data.decode("utf-8")
        logging.info(f"Successfully retrieved secret: {SECRET_NAME}")
        return secret_data
    except Exception as e:
        logging.error(f"Failed to retrieve secret: {SECRET_NAME}, error: {str(e)}")
        raise e

def get_secret(request):
    """
    Entry point for the Google Cloud Function
    This retrieves the secret from Secret Manager and adds CORS headers.
    """
    try:
        # Fetch the secret
        secret = access_secret()

        # Prepare the response with CORS headers
        response = jsonify({"secret": secret})
        response.headers['Access-Control-Allow-Origin'] = '*'  # Allow all origins
        response.headers['Access-Control-Allow-Methods'] = 'GET'  # Allowed methods
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'  # Allowed headers
        return response
    except Exception as e:
        logging.error(f"Error occurred while fetching the secret: {str(e)}")

        # Prepare error response with CORS headers
        response = jsonify({"error": "Failed to retrieve secret", "details": str(e)})
        response.headers['Access-Control-Allow-Origin'] = '*'  # Allow all origins
        return response, 500