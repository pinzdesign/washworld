from flask import request
import jwt
import os
import time
from icecream import ic

SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing")

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


##############################
def get_user_id_from_jwt():
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    try:
        token = auth_header.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload.get("user_pk")
    except Exception as e:
        ic(e)
        return None
    