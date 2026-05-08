from flask import request
import jwt
import os
import time

SECRET_KEY = os.environ.get("SECRET_KEY", None)

# Authorisation check
def verify_token():
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
    
def create_token(user_pk):
    payload = {
            "user_pk": user_pk,
            "exp": int(time.time()) + 60 * 60 * 24  # 24 hours
        }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")