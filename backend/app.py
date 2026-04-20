from flask import Flask, jsonify
from flask_cors import CORS
from x import db
# import jwt
import datetime

SECRET_KEY = "supersecretkey"

app = Flask(__name__)

CORS(app)

@app.route("/test")
def test():
    connection, cursor = db()

    cursor.execute("SELECT test_id, test_message FROM test")
    rows = cursor.fetchall()

    connection.close()
    return jsonify(rows)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)