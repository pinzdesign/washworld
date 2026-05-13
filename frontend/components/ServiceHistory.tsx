"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

type ServiceHistoryItem = {
	service_history_pk: number;
	service_fk: number;
	membership_fk: number | null;
	department_ext_id: string;
	base_price: number;
	final_price: number;
	covered_by_membership: boolean;
	service_at: number;
	service_name: string;
	service_type: string;
	car_plate: string | null;
	membership_type_name: string | null;
	user_first_name: string | null;
	user_last_name: string | null;
};

export default function ServiceHistory({
	refreshKey,
}: {
	refreshKey: number;
}) {
	const { isLoggedIn, token } = useAuth();

	const [history, setHistory] = useState<
		ServiceHistoryItem[]
	>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const API_URL = process.env.NEXT_PUBLIC_API_URL;

	useEffect(() => {
		if (!isLoggedIn || !token) return;

		const fetchHistory = async () => {
			try {
				setLoading(true);
				setError("");

				const res = await fetch(`${API_URL}/history`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!res.ok) {
					throw new Error("Failed to fetch history");
				}

				const data = await res.json();
				setHistory(data.history || []);
			} catch (err) {
				console.error(err);
				setError("Could not load service history");
			} finally {
				setLoading(false);
			}
		};

		fetchHistory();
	}, [refreshKey, isLoggedIn, token, API_URL]);

	// auth guard
	if (!isLoggedIn) return null;

	if (loading) return <p>Henter historik...</p>;
	if (error) return <p>{error}</p>;
	if (!history.length)
		return <p>Kunne ikke hente historik.</p>;

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold">
				Vaske Historik
			</h2>

			{history.map((item) => (
				<div
					key={item.service_history_pk}
					className="border rounded-xl p-4 space-y-2"
				>
					<div>
						<h3 className="font-semibold">
							{item.service_name}
						</h3>

						<p className="text-sm text-gray-500">
							{item.service_type.toUpperCase()} vask
						</p>

						<p className="text-sm">
							Nummerplade: {item.car_plate || "Unknown"}
						</p>

						<p className="text-sm">
							Afdeling: {item.department_ext_id}
						</p>

						<p className="text-sm">
							Vasket af:{" "}
							{item.user_first_name
								? `${item.user_first_name} ${item.user_last_name ?? ""}`
								: "Unknown"}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}