import os
import requests
from icecream import ic

MAPBOX_TOKEN = os.environ.get("MAPBOX_TOKEN")
MATRIX_URL = "https://api.mapbox.com/directions-matrix/v1/mapbox/driving"
GEOCODE_URL = "https://api.mapbox.com/search/geocode/v6/forward"

########################
def get_driving_distances(origin, destinations):
    """
    Kald Mapbox API

    origin: tuple (lng, lat) for brugerens position
    destinations: list af (lng, lat) tuples for vaskehaller

    Returnerer liste af (distance_km, duration_min) i samme rækkefølge som destinations.
    """
    coords = [f"{origin[0]},{origin[1]}"]
    coords += [f"{d[0]},{d[1]}" for d in destinations]
    coords_str = ";".join(coords)

    url = f"{MATRIX_URL}/{coords_str}"
    params = {
        "sources": "0",
        "destinations": ";".join(str(i) for i in range(1, len(destinations) + 1)),
        "annotations": "distance,duration",
        "access_token": MAPBOX_TOKEN,
    }

    response = requests.get(url, params=params, timeout=5)
    response.raise_for_status()
    data = response.json()

    distances = data["distances"][0]
    durations = data["durations"][0]

    return [
        {
            "distance_km": round(d / 1000, 2) if d is not None else None,
            "duration_min": round(t / 60, 1) if t is not None else None,
        }
        for d, t in zip(distances, durations)
    ]

########################
def geocode_address(address):
    """
    KOnverter adresse -> koodinater via Mapbox Geocoding API.
    
    Returner dict {lat, lng} eller None hvis ingen match.
    """
    params = {
        "q": address,
        "country": "dk",
        "limit": 1,
        "access_token": MAPBOX_TOKEN,
    }

    response = requests.get(GEOCODE_URL, params=params, timeout=5)
    response.raise_for_status()
    data = response.json()

    features = data.get("features", [])
    if not features:
        return None

    lng, lat = features[0]["geometry"]["coordinates"]
    return {
        "lng": lng,
        "lat": lat
    }