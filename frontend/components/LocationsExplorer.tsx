"use client"

import { useEffect, useState } from "react";
import WashHallMap from "./WashHallMap";
import NearbyWashHalls from "./NearbyWashHalls";
import type { Location } from "./WashHallCard";
import { useIsPwa } from "./useIsPwa";

export default function LocationsExplorer() {
    const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [gpsPosition, setGpsPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [nearestLocations, setNearestLocations] = useState<Location[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const isPwa = useIsPwa();

    useEffect(() => {
        if (!userPosition) return;
        const params = new URLSearchParams({
            lat: String(userPosition.lat),
            lng: String(userPosition.lng),
            limit: "5",
        });
        if (gpsPosition) {
            params.set("gps_lat", String(gpsPosition.lat));
            params.set("gps_lng", String(gpsPosition.lng));
        }
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/nearby?${params.toString()}`)
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
    }, [userPosition, gpsPosition]);

    const requestLocation = () => {
        setError("");
        if (!navigator.geolocation) {
            setError("Din browser understøtter ikke lokation");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserPosition(coords);
                setGpsPosition(coords);
            },
            (err) => {
                console.error("Geolocation error:", err.code, err.message);
                if (err.code === 1) {
                    setError("Du har afvist adgang til din position. Tillad det i browser-indstillinger for at bruge denne funktion.");
                } else {
                    setError("Kunne ikke finde din position");
                }
            }
        )
    };

    useEffect(() => {
        if (isPwa) {
            // In PWA mode: always prompt for location on mount (browser handles dedup)
            requestLocation();
            return;
        }
        if ("permissions" in navigator) {
            navigator.permissions.query({ name: "geolocation" }).then((result) => {
                if (result.state === "granted") requestLocation();
            })
        }
    }, [isPwa]);

    return (
        <>
            <div className="space-y-0">
                <WashHallMap
                    userPosition={userPosition}
                    nearestLocations={nearestLocations}
                    onPositionChange={(lat, lng) => setUserPosition({ lat, lng })}
                    onRequestLocation={requestLocation}
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
                    hasGpsPosition={gpsPosition !== null}
                    error={error}
                    onRequestLocation={requestLocation}
                />
            </div>
        </>
    );
}
