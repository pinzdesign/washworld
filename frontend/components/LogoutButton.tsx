"use client";

import { useAuth } from "./AuthContext";

export default function LogoutButton() {
	const { logout } = useAuth();

	return (
		<button onClick={logout}>
			Logout
		</button>
	);
}