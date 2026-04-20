from icecream import ic
import mysql.connector

def db():
    try:
        connection = mysql.connector.connect(
            host="mariadb",
            user="root",
            password="password",
            database="washworld"
        )
        cursor = connection.cursor(dictionary=True)
        return connection, cursor
    except Exception as e:
        ic(e)  # better debug output
        raise Exception("Database under maintenance", 500)