import { useEffect, useState } from "react";
import { ArrowTurnUpRightIcon } from "@heroicons/react/24/solid";


type ServiceUnit = {
    total_count: number;
};

export type Location = {
    Location_id: number;
    name: string;
    image: string;
    address: string;
    coordinates: { lat: string; lng: string };
    service_units: {
        hall: ServiceUnit;
        self_wash: ServiceUnit;
        vacuum: ServiceUnit;
        pre_wash: ServiceUnit;
        mat_cleaner: ServiceUnit;
    };
    load_profile?: Record<string, number>;
    adjusted_load_profile?: Record<string, number>;
    distance_km?: number;
    duration_min?: number;
    operational_message?: string;
}

type Props = {
    location: Location;
    isSelected?: boolean;
};

const FACILITY_LABELS: Record<string, string> = {
    hall: "Vaskehaller",
    self_wash: "Selvvask",
    vacuum: "Støvsuger",
    pre_wash: "Forvask",
    mat_cleaner: "Måtterens",
};

function loadHeight(load: number) {
    if (load >= 0.76) return 100;   // 4/4
    if (load >= 0.585) return 75;    // 3/4
    if (load >= 0.292) return 50;    // 2/4
    return 25;                       // 1/4
}

function loadColor(load: number) {
    if (load >= 0.76) return "#FF6B06";   // orange — travlt
    if (load >= 0.585) return "#FFC106";  // gul — mellem
    return "#06C167";                     // grøn — roligt
}

export default function WashHallCard({ location, isSelected }: Props) {
    const [currentHour, setCurrentHour] = useState<number | null>(null);

    useEffect(() => {
        setCurrentHour(new Date().getHours());
    }, []);

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`;

    return (
        <div className={`rounded-lg overflow-hidden bg-[#f7f7f7] ${
            isSelected ? "ring-4 ring-[#06C167]" : "border border-black/20"
        }`}>
            {location.image && (
                <img src={location.image} alt={location.name} className="w-full h-40 object-cover" />
            )}
            <div className="p-4 space-y-3">
                <h3 className="font-extrabold text-lg truncate">{location.name}</h3>
                <div className="min-h-12">
                    <p className="font-light text-sm text-gray-600 ">{location.address}</p>
                </div>

                
                {/* Distance + Rutevejledning */}
                {location.distance_km !== undefined && (
                    <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#06C167]">{location.distance_km} km</span>
                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-extrabold bg-[#06C167] text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                        >
                            <ArrowTurnUpRightIcon className="w-4 h-4 font-extrabold" />
                            Rute
                        </a>
                    </div>
                )}

                {/* Faciliteter */}
                <div className="grid grid-cols-2 gap-1 text-sm min-h-12">
                    {Object.entries(FACILITY_LABELS).map(([key, label]) => {
                        const count = location.service_units[key as keyof typeof location.service_units]?.total_count ?? 0;
                        if (count === 0) return null;
                        return (
                            <div className="font-extrabold" key={key}>
                                {label}: {count}
                            </div>
                        );
                    })}
                </div>


                {/* Drifts-besked (kun hvis der er en) */}
                {location.operational_message && (
                    <p className="text-sm text-orange-700 bg-orange-50 rounded p-2">
                        {location.operational_message}
                    </p>
                )}

                {/* Travlhed-graf */}
                {location.adjusted_load_profile && (
                    <div>
                        <div className="flex items-end gap-1 h-16 border-b border-gray-200">
                            {Object.entries(location.adjusted_load_profile).map(([time, load]) => {
                                const hour = parseInt(time);
                                const isNow = hour === currentHour;
                                return (
                                    <div
                                        key={time}
                                        className={`flex-1 rounded ${isNow ? "ring-2 ring-black" : ""}`}
                                        style={{
                                            height: `${loadHeight(load)}%`,
                                            backgroundColor: loadColor(load),
                                        }}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{Object.keys(location.adjusted_load_profile)[0]}</span>
                            <span>{Object.keys(location.adjusted_load_profile).slice(-1)[0]}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
