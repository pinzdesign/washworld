"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

type MembershipType = {
	membership_type_pk: number;
	membership_type_name: string;
	membership_type_price: number;
	membership_desc: string;
};

export default function CreateMembershipForm({
	onCreated,
}: {
	onCreated?: () => void;
}) {
	const { token } = useAuth();
	const API_URL = process.env.NEXT_PUBLIC_API_URL;

	const [types, setTypes] = useState<MembershipType[]>([]);
	const [carPlate, setCarPlate] = useState("");
	const [selectedType, setSelectedType] = useState<number | "">("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchTypes = async () => {
			try {
				const res = await fetch(`${API_URL}/membership-types`);
				const data = await res.json();
				setTypes(data.membership_types || []);
			} catch (err) {
				console.error(err);
			}
		};

		fetchTypes();
	}, [API_URL]);

	const handleSubmit = async () => {
		setError("");
		setLoading(true);

		try {
			const formData = new FormData();
			formData.append("membership_type_fk", String(selectedType));
			formData.append("car_plate", carPlate);

			const res = await fetch(`${API_URL}/memberships`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			if (!res.ok) {
				const text = await res.text();
				setError(text || "Failed to create membership");
				return;
			}

			setCarPlate("");
			setSelectedType("");

			onCreated?.();
		} catch (err) {
			setError("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4">

			<h2 className="text-lg font-semibold text-gray-80">
				Ny abonnement
			</h2>

			{/* CAR PLATE */}
			<input
				type="text"
				placeholder="Nummerplade"
				value={carPlate}
				onChange={(e) =>
					setCarPlate(e.target.value.toUpperCase())
				}
				className="w-full border border-gray-10 px-3 py-2 focus:outline-none focus:border-brand-green"
			/>

			{/* SELECT */}
			<select
				value={selectedType}
				onChange={(e) =>
					setSelectedType(Number(e.target.value))
				}
				className="w-full border border-gray-10 px-3 py-2 bg-white focus:outline-none focus:border-brand-green"
			>
				<option value="">Vælg Abonnement</option>

				{types.map((t) => (
					<option
						key={t.membership_type_pk}
						value={t.membership_type_pk}
					>
						{t.membership_type_name} — {t.membership_type_price} DKK
					</option>
				))}
			</select>

			{/* BUTTON */}
			<button
				onClick={handleSubmit}
				disabled={loading}
				className="w-full bg-brand-green text-white px-4 py-2 hover:bg-brand-green-alt transition-colors shadow-sm hover:shadow-md"
			>
				{loading ? "Sender..." : "Tilmeld"}
			</button>

			{/* ERROR */}
			{error && (
				<p className="text-sm text-red-500">
					{error}
				</p>
			)}
		</div>
	);
}