"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

type User = {
	first_name: string;
	last_name: string;
	email: string;
	status: string;
	washcoins: number;
	phone: number;
	verified_at: number;
};

export default function UserProfile() {
	const { isLoggedIn, token, logout } = useAuth();

	const baseURL = process.env.NEXT_PUBLIC_API_URL;

	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!isLoggedIn || !token) return;

		const fetchUser = async () => {
			try {
				setLoading(true);
				setError("");

				const res = await fetch(`${baseURL}/user`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!res.ok) {
					throw new Error("Failed to fetch user");
				}

				const data = await res.json();
				setUser(data.user);
			} catch (err) {
				console.error(err);
				setError("Could not load user profile");
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, [isLoggedIn, token, baseURL]);

	// auth guard
	if (!isLoggedIn) return null;

	if (loading) return <p>Henter profil info...</p>;
	if (error) return <p>{error}</p>;
	if (!user) return <p>Bruger findes ikke.</p>;

	return (
		<div>
			<h2>Profil Info</h2>

			<p>{user.status}</p>
			<p>Navn: {user.first_name}</p>
			<p>Efternavn: {user.last_name}</p>
			<p>Email: {user.email}</p>
			<p>Tlf: {user.phone}</p>
			<p>WashCoins: {user.washcoins}</p>
		</div>
	);
}