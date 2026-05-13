"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";

type AuthContextType = {
	isLoggedIn: boolean;
	token: string | null;
	login: (token: string) => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [token, setToken] = useState<string | null>(null);

	const isLoggedIn = !!token;

	// load once on app start
	useEffect(() => {
		const stored = localStorage.getItem("token");
		if (stored) setToken(stored);
	}, []);

	const login = (newToken: string) => {
		localStorage.setItem("token", newToken);
		setToken(newToken);
	};

	const logout = () => {
		localStorage.removeItem("token");
		setToken(null);
	};

	return (
		<AuthContext.Provider
			value={{ isLoggedIn, token, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx)
		throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}