"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

type Location = {
    Location_id: number;
    name: string;
    coordinates: { lat: string; lng: string };
};

export default function WashHallMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null)
    const userMarker = useRef<mapboxgl.Marker | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!mapContainer.current) return;
        if (map.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [10.5, 56.0],
            zoom: 6,
            minZoom: 4,
            maxBounds: [
                [3.0, 52.0], 
                [20.0, 60.0],
            ],
        });

        //Hent og vis alle vaskehaller som markers
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations`)
            .then((res) => res.json())
            .then((locations: Location[]) => {
                locations.forEach((loc) => {
                    const el = document.createElement("div");
                    el.style.backgroundImage = "url(/washworld-marker.svg)";
                    el.style.backgroundSize = "contain";
                    el.style.backgroundRepeat = "no-repeat";
                    el.style.width = "32px";
                    el.style.height = "40px";
                    new mapboxgl.Marker({ element: el })
                        .setLngLat([
                            parseFloat(loc.coordinates.lng),
                            parseFloat(loc.coordinates.lat),
                        ])
                        .setPopup(new mapboxgl.Popup().setText(loc.name))
                        .addTo(map.current!);
                });
            })
            .catch((err) => console.error("Failed to load locations:", err));
        
            // Auto-zoom til brugerens lokation hvis tilladelse allerede er givet
            if ("permissions" in navigator) {
                navigator.permissions
                    .query({ name: "geolocation" })
                    .then((result) => {
                        if (result.state === "granted") {
                            navigator.geolocation.getCurrentPosition(
                                (pos) => zoomToNearest(pos.coords.latitude, pos.coords.longitude),
                                (err) => console.log("Could not get position:", err.message)
                            );
                        }
                    });
            }

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    const zoomToNearest = async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/locations/nearby?lat=${lat}&lng=${lng}&limit=5`
            );
            if (!res.ok) return;
            const nearest = await res.json();

            if (!map.current) return;

            // Tilføj eller opdater bruger-markeren
            if (userMarker.current) {
                userMarker.current.setLngLat([lng, lat]);
            } else {
                userMarker.current = new mapboxgl.Marker({ color: "#3FB1CE" })
                    .setLngLat([lng, lat])
                    .addTo(map.current);
            }

            const bounds = new mapboxgl.LngLatBounds();
            bounds.extend([lng, lat]);
            nearest.forEach((loc: Location) => {
                bounds.extend([
                    parseFloat(loc.coordinates.lng),
                    parseFloat(loc.coordinates.lat),
                ]);
            });
            map.current.fitBounds(bounds, { padding: 100, maxZoom: 11 });
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async () => {
        setError("");

        try {
            // 1. Geocode adresse → koordinater
            const geocodeRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/geocode?address=${encodeURIComponent(searchTerm)}`
            );
            if (!geocodeRes.ok) {
                const text = await geocodeRes.text();
                setError(text);
                return;
            }
            const { lat, lng } = await geocodeRes.json();
            await zoomToNearest(lat, lng);
        } catch (err) {
            console.error(err);
            setError("Der skete en fejl");
        }
    };

    return (
        <div className="relative w-full h-96 rounded-lg overflow-hidden">
            <div ref={mapContainer} className="w-full h-full" />
            <div className="absolute top-4 left-4 right-4 z-10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Indtast adresse..."
                        className="border rounded px-3 py-2 flex-1 bg-white"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-black text-white px-4 py-2 rounded"
                    >
                        Søg
                    </button>
                </div>
                {error && <p className="text-red-600 mt-2 bg-white px-2 py-1 rounded">{error}</p>}
            </div>
        </div>
    );
}