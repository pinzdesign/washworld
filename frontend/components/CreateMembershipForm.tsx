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

	// -------------------------
	// fetch membership types
	// -------------------------
	useEffect(() => {
		const fetchTypes = async () => {
			try {
				const res = await fetch(
					`${API_URL}/membership-types`
				);

				const data = await res.json();
				setTypes(data.membership_types || []);
			} catch (err) {
				console.error(err);
			}
		};

		fetchTypes();
	}, [API_URL]);

	// -------------------------
	// submit membership
	// -------------------------
	const handleSubmit = async () => {
		setError("");
		setLoading(true);

		try {
			const formData = new FormData();
			formData.append(
				"membership_type_fk",
				String(selectedType)
			);
			formData.append("car_plate", carPlate);

			const res = await fetch(
				`${API_URL}/memberships`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				}
			);

			if (!res.ok) {
				const text = await res.text();
				setError(text || "Failed to create membership");
				return;
			}

			setCarPlate("");
			setSelectedType("");

			onCreated?.(); // refresh parent list
		} catch (err) {
			console.error(err);
			setError("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4 border p-4 rounded-xl">
			<h2 className="text-xl font-bold">
				Ny abonnement
			</h2>

			{/* car plate */}
			<input
				type="text"
				placeholder="Nummerplade"
				value={carPlate}
				onChange={(e) =>
					setCarPlate(e.target.value.toUpperCase())
				}
				className="border p-2 rounded w-full"
			/>

			{/* selector */}
			<select
				value={selectedType}
				onChange={(e) =>
					setSelectedType(Number(e.target.value))
				}
				className="border p-2 rounded w-full"
			>
				<option value="">Vælg Abonnement</option>

				{types.map((t) => (
					<option
						key={t.membership_type_pk}
						value={t.membership_type_pk}
					>
						{t.membership_type_name} —{" "}
						{t.membership_type_price} DKK
					</option>
				))}
			</select>

			{/* submit */}
			<button
				onClick={handleSubmit}
				disabled={loading}
				className="bg-black text-white px-4 py-2 rounded"
			>
				{loading ? "Sender..." : "Tilmeld"}
			</button>

			{error && (
				<p className="text-red-500">{error}</p>
			)}
		</div>
	);
}