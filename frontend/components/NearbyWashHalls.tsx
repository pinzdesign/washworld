"use client";

import { useEffect, useRef } from "react";
import WashHallCard, { type Location } from "./WashHallCard";
import { MapPinIcon } from "@heroicons/react/24/solid";

type Props = {
    locations: Location[];
    selectedLocationId: number | null;
    hasGpsPosition: boolean;
    error: string;
    onRequestLocation: () => void;
}

export default function NearbyWashHalls({ locations, selectedLocationId, hasGpsPosition, error, onRequestLocation }: Props) {
    const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    useEffect(() => {
        if (selectedLocationId === null) return;
        const card = cardRefs.current.get(selectedLocationId);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [selectedLocationId]);

    return (
        <div className="bg-[#f7f7f7] px-6 py-8">
            {!error && locations.length === 0 && (
                <div className="bg-white font-extrabold grid place-items-center border border-black/20 rounded-lg w-fit space-y-2 mx-auto px-6 py-4 flex gap-2">
                    <h2>Vi skal bruge din lokation for at vise vaskehaller nær dig.</h2>
                    <button className="bg-[#06C167] hover:bg-[#05a557] text-white font-extrabold px-4 py-2 rounded flex items-center gap-2" onClick={onRequestLocation}>
                        <MapPinIcon className="w-5 h-5" />
                        Brug min lokation
                    </button>
                </div>
            )}
            {error && (
                <div>
                    <p>{error}</p>
                    <button onClick={onRequestLocation}>Brug min lokation</button>
                </div>
            )}
            <div className="grid grid-cols-5 gap-4 items-start">
                {locations.map((loc) => (
                    <div
                        key={loc.Location_id}
                        ref={(el) => {
                            if (el) cardRefs.current.set(loc.Location_id, el);
                            else cardRefs.current.delete(loc.Location_id);
                        }}
                    >
                        <WashHallCard
                            location={loc}
                            isSelected={loc.Location_id === selectedLocationId}
                            hasGpsPosition={hasGpsPosition}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
