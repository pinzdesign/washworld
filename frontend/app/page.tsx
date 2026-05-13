"use client";

import { useState } from "react";

import { useAuth } from "@/components/AuthContext";

import MembershipsController from "@/components/MembershipsController";
import ServiceHistory from "@/components/ServiceHistory";
import PlateScanner from "@/components/PlateScanner";
import LocationsExplorer from "@/components/LocationsExplorer";

export default function Home() {
	const { isLoggedIn } = useAuth();

	const [refreshKey, setRefreshKey] = useState(0);

	return (
		<main className="space-y-8">
			

			<LocationsExplorer />

			<PlateScanner
				onScanSuccess={() => {
					setRefreshKey((k) => k + 1);
				}}
			/>

			{isLoggedIn && (
          <>
              <MembershipsController />
              <ServiceHistory refreshKey={refreshKey} />
          </>
      )}
		</main>
	);
}