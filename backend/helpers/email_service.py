import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

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