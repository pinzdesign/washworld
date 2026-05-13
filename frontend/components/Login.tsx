"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function Login() {
	const baseURL = process.env.NEXT_PUBLIC_API_URL;

	const { isLoggedIn, login } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		setError("");
		setLoading(true);

		try {
			const formData = new FormData();
			formData.append("user_email", email);
			formData.append("user_password", password);

			const res = await fetch(`${baseURL}/login`, {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				const text = await res.text();
				setError(text || "Login failed");
				return;
			}

			const data = await res.json();

			login(data.token); // 🔥 triggers global state update
		} catch (err) {
			console.error(err);
			setError("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="flex flex-col gap-3">
			<input
				type="email"
				placeholder="Email"
				onChange={(e) => setEmail(e.target.value)}
			/>

			<input
				type="password"
				placeholder="Password"
				onChange={(e) => setPassword(e.target.value)}
			/>

			<button
				onClick={handleLogin}
				type="submit"
				disabled={loading}
				className="border border-black/20 rounded"
			>
				{loading ? "Logger ind..." : "Logind"}
			</button>

			{error && (
				<p style={{ color: "red" }}>
					{error}
				</p>
			)}
		</form>
	);
}