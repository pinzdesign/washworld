import json
from pathlib import Path
import math
from helpers import mapbox
from helpers import load_calculator

MAPBOX_LIMIT = 24

_PATH = Path(__file__).parent.parent / "data" / "locations.json"
with open(_PATH, encoding="utf-8") as f:
    _LOCATIONS = json.load(f)
    for loc in _LOCATIONS:
        loc["Location_id"] = int(loc["Location_id"])
        loc["adjusted_load_profile"] = load_calculator.calculate_adjusted_load_profile(loc)

################################
def get_all():
    return _LOCATIONS

################################
def get_by_id(location_id):
    for loc in _LOCATIONS:
        if loc.get("Location_id") == location_id:
            return loc
    return None

################################
def get_nearest(lat, lng, limit=5):
    candidates = []
    for loc in _LOCATIONS:
        loc_lat = float(loc["coordinates"]["lat"])
        loc_lng = float(loc["coordinates"]["lng"])
        aprox_dist = _haversine_km(lat, lng, loc_lat, loc_lng)
        candidates.append((aprox_dist, loc))
    candidates.sort(key=lambda x: x[0])
    candidates = candidates[:MAPBOX_LIMIT]

    origin = (lng, lat)
    destinations = [
        (float(loc["coordinates"]["lng"]), float(loc["coordinates"]["lat"]))
        for _, loc in candidates
    ] 
    distances = mapbox.get_driving_distances(origin, destinations)

    results = []
    for (_, loc), dist_data in zip(candidates, distances):
        if dist_data["distance_km"] is None or dist_data["duration_min"] is None:
            continue
        results.append({
            **loc,
            "distance_km": dist_data["distance_km"],
            "duration_min": dist_data["duration_min"],
        })
    results.sort(key=lambda x: x["duration_min"])
    return results[:limit]

    
################################
def _haversine_km(lat1, lng1, lat2, lng2):
    """Distance i km mellem to lat/lng-punkter."""
    R = 6371  # jordens radius i km
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2
    return 2 * R * math.asin(math.sqrt(a))

# def get_nearest(lat, lng, limit=5):
#     results = []
#     for loc in _LOCATIONS:
#         loc_lat = float(loc["coordinates"]["lat"])
#         loc_lng = float(loc["coordinates"]["lng"])
#         distance_km = _haversine_km(lat, lng, loc_lat, loc_lng)
#         results.append({**loc, "distance_km": round(distance_km, 2)})
#     results.sort(key=lambda x: x["distance_km"])
#     return results[:limit]