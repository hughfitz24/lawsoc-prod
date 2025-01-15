from google.cloud import secretmanager
from flask import Flask, jsonify, make_response

# Initialize the Flask app
app = Flask(__name__)

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

@app.route("/get-secret", methods=["GET"])
def get_secret():
    """
    Endpoint to fetch the secret.
    """
    try:
        # Fetch the secret
        secret = access_secret()
        return jsonify({"secret": secret})
    except Exception as e:
        return make_response(
            jsonify({"error": "Failed to retrieve secret", "details": str(e)}), 500
        )

# Entrypoint for the Cloud Function
def main(request):
    return app(request)
