import random
import string

#############################
# Generate a random car plate, for scanning simulator
def generate_random_plate():
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    numbers = ''.join(random.choices(string.digits, k=5))

    return f"{letters}{numbers}"