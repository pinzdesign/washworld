"use client";

import { useEffect, useState } from "react";
import MembershipCard from "./MembershipCard";

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
	const baseURL = process.env.NEXT_PUBLIC_API_URL;

	const [memberships, setMemberships] = useState<Membership[]>([]);
	
	const [loading, setLoading] = useState(true);

	const fetchMemberships = async () => {
		const token = localStorage.getItem("token");

		const res = await fetch(`${baseURL}/memberships`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const data = await res.json();
		setMemberships(data.memberships);
		setLoading(false);
	};

	useEffect(() => {
		fetchMemberships();
	}, []);

	const handleDelete = async (membership_pk: number) => {
		const token = localStorage.getItem("token");

		try {
			const res = await fetch(
				`${baseURL}/memberships/${membership_pk}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const text = await res.text();

			if (!res.ok) {
				alert(text);
				return;
			}

			// remove from UI without refetch
			setMemberships((prev: any[]) =>
				prev.filter((m) => m.membership_pk !== membership_pk)
			);

		} catch (err) {
			console.error(err);
			alert("Error deleting membership");
		}
	};

	if (loading) return <p>Loading...</p>;

	return (
		<div>
			<h2>Your memberships</h2>

			{memberships.map((m: any) => (
				<MembershipCard
					key={m.membership_pk}
					membership={m}
					onDelete={handleDelete}
				/>
			))}
		</div>
	);
}