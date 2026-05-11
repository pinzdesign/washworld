import random
import string

#############################
# Generate a random car plate, for scanning simulator - UNUSED!
def generate_random_plate():
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    numbers = ''.join(random.choices(string.digits, k=5))

    return f"{letters}{numbers}"

def scan_plate():
    # hardcoded for demo
    return "AF24333", "123"

def get_membership_by_plate(cursor, car_plate):
    q = """
    SELECT
        m.membership_pk,
        m.user_fk,
        mt.membership_type_name
    FROM membership m
    JOIN membership_type mt
        ON m.membership_type_fk = mt.membership_type_pk
    WHERE m.car_plate = %s
      AND m.membership_status = 'active'
      AND m.deleted_at = 0
    LIMIT 1
    """

    cursor.execute(q, (car_plate,))
    row = cursor.fetchone()

    if not row:
        return None

    # safety normalization (in case cursor is NOT dict-based)
    if isinstance(row, tuple):
        return {
            "membership_pk": row[0],
            "user_fk": row[1],
            "membership_type_name": row[2],
        }

    return row

def resolve_history_owner(qr_user_fk, membership):
    if qr_user_fk:
        return qr_user_fk

    if isinstance(membership, dict):
        return membership.get("user_fk")

    return None