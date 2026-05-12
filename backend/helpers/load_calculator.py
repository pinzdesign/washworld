def calculate_adjsuted_load(load, availability):
    if not availability or availability <= 0:
        return 1.0
    adjusted = load / availability
    return min(round(adjusted, 3), 1.0)

def calculate_adjusted_load_profile(location):
    load_profile = location.get("load_profile", {})
    availability = location.get("availability", 1.0)

    return {
        time: calculate_adjsuted_load(load, availability)
        for time, load in load_profile.items()
    }