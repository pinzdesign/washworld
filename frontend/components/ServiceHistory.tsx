"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import ServiceHistoryCard from "./ServiceHistoryCard";

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
	mode = "dashboard",
}: {
	refreshKey?: number;
	mode?: "dashboard" | "full";
}) {
	const { isLoggedIn, token } = useAuth();

	const [history, setHistory] = useState<ServiceHistoryItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [page, setPage] = useState(0);

	const API_URL = process.env.NEXT_PUBLIC_API_URL;
	const pageSize = 10;

	const limit = mode === "dashboard" ? 10 : pageSize;
	const offset = mode === "dashboard" ? 0 : page * pageSize;

	useEffect(() => {
		if (!isLoggedIn || !token) return;

		const fetchHistory = async () => {
			try {
				setLoading(true);
				setError("");

				const res = await fetch(
					`${API_URL}/history?limit=${limit}&offset=${offset}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!res.ok) throw new Error("Failed to fetch history");

				const data = await res.json();
				setHistory(data.history || []);
			} catch {
				setError("Could not load service history");
			} finally {
				setLoading(false);
			}
		};

		fetchHistory();
	}, [refreshKey, isLoggedIn, token, API_URL, limit, offset]);

	if (!isLoggedIn) return null;

	if (loading) return <p className="text-sm text-gray-60">Henter historik...</p>;
	if (error) return <p className="text-sm text-red-500">{error}</p>;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-gray-80">
					Vaske Historik
				</h2>
			</div>

			<div className="space-y-2">
				{history.map((item, index) => (
					<ServiceHistoryCard
						key={item.service_history_pk}
						item={item}
						isLast={index === history.length - 1}
					/>
				))}
			</div>

			{mode === "full" && (
				<div className="flex justify-between pt-4">
					<button
						disabled={page === 0}
						onClick={() => setPage((p) => Math.max(p - 1, 0))}
						className={`px-4 py-2 text-sm transition ${
							page === 0
								? "bg-gray-5 text-gray-60 cursor-not-allowed"
								: "bg-brand-green text-white shadow-md hover:bg-brand-green-alt"
						}`}
					>
						Forrige
					</button>

					<button
						onClick={() => setPage((p) => p + 1)}
						className={`px-4 py-2 text-sm transition ${
							history.length < 10
								? "bg-gray-5 text-gray-60 cursor-not-allowed"
								: "bg-brand-green text-white shadow-md hover:bg-brand-green-alt"
						}`}
						disabled={history.length < 10}
					>
						Næste
					</button>
				</div>
			)}
		</div>
	);
}