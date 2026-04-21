import os
from icecream import ic
import mysql.connector

def db():
    try:
        connection = mysql.connector.connect(
            host=os.environ.get("DB_HOST", "mariadb"),
            user=os.environ.get("DB_USER", "root"),
            password=os.environ.get("DB_PASSWORD", "password"),
            database=os.environ.get("DB_NAME", "washworld")
        )
        cursor = connection.cursor(dictionary=True)
        return connection, cursor
    except Exception as e:
        ic(e)  # better debug output
        raise Exception("Database under maintenance", 500)