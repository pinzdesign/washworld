"use client";

import { useState } from "react";

import { useAuth } from "@/components/AuthContext";

import Login from "@/components/Login";
import UserProfile from "@/components/UserProfile";
import MembershipsController from "@/components/MembershipsController";
import ServiceHistory from "@/components/ServiceHistory";
import PlateScanner from "@/components/PlateScanner";
import LocationsExplorer from "@/components/LocationsExplorer";

export default function Home() {
	const { isLoggedIn } = useAuth();

	const [refreshKey, setRefreshKey] = useState(0);

	return (
		<main className="space-y-8">
			<h1 className="text-3xl font-bold">
				Wash World
			</h1>

			<LocationsExplorer />

			<PlateScanner
				onScanSuccess={() => {
					setRefreshKey((k) => k + 1);
				}}
			/>

			{/* Auth-driven rendering */}
			{!isLoggedIn ? (
				<Login />
			) : (
				<>
					<UserProfile />
					<MembershipsController />
					<ServiceHistory refreshKey={refreshKey} />
				</>
			)}
		</main>
	);
}