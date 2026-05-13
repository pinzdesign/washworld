"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import MembershipCard from "./MembershipCard";
import CreateMembershipForm from "./CreateMembershipForm";

type Membership = {
	membership_pk: number;
	car_plate: string;
	membership_status: string;
	membership_start_at: number;
	membership_end_at: number | null;
	membership_type_name: string;
	membership_type_price: number;
	membership_desc: string;
};

export default function MembershipsController() {
	const { isLoggedIn, token } = useAuth();
	const baseURL = process.env.NEXT_PUBLIC_API_URL;

	const [memberships, setMemberships] = useState<Membership[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// -------------------------
	// FETCH memberships
	// -------------------------
	const fetchMemberships = useCallback(async () => {
		if (!token) return;

		try {
			setLoading(true);
			setError("");

			const res = await fetch(`${baseURL}/memberships`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				throw new Error("Failed to fetch memberships");
			}

			const data = await res.json();
			setMemberships(data.memberships || []);
		} catch (err) {
			console.error(err);
			setError("Kunne ikke hente medlemskaber");
		} finally {
			setLoading(false);
		}
	}, [token, baseURL]);

	useEffect(() => {
		if (!isLoggedIn || !token) return;
		fetchMemberships();
	}, [isLoggedIn, token, fetchMemberships]);

	// -------------------------
	// DELETE (soft cancel, doesn't really delete membership, but edits it, hence a patch method)
	// -------------------------
	const handleDelete = async (membership_pk: number) => {
		try {
			if (!token) return;

			const res = await fetch(
				`${baseURL}/memberships/${membership_pk}`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!res.ok) {
				const text = await res.text();
				alert(text);
				return;
			}

			// optimistic update
			setMemberships((prev) =>
				prev.filter(
					(m) => m.membership_pk !== membership_pk
				)
			);
		} catch (err) {
			console.error(err);
			alert("Fejl, kunne ikke slette medlemskab");
		}
	};

	if (!isLoggedIn) return null;

	if (loading) return <p>Henter medlemskaber...</p>;
	if (error) return <p>{error}</p>;

	return (
		<div>
			<h2>Medlemskaber</h2>

			{memberships.length === 0 ? (
				<p>Ingen medlemskaber fundet.</p>
			) : (
				memberships.map((m) => (
					<MembershipCard
						key={m.membership_pk}
						membership={m}
						onDelete={handleDelete}
					/>
				))
			)}

			<CreateMembershipForm
				onCreated={fetchMemberships}
			/>
		</div>
	);
}