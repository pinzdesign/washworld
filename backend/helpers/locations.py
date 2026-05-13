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
def get_nearest(lat, lng, limit=5, gps_lat=None, gps_lng=None):
    haversine_candidates = []
    for loc in _LOCATIONS:
        loc_lat = float(loc["coordinates"]["lat"])
        loc_lng = float(loc["coordinates"]["lng"])
        aprox_dist = _haversine_km(lat, lng, loc_lat, loc_lng)
        haversine_candidates.append((aprox_dist, loc))
    haversine_candidates.sort(key=lambda x: x[0])
    candidates = [loc for _, loc in haversine_candidates[:MAPBOX_LIMIT]]

    cursor_origin = (lng, lat)
    destinations = [
        (float(loc["coordinates"]["lng"]), float(loc["coordinates"]["lat"]))
        for loc in candidates
    ]
    cursor_distances = mapbox.get_driving_distances(cursor_origin, destinations)

    enriched = []
    for loc, dist_data in zip(candidates, cursor_distances):
        if dist_data["distance_km"] is None or dist_data["duration_min"] is None:
            continue
        enriched.append({
            **loc,
            "distance_km": dist_data["distance_km"],
            "duration_min": dist_data["duration_min"],
        })
    enriched.sort(key=lambda x: x["duration_min"])
    top = enriched[:limit]

    if gps_lat is not None and gps_lng is not None and top:
        gps_origin = (gps_lng, gps_lat)
        gps_dests = [
            (float(loc["coordinates"]["lng"]), float(loc["coordinates"]["lat"]))
            for loc in top
        ]
        gps_distances = mapbox.get_driving_distances(gps_origin, gps_dests)
        for loc, dist_data in zip(top, gps_distances):
            if dist_data["distance_km"] is not None:
                loc["distance_km"] = dist_data["distance_km"]
            if dist_data["duration_min"] is not None:
                loc["duration_min"] = dist_data["duration_min"]

    return top

    
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