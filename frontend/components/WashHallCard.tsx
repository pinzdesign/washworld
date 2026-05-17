import { useEffect, useState } from "react";
import { ArrowTurnUpRightIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";


type ServiceUnit = {
    total_count: number;
    out_of_service: number;
    out_of_service_note: string;
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
}

type Props = {
    location: Location;
    isSelected?: boolean;
    hasGpsPosition?: boolean;
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

export default function WashHallCard({ location, isSelected, hasGpsPosition }: Props) {
    const [currentHour, setCurrentHour] = useState<number | null>(null);

    useEffect(() => {
        setCurrentHour(new Date().getHours());
    }, []);

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`;

    return (
        <div className={`h-full flex flex-col overflow-hidden ring-1 ring-black/10 ${
            isSelected ? "bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.6)]" : "bg-gray-5"
        }`}>
            {location.image && (
                <img src={location.image} alt={location.name} className="w-full h-40 object-cover" />
            )}
            <div className="p-4 flex flex-col gap-3 flex-1">
                <h3 className="font-extrabold text-lg truncate">{location.name}</h3>
                <div className="min-h-12">
                    <p className="font-light text-sm text-gray-600 ">{location.address}</p>
                </div>

                
                {/* Distance + Rutevejledning */}
                {location.distance_km !== undefined && (
                    <div className="flex items-center">
                        {hasGpsPosition && (
                            <span className="font-extrabold text-brand-green">{location.distance_km} km</span>
                        )}
                        <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto font-light bg-brand-green text-white px-3 py-1 flex items-center gap-1 text-sm w-1/2 justify-center"
                        >
                            <ArrowTurnUpRightIcon className="w-4 h-4 font-light" />
                            Rute
                        </a>
                    </div>
                )}

                {/* Faciliteter */}
                <div className="flex flex-col gap-1 text-sm">
                    {Object.entries(FACILITY_LABELS).map(([key, label]) => {
                        const unit = location.service_units[key as keyof typeof location.service_units];
                        const count = unit?.total_count ?? 0;
                        if (count === 0) return null;
                        const outOfService = unit?.out_of_service ?? 0;
                        const note = unit?.out_of_service_note ?? "";
                        const allOutOfService = outOfService >= count;

                        return (
                            <div
                                key={key}
                                className="flex items-center justify-between gap-2 font-light"
                            >
                                <span className={allOutOfService ? "line-through" : ""}>
                                    {label}: {count}
                                </span>
                                {outOfService > 0 && (
                                    <span
                                        className="inline-flex items-center gap-1 bg-splash/10 text-splash px-2 py-0.5 text-xs font-extrabold"
                                        title={note}
                                    >
                                        <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                        {outOfService}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Travlhed-graf */}
                {location.adjusted_load_profile && (
                    <div className="mt-auto">
                        <div className="flex items-end gap-1 h-16 border-b border-gray-200">
                            {Object.entries(location.adjusted_load_profile).map(([time, load]) => {
                                const hour = parseInt(time);
                                const isNow = hour === currentHour;
                                return (
                                    <div
                                        key={time}
                                        className={`flex-1 ${isNow ? "border" : ""}`}
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
