"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useIsPwa } from "./useIsPwa";
import {
	HomeIcon,
	CreditCardIcon,
	ClockIcon,
} from "@heroicons/react/24/solid";

const ITEMS = [
	{ href: "/", label: "Dashboard", Icon: HomeIcon },
	{ href: "/subscriptions", label: "Abonnementer", Icon: CreditCardIcon },
	{ href: "/history", label: "Historik", Icon: ClockIcon },
];

export function BottomNav() {
	const isPwa = useIsPwa();
	const { isLoggedIn } = useAuth();
	const pathname = usePathname();

	if (!isPwa || !isLoggedIn) return null;

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10 flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)]">
			{ITEMS.map(({ href, label, Icon }) => {
				const active = pathname === href;
				return (
					<Link
						key={href}
						href={href}
						className={`flex flex-col items-center gap-1 px-4 py-2 text-xs ${
							active ? "text-brand-green" : "text-gray-60"
						}`}
					>
						<Icon className="w-6 h-6" />
						<span>{label}</span>
					</Link>
				);
			})}
		</nav>
	);
}
