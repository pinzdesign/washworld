# Calculates pricing based of membership match
def calculate_price(membership, service_price, service_type):

    final_price = service_price
    covered_by_membership = False

    if not membership:
        return final_price, covered_by_membership

    membership_type = membership.get("membership_type_name")

    if not membership_type:
        return final_price, covered_by_membership

    if membership_type.lower() == service_type:
        final_price = 0
        covered_by_membership = True

    return final_price, covered_by_membership