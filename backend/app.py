from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from icecream import ic
from werkzeug.security import generate_password_hash, check_password_hash
import x
import uuid
import mysql.connector
import random
import string

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
        user_pk = auth()

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

#############################
# PASSWORD PROTECTED: Get all memberships for logged-in user
@app.get("/memberships")
def get_memberships():
    try:
        user_pk = auth()

        connection, cursor = x.db()

        q = """
        SELECT 
            m.membership_pk,
            m.car_plate,
            m.primary_dep_ext_id,
            m.access_all_dep,
            m.membership_start_at,
            m.membership_end_at,
            m.membership_status,
            mt.membership_type_name,
            mt.membership_type_price,
            mt.membership_desc
        FROM membership m
        JOIN membership_type mt 
            ON m.membership_type_fk = mt.membership_type_pk
        WHERE m.user_fk = %s
        AND m.deleted_at = 0
        ORDER BY m.created_at DESC
        """

        cursor.execute(q, (user_pk,))
        memberships = cursor.fetchall()

        return jsonify({
            "memberships": memberships
        })

    except Exception as ex:
        ic(ex)
        return "Internal error", 500
    finally:
        if "cursor" in locals(): cursor.close()
        if "connection" in locals(): connection.close()

#############################
# PASSWORD PROTECTED: Soft delete membership
@app.patch("/memberships/<int:membership_pk>")
def delete_membership(membership_pk):
    try:
        user_pk = auth()

        connection, cursor = x.db()

        # Check ownership
        q = """
        SELECT membership_pk 
        FROM membership 
        WHERE membership_pk = %s 
        AND user_fk = %s 
        AND deleted_at = 0
        """
        cursor.execute(q, (membership_pk, user_pk))
        membership = cursor.fetchone()

        if not membership:
            return "Membership not found", 404

        # Soft delete
        q = """
        UPDATE membership
        SET deleted_at = %s,
            membership_status = 'cancelled'
        WHERE membership_pk = %s
        """
        cursor.execute(q, (int(time.time()), membership_pk))
        connection.commit()

        return "Membership removed"

    except Exception as ex:
        ic(ex)
        return "Internal error", 500
    finally:
        if "cursor" in locals(): cursor.close()
        if "connection" in locals(): connection.close()

#############################
# PASSWORD PROTECTED: Get service history for logged-in user
@app.get("/service-history")
def get_service_history():
    try:
        user_pk = auth()

        connection, cursor = x.db()

        q = """
        SELECT
            sh.service_history_pk,
            sh.service_fk,
            sh.membership_fk,

            sh.department_ext_id,

            sh.car_plate,

            sh.base_price,
            sh.final_price,

            sh.covered_by_membership,

            sh.service_at,

            s.service_name,
            s.service_type,

            mt.membership_type_name

        FROM service_history sh

        JOIN service s
            ON sh.service_fk = s.service_pk

        LEFT JOIN membership m
            ON sh.membership_fk = m.membership_pk

        LEFT JOIN membership_type mt
            ON m.membership_type_fk = mt.membership_type_pk

        WHERE sh.user_fk = %s

        ORDER BY sh.service_at DESC
        """

        cursor.execute(q, (user_pk,))
        history = cursor.fetchall()

        return jsonify({
            "history": history
        })

    except Exception as ex:
        msg = str(ex)

        if msg == "missing_token":
            return "Missing token", 401

        if msg == "token_expired":
            return "Token expired", 401

        if msg == "invalid_token":
            return "Invalid token", 401

        ic(ex)
        return "Internal error", 500

    finally:
        if "cursor" in locals():
            cursor.close()

        if "connection" in locals():
            connection.close()

# Scanner simulation:
# This will simulate car plate scanner at terminal, response values are hardcoded
# There is a 50/50 chance to use a randomly generated plate, or use one from database, simulating a registered user
# (chance that random generator will stumble upon registered number is inexistant)

@app.post("/simulate-scan")
def simulate_scan():
    try:
        jwt_user_fk = auth()

        connection, cursor = x.db()

        # 1. SCAN ONLY
        car_plate, department_ext_id = scan_car_plate(cursor)

        # 2. SERVICE (hardcoded for now)
        service_fk = 2
        service_type = "gold"
        base_price = 59

        # 3. LOOKUP MEMBERSHIP
        membership = get_membership_by_plate(cursor, car_plate)

        # 4. PRICE DECISION - for simplicity, if there is no match between registered plan and chosen service, just charge full price
        final_price, covered = calculate_price(
            membership,
            service_type,
            base_price
        )

        # 5. ALWAYS WRITE HISTORY
        write_history(
            cursor,
            connection,
            jwt_user_fk,
            car_plate,
            membership,
            service_fk,
            department_ext_id,
            base_price,
            final_price,
            covered
        )

        # 6. RESPONSE
        return jsonify({
            "success": True,
            "car_plate": car_plate,
            "membership_found": membership is not None,
            "membership": membership["membership_type_name"] if membership else None,
            "final_price": final_price,
            "covered_by_membership": covered
        })

    except Exception as ex:
        ic(ex)
        return "Internal error", 500

    finally:
        if "cursor" in locals():
            cursor.close()
        if "connection" in locals():
            connection.close()

#############################
# HELPERS - maybe move to x?
#############################

# Authorisation check, moved it here, let's keep it DRY
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

#############################
# Generate a random car plate, for scanning simulator
def generate_random_plate():
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    numbers = ''.join(random.choices(string.digits, k=5))

    return f"{letters}{numbers}"

#############################
# Add history entry in databse
def write_history(
    cursor,
    connection,
    jwt_user_fk,
    car_plate,
    membership,
    service_fk,
    department_ext_id,
    base_price,
    final_price,
    covered_by_membership
):

    membership_fk = membership["membership_pk"] if membership else None

    cursor.execute("""
        INSERT INTO service_history (
            user_fk,
            membership_fk,
            service_fk,
            department_ext_id,
            car_plate,
            base_price,
            final_price,
            covered_by_membership,
            service_at
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        jwt_user_fk,
        membership_fk,
        service_fk,
        department_ext_id,
        car_plate,
        base_price,
        final_price,
        covered_by_membership,
        int(time.time())
    ))

    connection.commit()

# Plate scanner - returns a random plate OR one from database
def scan_car_plate(cursor):
    use_existing = random.choice([True, False])

    scanned_plate = None

    if use_existing:
        cursor.execute("""
            SELECT car_plate
            FROM membership
            WHERE membership_status = 'active'
            AND deleted_at = 0
            ORDER BY RAND()
            LIMIT 1
        """)

        row = cursor.fetchone()

        if row:
            scanned_plate = row["car_plate"]

    if not scanned_plate:
        scanned_plate = generate_random_plate()

    # 123 is department
    return scanned_plate, "123"

def get_membership_by_plate(cursor, car_plate):
    cursor.execute("""
        SELECT
            m.membership_pk,
            m.user_fk,
            m.car_plate,
            mt.membership_type_name
        FROM membership m
        JOIN membership_type mt
            ON m.membership_type_fk = mt.membership_type_pk
        WHERE m.car_plate = %s
        AND m.deleted_at = 0
        AND m.membership_status = 'active'
        LIMIT 1
    """, (car_plate,))

    return cursor.fetchone()

# Calculates pricing based of membership match
def calculate_price(membership, service_type, base_price):
    if not membership:
        return base_price, False

    if membership["membership_type_name"].lower() == service_type:
        return 0, True

    return base_price, False

# Need this at the end!
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)