"use client"

import { useEffect, useState } from "react";
import WashHallMap from "./WashHallMap";
import NearbyWashHalls from "./NearbyWashHalls";
import type { Location } from "./WashHallCard";

export default function LocationsExplorer() {
    const [userPosition, setUserPosition] = useState<{ lat: number; lng: number} | null>(null)
    const [nearestLocations, setNearestLocations] = useState<Location[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userPosition) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/nearby?lat=${userPosition.lat}&lng=${userPosition.lng}&limit=5`)
            .then(res => {
                if (!res.ok) {
                    setError("Kunne ikke hente vaskehaller");
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (data) setNearestLocations(data);
            })
            .catch((err) => {
                console.error(err);
            });
    }, [userPosition]);

    const requestLocation = () => {
        setError("");
        if (!navigator.geolocation) {
            setError("Din browser understøtter ikke lokation");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude}),
            (err) => {
                console.error("Geolocation error:", err.code, err.message);
                setError("Vi skal bruge din lokation for at vise vaskehaller nør dig");
            }
        )
    };

    useEffect(() => {
        if ("permissions" in navigator) {
            navigator.permissions.query({name: "geolocation" }).then((result) => {
                if (result.state === "granted") requestLocation();
            })
        }
    }, []);

    return (
        <>
            <WashHallMap
                userPosition={userPosition}
                nearestLocations={nearestLocations}
                onPositionChange={(lat, lng) => setUserPosition({ lat, lng })}
                onMarkerClick={(location) => {
                    const isInList = nearestLocations.some(l => l.Location_id === location.Location_id);
                    if (!isInList) {
                        setUserPosition({
                            lat: parseFloat(location.coordinates.lat),
                            lng: parseFloat(location.coordinates.lng),
                        });
                    }
                    setSelectedLocationId(location.Location_id);
                }}
            />
            <NearbyWashHalls
                locations={nearestLocations}
                selectedLocationId={selectedLocationId}
                error={error}
                onRequestLocation={requestLocation}
            />
        </>
    );
}