from flask import request
import re
from icecream import ic
import jwt
import os

SECRET_KEY = os.environ.get("SECRET_KEY", None)

##############################
REGEX_USER_EMAIL = "^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$"
def validate_user_email():
    user_email = request.form.get("user_email", "").strip()
    if not re.match(REGEX_USER_EMAIL, user_email): 
        raise Exception("company_exception user_email")
    return user_email


##############################
USER_PASSWORD_MIN = 8
USER_PASSWORD_MAX = 50
REGEX_USER_PASSWORD = f"^.{{{USER_PASSWORD_MIN},{USER_PASSWORD_MAX}}}$"
def validate_user_password():
    user_password = request.form.get("user_password", "").strip()
    if not re.match(REGEX_USER_PASSWORD, user_password):
        raise Exception("company_exception user_password")
    return user_password

##############################
USER_FIRST_NAME_MIN = 2
USER_FIRST_NAME_MAX = 20
REGEX_USER_FIRST_NAME = f"^.{{{USER_FIRST_NAME_MIN},{USER_FIRST_NAME_MAX}}}$"
def validate_user_first_name():
    user_first_name = request.form.get("user_first_name", "").strip()
    if not re.match(REGEX_USER_FIRST_NAME, user_first_name):
        raise Exception("company_exception user_first_name")
    return user_first_name


##############################
USER_LAST_NAME_MIN = 2
USER_LAST_NAME_MAX = 20
REGEX_USER_LAST_NAME = f"^.{{{USER_LAST_NAME_MIN},{USER_LAST_NAME_MAX}}}$"
def validate_user_last_name():
    user_last_name = request.form.get("user_last_name", "").strip()
    if not re.match(REGEX_USER_LAST_NAME, user_last_name):
        raise Exception("company_exception user_last_name")
    return user_last_name

##############################
USER_PHONE_LENGTH = 8
def validate_user_phone():
    user_phone = request.form.get("user_phone", "").strip()
    if not user_phone.isdigit() or len(user_phone) != USER_PHONE_LENGTH:
        raise Exception("company_exception user_phone")
    return user_phone

##############################
LAT_MIN = -90
LAT_MAX = 90
def validate_lat(lat_str):
    try:
        lat = float(lat_str)
    except (TypeError, ValueError):
        raise Exception("company_exception lat")
    if not (LAT_MIN <= lat <= LAT_MAX):
        raise Exception("company_exception lat")
    return lat

##############################
LNG_MIN = -180
LNG_MAX = 180
def validate_lng(lng_str):
    try:
        lng = float(lng_str)
    except (TypeError, ValueError):
        raise Exception("company_exception lng")
    if not (LNG_MIN <= lng <= LNG_MAX):
        raise Exception("company_exception lng")
    return lng

##############################
LIMIT_DEFAULT = 5
LIMIT_MIN = 1
LIMIT_MAX = 50
def validate_limit(limit_str):
    if limit_str is None:
        return LIMIT_DEFAULT
    try:
        limit = int(limit_str)
    except (TypeError, ValueError):
        raise Exception("company_exception limit")
    return max(LIMIT_MIN, min(limit, LIMIT_MAX))

##############################
ADDRESS_MIN = 3
ADDRESS_MAX = 200
def validate_address(address_str):
    if address_str is None:
        raise Exception("company_exception address")
    address = address_str.strip()
    if not (ADDRESS_MIN <= len(address) <= ADDRESS_MAX):
        raise Exception("company_exception address")
    return address

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