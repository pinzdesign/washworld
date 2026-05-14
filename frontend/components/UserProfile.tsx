"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

import {
	UserIcon,
	EnvelopeIcon,
	PhoneIcon,
	CurrencyDollarIcon,
	TagIcon,
} from "@heroicons/react/24/outline";

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
	const { isLoggedIn, token } = useAuth();

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
			} catch {
				setError("Could not load profile");
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, [isLoggedIn, token, baseURL]);

	if (!isLoggedIn) return null;

	if (loading) {
		return (
			<div className="border border-gray-10 p-4 text-sm text-gray-60">
				Henter profil...
			</div>
		);
	}

	if (error) {
		return (
			<div className="border border-gray-10 p-4 text-sm text-red-500">
				{error}
			</div>
		);
	}

	if (!user) {
		return (
			<div className="border border-gray-10 p-4 text-sm text-gray-60">
				Bruger findes ikke.
			</div>
		);
	}

	return (
		<div className="">

			{/* HEADER */}
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-3">
					<div>
						<h2 className="text-xl font-semibold text-gray-80">
							{user.first_name} {user.last_name}
						</h2>

						<p className="text-base text-gray-60">
							{user.status}
						</p>
					</div>
				</div>
			</div>

			{/* INFO GRID */}
			<div className="space-y-4 text-base leading-relaxed text-gray-60">

				<div className="flex items-center gap-3">
					<EnvelopeIcon className="w-5 h-5 text-gray-60" />
					<span className="text-lg">{user.email}</span>
				</div>

				<div className="flex items-center gap-3">
					<PhoneIcon className="w-5 h-5 text-gray-60" />
					<span className="text-lg">{user.phone}</span>
				</div>

				<div className="flex items-center gap-3">
					<CurrencyDollarIcon className="w-5 h-5 text-gray-60" />
					<span className="text-lg">{user.washcoins} WashCoins</span>
				</div>

			</div>

		</div>
	);
}