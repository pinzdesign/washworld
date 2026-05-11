from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from icecream import ic
from werkzeug.security import generate_password_hash, check_password_hash
from helpers import validators, connector, sql_partials, auth, misc, email_service, locations, mapbox
import uuid
import mysql.connector
import jwt

import os


import time

app = Flask(__name__)

CORS(app)

#############################
@app.route("/test")
def test():
    connection, cursor = connector.db()

    cursor.execute("SELECT test_id, test_message FROM test")
    rows = cursor.fetchall()

    connection.close()
    return jsonify(rows)


#############################
@app.post("/signup")
def signup():
    try:
        user_email = validators.validate_user_email()
        user_password = generate_password_hash(validators.validate_user_password())
        user_first_name = validators.validate_user_first_name()
        user_last_name = validators.validate_user_last_name()
        user_phone = validators.validate_user_phone()
        user_verification_key = uuid.uuid4().hex
        user_verified_at = 0
        created_at = int(time.time())

        connection, cursor = connector.db()
        q = """INSERT INTO users
        (user_email, user_password, user_first_name, user_last_name, user_phone, user_verification_key, user_verified_at, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
        cursor.execute(q, (user_email, user_password, user_first_name, user_last_name, user_phone, user_verification_key, user_verified_at, created_at))
        connection.commit()

        base_url = os.environ.get("FRONTEND_URL", "http://127.0.0.1:3000")
        html = render_template("email_welcome.html", user_verification_key=user_verification_key, base_url=base_url)

        email_service.send_email(html, user_email)
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
@app.get("/verify/<key>")
def verify_account(key):
    try:
        if not key or len(key) != 32:
            return "Invalid verification key", 400

        connection, cursor = connector.db()

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
        user_email = validators.validate_user_email()
        user_password = validators.validate_user_password()

        connection, cursor = connector.db()

        q = "SELECT * FROM users WHERE user_email = %s LIMIT 1"
        cursor.execute(q, (user_email,))
        user = cursor.fetchone()

        if not user:
            return "Invalid credentials", 401

        if not check_password_hash(user["user_password"], user_password):
            return "Invalid credentials", 401

        token = auth.create_token(user["user_pk"])

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
        user_pk = auth.verify_token()

        connection, cursor = connector.db()

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
        user_pk = auth.verify_token()

        connection, cursor = connector.db()

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
        user_pk = auth.verify_token()

        connection, cursor = connector.db()

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
# PASSWORD PROTECTED: Get service history for logged-in user - NEEDS REWORK!
@app.get("/service-history")
def get_service_history():
    try:
        user_pk = auth.verify_token()

        connection, cursor = connector.db()

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

# WILL BE REWORKED/REMOVED COMPLETELY!

@app.post("/simulate-scan")
def simulate_scan():
    try:
        jwt_user_fk = auth.verify_token()

        connection, cursor = connector.db()

        # 1. SCAN ONLY
        car_plate, department_ext_id = sql_partials.scan_car_plate(cursor)

        # 2. SERVICE (hardcoded for now)
        service_fk = 2
        service_type = "gold"
        base_price = 59

        # 3. LOOKUP MEMBERSHIP
        membership = sql_partials.get_membership_by_plate(cursor, car_plate)

        # 4. PRICE DECISION - for simplicity, if there is no match between registered plan and chosen service, just charge full price
        final_price, covered = misc.calculate_price(
            membership,
            service_type,
            base_price
        )

        # 5. ALWAYS WRITE HISTORY
        sql_partials.write_history(
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


############################
@app.get("/locations")
def get_locations():
    try:
        return jsonify(locations.get_all())
    except Exception as ex:
        ic(ex)
        return "Internal error", 500

############################
@app.get("/locations/<int:location_id>")
def get_location_by_id(location_id):
    try:
        loc = locations.get_by_id(location_id)
        if not loc:
            return "Location not found", 404
        return jsonify(loc)
    except Exception as ex:
        ic(ex)
        return "Internal error", 500

############################
@app.get("/locations/nearby")
def get_nearby_locations():
    try:
        lat = validators.validate_lat(request.args.get("lat"))
        lng = validators.validate_lng(request.args.get("lng"))
        limit = validators.validate_limit(request.args.get("limit"))
        return jsonify(locations.get_nearest(lat, lng, limit))
    except Exception as ex:
        msg = str(ex)
        if msg.startswith("company_exception"):
            field = msg.replace("company_exception ", "")
            return f"Invalid {field}", 400
        ic(ex)
        return "Internal error", 500
    
@app.get("/geocode")
def geocode_address():
    try:
        address = validators.validate_address(request.args.get("address"))
        result = mapbox.geocode_address(address)
        if not result:
            return "Address not found", 404
        return jsonify(result)
    except Exception as ex:
        msg = str(ex)
        if msg.startswith("company_exception"):
            field = msg.replace("company_exception ", "")
            return f"Invalid {field}", 400
        ic(ex)
        return "Internal error", 500

# Need this at the end!
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)