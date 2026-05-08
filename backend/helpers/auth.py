from flask import request
import jwt
import os

SECRET_KEY = os.environ.get("SECRET_KEY", None)

# Authorisation check
def auth():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")

    if not token:
        raise Exception("missing_token")

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded["user_pk"]

    except jwt.ExpiredSignatureError:
        raise Exception("token_expired")

    except Exception:
        raise Exception("invalid_token")