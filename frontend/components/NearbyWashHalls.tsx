"use client";

import { useEffect, useState } from "react";
import WashHallCard from "./WashHallCard";

type Location= {
    Location_id: number;
    name: string;
    image: string;
}

export default function NearbyWashHalls() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [error, setError] = useState("");

    const fetchNearby = async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/locations/nearby?lat=${lat}&lng=${lng}&limit=5`
            );
            if (!res.ok) {
                setError("Kunne ikke hente vaskehaller");
                return;
            }
            const data = await res.json();
            setLocations(data);
        } catch (err) {
            console.error(err);
            setError("Kunne ikke hente vaskehaller");
        }
    }

    const requestLocation = () => {
        setError("");

        if (!navigator.geolocation) {
            setError("Din browser understøtter ikke lokation");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchNearby(pos.coords.latitude, pos.coords.longitude);
                console.log("Position:", pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
                console.error("Geolocation error:", err.code, err.message);
                setError("Vi skal bruge din lokation for at vise vaskehaller nær dig");
            }
        );
    };

    useEffect(() => {
        if ("permissions" in navigator) {
            navigator.permissions
                .query({ name: "geolocation" })
                .then((result) => {
                    if (result.state === "granted") {
                        requestLocation();
                    }
                });
        }
    }, []);

    return (
        <div>
            <h2>Wash World nær dig</h2>
            {!error && locations.length === 0 && (
                <button onClick={requestLocation}>Brug min lokation</button>
            )}
            {error && (
                <div>
                    <p>{error}</p>
                    <button onClick={requestLocation}>Brug min lokation</button>
                </div>
            )}
            <div className="grid grid-cols-5 gap-4 items-start">
                {locations.map((loc) => (
                <WashHallCard key={loc.Location_id} location={loc} />
                ))}
            </div>
        </div>
    );
}