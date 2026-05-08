import random, time
from helpers import scanner

#############################
# Reused in 2 cases: when user = abonnement owner, when user = qr code owner (unknown plate)
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
        scanned_plate = scanner.generate_random_plate()

    # 123 is department
    return scanned_plate, "123"

# Gets membership by plate number
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