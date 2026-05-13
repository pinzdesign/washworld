"use client";

import { useState } from "react";
import Register from "./Register";
import { useAuth } from "./AuthContext";

export default function Login() {
	const baseURL = process.env.NEXT_PUBLIC_API_URL;

	const { isLoggedIn, login } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showRegister, setShowRegister] = useState(false);
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

	// 🔒 login form only (no logout UI here anymore)
	if (showRegister) {
		return (
			<div>
				<Register />
				<button onClick={() => setShowRegister(false)}>
					Tilbage
				</button>
			</div>
		);
	}

	if (isLoggedIn) {
		return <p>You are already logged in</p>;
	}

	return (
		<div>
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
				disabled={loading}
			>
				{loading ? "Logger ind..." : "Logind"}
			</button>

			<button onClick={() => setShowRegister(true)}>
				Ny bruger
			</button>

			{error && (
				<p style={{ color: "red" }}>
					{error}
				</p>
			)}
		</div>
	);
}