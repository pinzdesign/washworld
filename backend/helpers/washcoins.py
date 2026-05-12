def reward_washcoins(cur, user_fk, covered_by_membership):

    # Must be logged in
    if not user_fk:
        return False

    # Do not reward subscription washes
    if covered_by_membership:
        return False

    cur.execute("""
        UPDATE users
        SET user_washcoins = COALESCE(user_washcoins, 0) + 100
        WHERE user_pk = %s
    """, (user_fk,))

    return cur.rowcount > 0