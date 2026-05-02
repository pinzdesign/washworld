from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from icecream import ic
from werkzeug.security import generate_password_hash, check_password_hash
import x
import uuid
import mysql.connector

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import jwt
import time

SECRET_KEY = os.environ.get("SECRET_KEY", None)

app = Flask(__name__)

CORS(app)

#############################
@app.route("/test")
def test():
    connection, cursor = x.db()

    cursor.execute("SELECT test_id, test_message FROM test")
    rows = cursor.fetchall()

    connection.close()
    return jsonify(rows)


#############################
@app.post("/signup")
def signup():
    try:
        user_email = x.validate_user_email()
        user_password = generate_password_hash(x.validate_user_password())
        user_first_name = x.validate_user_first_name()
        user_last_name = x.validate_user_last_name()
        user_phone = x.validate_user_phone()
        user_verification_key = uuid.uuid4().hex
        user_verified_at = 0
        created_at = int(time.time())

        connection, cursor = x.db()
        q = """INSERT INTO users
        (user_email, user_password, user_first_name, user_last_name, user_phone, user_verification_key, user_verified_at, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
        cursor.execute(q, (user_email, user_password, user_first_name, user_last_name, user_phone, user_verification_key, user_verified_at, created_at))
        connection.commit()

        base_url = os.environ.get("FRONTEND_URL", "http://127.0.0.1:3000")
        html = render_template("email_welcome.html", user_verification_key=user_verification_key, base_url=base_url)

        send_email(html, user_email)
        return "Please check your email maybe it arrived in the spam folder"
    except mysql.connector.IntegrityError as ex:
        if ex.errno == 1062:
            return "Email already registered", 409
        ic(ex)
        return "Internal error", 500
    except Exception as ex:
        msg = str(ex)
        if msg.startswith("company_exception"):
            field = msg.replace("company_exception ", "")
            return f"Invalid {field}", 400
        ic(ex)
        return "Internal error", 500
    finally:
        if "cursor" in locals(): cursor.close()
        if "connection" in locals(): connection.close()


##############################
def send_email(html, user_email):
    try:    
        sender_email = os.environ.get("EMAIL_SENDER", None)
        password = os.environ.get("EMAIL_PASSWORD", None)

        receiver_email = user_email

        message = MIMEMultipart()
        message["From"] = "WashWorld"
        message["To"] = receiver_email
        message["Subject"] = "Please verify your account"

        message.attach(MIMEText(html, "html"))

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message.as_string())

        return "email sent"
       
    except Exception as ex:
        return "cannot send email", 500
    finally:
        pass


##############################
@app.get("/verify/<key>")
def verify_account(key):
    try:
        if not key or len(key) != 32:
            return "Invalid verification key", 400

        connection, cursor = x.db()

        q = "SELECT * FROM users WHERE user_verification_key = %s"
        cursor.execute(q, (key,))
        user = cursor.fetchone()

        if not user:
            return "Invalid verification key", 404

        if user["user_verified_at"] != 0:
            return "Account is already verified", 400


        q = "UPDATE users SET user_verified_at = %s, user_status='active' WHERE user_pk = %s"
        cursor.execute(q, (int(time.time()), user["user_pk"]))
        connection.commit()

        return "Your account has been verified"
    except Exception as ex: 
        ic(ex)
        return "Internal error", 500
    finally:
        if "cursor" in locals(): cursor.close()
        if "connection" in locals(): connection.close() 


#############################
# Login route, tries to get a customer with provided mail and password, creates a jwt token to check for on password protected pages
@app.post("/login")
def login():
    try:
        user_email = x.validate_user_email()
        user_password = x.validate_user_password()

        connection, cursor = x.db()

        q = "SELECT * FROM users WHERE user_email = %s LIMIT 1"
        cursor.execute(q, (user_email,))
        user = cursor.fetchone()

        if not user:
            return "Invalid credentials", 401

        if not check_password_hash(user["user_password"], user_password):
            return "Invalid credentials", 401

        # Create JWT token
        payload = {
            "user_pk": user["user_pk"],
            "exp": int(time.time()) + 60 * 60 * 24  # 24 hours
        }

        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "token": token
        })

    except Exception as ex:
        ic(ex)
        return "Internal error", 500
    finally:
        if "cursor" in locals(): cursor.close()
        if "connection" in locals(): connection.close()

#############################
# PASSWORD PROTECTED: Profile route, shows user info OR shows verify your account message if verification date is 0
@app.get("/user")
def user_profile():
    try:
        token = request.headers.get("Authorization", "").replace("Bearer ", "")

        if not token:
            return "Missing token", 401

        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return "Token expired", 401
        except Exception:
            return "Invalid token", 401

        user_pk = decoded["user_pk"]

        connection, cursor = x.db()

        q = "SELECT user_first_name, user_last_name, user_email, user_verified_at FROM users WHERE user_pk = %s"
        cursor.execute(q, (user_pk,))
        user = cursor.fetchone()

        if not user:
            return "User not found", 404

        # Verification check
        if user["user_verified_at"] == 0:
            return jsonify({
                "message": "You need to verify your account via email"
            }), 403

        return jsonify({
            "user": {
                "first_name": user["user_first_name"],
                "last_name": user["user_last_name"],
                "email": user["user_email"]
            }
        })

    except Exception as ex:
        ic(ex)
        return "Internal error", 500
    finally:
        if "cursor" in locals(): cursor.close()
        if "connection" in locals(): connection.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)