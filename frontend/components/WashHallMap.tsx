"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MapPinIcon } from "@heroicons/react/24/solid";
import type { Location } from "./WashHallCard";

type Props = {
    userPosition: { lat: number; lng: number} | null;
    nearestLocations: Location[];
    onPositionChange: (lat: number, lng: number) => void;
    onRequestLocation: () => void;
    onMarkerClick: (location: Location) => void;
}
export default function WashHallMap({ userPosition, nearestLocations, onPositionChange, onRequestLocation, onMarkerClick }: Props) {
    const onMarkerClickRef = useRef(onMarkerClick);
    useEffect(() => {
        onMarkerClickRef.current = onMarkerClick;
    });
    const markersRef = useRef<Map<number, HTMLDivElement>>(new Map());
    const [markersLoaded, setMarkersLoaded] = useState(false);  
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
            cooperativeGestures: true,
        });

        map.current.addControl(
            new mapboxgl.NavigationControl({ showCompass: false }),
            "bottom-right"
        );

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
                    el.style.cursor = "pointer";
                    el.addEventListener("click", () => onMarkerClickRef.current(loc));

                    markersRef.current.set(loc.Location_id, el);

                    new mapboxgl.Marker({ element: el })
                        .setLngLat([
                            parseFloat(loc.coordinates.lng),
                            parseFloat(loc.coordinates.lat),
                        ])
                        .addTo(map.current!);
                });
                setMarkersLoaded(true);
            })
            .catch((err) => console.error("Failed to load locations:", err));

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    useEffect(() => {
        if (!map.current || !userPosition) return;

        if (userMarker.current) {
            userMarker.current.setLngLat([userPosition.lng, userPosition.lat]);
        } else {
            userMarker.current = new mapboxgl.Marker({ color: "#3FB1CE" })
                .setLngLat([userPosition.lng, userPosition.lat])
                .addTo(map.current);
        }

        if (nearestLocations.length === 0) return;
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([userPosition.lng, userPosition.lat]);
        nearestLocations.forEach((loc) => {
            bounds.extend([parseFloat(loc.coordinates.lng), parseFloat(loc.coordinates.lat)]);
        });
        map.current.fitBounds(bounds, { padding: 100, maxZoom: 11 });
    }, [userPosition, nearestLocations]);

    useEffect(() => {
        if (!markersLoaded) return;
        const nearestIds = new Set(nearestLocations.map((l) => l.Location_id));
        markersRef.current.forEach((el, id) => {
            const isNearest = nearestIds.has(id);
            el.style.backgroundImage = isNearest
                ? "url(/washworld-marker-nearest.svg)"
                : "url(/washworld-marker.svg)";
            el.style.filter = isNearest
                ? "drop-shadow(0px 2px 6px rgba(0,0,0,1))"
                : "";
        });
    }, [nearestLocations, markersLoaded]);

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
            await onPositionChange(lat, lng);
        } catch (err) {
            console.error(err);
            setError("Der skete en fejl");
        }
    };


    return (
        <div className="relative w-full h-96">
            <div ref={mapContainer} className="w-full h-full" />
            <div className="absolute top-4 left-4 right-4 z-10">
                <div className="flex gap-2">
                    <button
                        onClick={onRequestLocation}
                        className="bg-black text-white px-4 py-2"
                        aria-label="Find min position"
                    >
                        <MapPinIcon className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Indtast adresse..."
                        className="border px-3 py-2 flex-1 bg-white"
                    />
                </div>
                {error && <p className="text-red-600 mt-2 bg-white px-2 py-1">{error}</p>}
            </div>
        </div>
    );
}