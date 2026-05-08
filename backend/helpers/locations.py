import json
from pathlib import Path
import math

_PATH = Path(__file__).parent.parent / "data" / "locations.json"
with open(_PATH, encoding="utf-8") as f:
    _LOCATIONS = json.load(f)
    for loc in _LOCATIONS:
        loc["Location_id"] = int(loc["Location_id"])

def get_all():
    return _LOCATIONS

def get_by_id(location_id):
    for loc in _LOCATIONS:
        if loc.get("Location_id") == location_id:
            return loc
    return None

def _haversine_km(lat1, lng1, lat2, lng2):
    """Distance i km mellem to lat/lng-punkter."""
    R = 6371  # jordens radius i km
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2
    return 2 * R * math.asin(math.sqrt(a))

def get_nearest(lat, lng, limit=5):
    results = []
    for loc in _LOCATIONS:
        loc_lat = float(loc["coordinates"]["lat"])
        loc_lng = float(loc["coordinates"]["lng"])
        distance_km = _haversine_km(lat, lng, loc_lat, loc_lng)
        results.append({**loc, "distance_km": round(distance_km, 2)})
    results.sort(key=lambda x: x["distance_km"])
    return results[:limit]