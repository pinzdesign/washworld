# Calculates pricing based of membership match
def calculate_price(membership, service_type, base_price):
    if not membership:
        return base_price, False

    if membership["membership_type_name"].lower() == service_type:
        return 0, True

    return base_price, False