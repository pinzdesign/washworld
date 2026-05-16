"use client";

import { useState } from "react";
import Link from "next/link";

import { useAuth } from "@/components/AuthContext";

import MembershipsController from "@/components/MembershipsController";
import ServiceHistory from "@/components/ServiceHistory";
import PlateScanner from "@/components/PlateScanner";
import LocationsExplorer from "@/components/LocationsExplorer";
import UserProfile from "@/components/UserProfile";

export default function Home() {
	const { isLoggedIn } = useAuth();

	const [refreshKey, setRefreshKey] = useState(0);

	return (
		<main className="space-y-8">

			{/* FULL WIDTH MAP */}
			<div className="full-bleed">
				<LocationsExplorer />
			</div>

			{/* SCANNER */}
			<div className="container-wide">
				<PlateScanner
					onScanSuccess={() => {
						setRefreshKey((k) => k + 1);
					}}
				/>
			</div>

			{/* DASHBOARD */}
			{isLoggedIn && (
				<div className="container-wide">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

						{/* LEFT COLUMN */}
						<div className="lg:col-span-6 space-y-8 px-9 py-12 border border-black/10 bg-white">

							<UserProfile />

							<div className="border-t border-gray-10 pt-6">
								<MembershipsController mode="dashboard" />
								<Link
									href="/subscriptions"
									className="text-sm text-brand-green hover:underline"
								>
									Vis alle abonnementer
								</Link>
							</div>

						</div>

						{/* RIGHT COLUMN */}
						<div className="lg:col-span-6 px-9 py-12 border border-black/10 bg-white">
							<ServiceHistory refreshKey={refreshKey} />
							<Link
								href="/history"
								className="text-sm text-brand-green hover:underline"
							>
								Vis hele historikken
							</Link>
						</div>

					</div>
				</div>
			)}

		</main>
	);
}