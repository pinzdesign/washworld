"use client";

import { useEffect, useState } from "react";

import Login from "@/components/Login";
import UserProfile from "@/components/UserProfile";
import MembershipsController from "@/components/MembershipsController";
import ServiceHistory from "@/components/ServiceHistory";
import PlateScanner from "@/components/PlateScanner";
import LocationsExplorer from "@/components/LocationsExplorer";

export default function Home() {
	const [token, setToken] = useState<string | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		setToken(localStorage.getItem("token"));
		setIsLoaded(true);
	}, []);

	if (!isLoaded) return null;

	return (
		<main className="space-y-8">
			<h1 className="text-3xl font-bold">Wash World</h1>

			<LocationsExplorer />

			<PlateScanner
				onScanSuccess={() => {
					setRefreshKey((k) => k + 1);
				}}
			/>

			{!token ? <Login /> : <UserProfile />}

			{token && <MembershipsController />}

			{token && (
				<ServiceHistory refreshKey={refreshKey} />
			)}
		</main>
	);
}