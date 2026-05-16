"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { useState, useRef, useEffect } from "react";
import {
	UserCircleIcon,
	Bars3Icon,
	XMarkIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export function Navbar() {
	const { isLoggedIn, logout } = useAuth();
	const router = useRouter();

	// separate states
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	// separate refs
	const userMenuRef = useRef<HTMLDivElement>(null);
	const mobileMenuRef = useRef<HTMLDivElement>(null);

	// close user menu on outside click
	useEffect(() => {
		const onClickOutside = (e: MouseEvent) => {
			if (
				userMenuRef.current &&
				!userMenuRef.current.contains(e.target as Node)
			) {
				setUserMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", onClickOutside);
		return () => document.removeEventListener("mousedown", onClickOutside);
	}, []);

	// close mobile menu on outside click
	useEffect(() => {
		const onClickOutside = (e: MouseEvent) => {
			if (
				mobileMenuRef.current &&
				!mobileMenuRef.current.contains(e.target as Node)
			) {
				setMobileMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", onClickOutside);
		return () => document.removeEventListener("mousedown", onClickOutside);
	}, []);

	const NavLinks = ({ onClick }: { onClick?: () => void }) => (
		<div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6">
			<Link href="/" onClick={onClick} className="py-1 lg:py-0">
				Dashboard
			</Link>
			<Link href="/subscriptions" onClick={onClick} className="py-1 lg:py-0">
				Abonnementer
			</Link>
			<Link href="/history" onClick={onClick} className="py-1 lg:py-0">
				Historik
			</Link>
		</div>
	);

	return (
		<nav className="fixed top-0 left-0 z-50 w-full bg-brand-green/95 backdrop-blur-sm flex items-center justify-between px-6 py-3 text-white font-extrabold shadow-md">

			{/* LOGO */}
			<Link href="/">
				<img
					src="https://washworld.dk/assets/brand/logo.svg"
					alt="WashWorld logo"
					className="h-10"
				/>
			</Link>

			{/* DESKTOP */}
			{isLoggedIn && (
				<div className="hidden lg:flex items-center gap-6">

					<NavLinks />

					<div className="relative" ref={userMenuRef}>
						<button
							onClick={() => setUserMenuOpen(!userMenuOpen)}
							aria-label="Bruger menu"
						>
							<UserCircleIcon className="w-8 h-8" />
						</button>

						{userMenuOpen && (
							<div className="absolute right-0 mt-2 bg-white text-black py-1 min-w-[160px] z-20">
								<Link
									href="/user"
									className="block px-4 py-2 hover:bg-gray-100"
									onClick={() => setUserMenuOpen(false)}
								>
									Min konto
								</Link>

								<button
									onClick={() => {
										logout();
										setUserMenuOpen(false);
										router.push("/");
									}}
									className="w-full text-left px-4 py-2 hover:bg-gray-100"
								>
									Log ud
								</button>
							</div>
						)}
					</div>
				</div>
			)}

			{/* MOBILE */}
			{isLoggedIn && (
				<div className="lg:hidden relative" ref={mobileMenuRef}>
					<button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
						{mobileMenuOpen ? (
							<XMarkIcon className="w-7 h-7" />
						) : (
							<Bars3Icon className="w-7 h-7" />
						)}
					</button>

					{mobileMenuOpen && (
						<div className="absolute right-0 mt-2 bg-white text-black w-52 shadow-lg py-2 z-20">
							<div className="px-4 py-2">
								<NavLinks onClick={() => setMobileMenuOpen(false)} />
							</div>

							<hr className="my-2" />

							<Link
								href="/user"
								className="block px-4 py-2 hover:bg-gray-100"
								onClick={() => setMobileMenuOpen(false)}
							>
								Min konto
							</Link>

							<button
								onClick={() => {
									logout();
									setMobileMenuOpen(false);
									router.push("/");
								}}
								className="w-full text-left px-4 py-2 hover:bg-gray-100"
							>
								Log ud
							</button>
						</div>
					)}
				</div>
			)}

			{/* NOT LOGGED IN */}
			{!isLoggedIn && (
				<div className="hidden lg:flex items-center gap-6 text-white">
					<Link href="/login">Log ind</Link>
					<Link href="/signup">Opret bruger</Link>
				</div>
			)}
		</nav>
	);
}