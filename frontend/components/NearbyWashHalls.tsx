"use client";

import { useEffect, useRef } from "react";
import WashHallCard, { type Location } from "./WashHallCard";

type Props = {
    locations: Location[];
    selectedLocationId: number | null;
    error: string;
    onRequestLocation: () => void;
}

export default function NearbyWashHalls({ locations, selectedLocationId, error, onRequestLocation }: Props) {
    const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    useEffect(() => {
        if (selectedLocationId === null) return;
        const card = cardRefs.current.get(selectedLocationId);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [selectedLocationId]);

    return (
        <div>
            <h2>Wash World nær dig</h2>
            {!error && locations.length === 0 && (
                <button onClick={onRequestLocation}>Brug min lokation</button>
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
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
