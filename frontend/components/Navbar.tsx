"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { useState, useRef, useEffect } from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export function Navbar() {
    const { isLoggedIn, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    return (
        <nav className="bg-[#06C167] flex items-center justify-between px-6 py-3">
            <div className="navbar-brand">
                <a className="navbar-item" href="/">
                    <img
                        src="https://washworld.dk/assets/brand/logo.svg"
                        alt="WashWorld logo"
                        className="h-10"
                    />
                </a>
            </div>
            {!isLoggedIn ? (
                <div className="flex items-center gap-6 text-white font-extrabold">
                    <Link className="" href="/login">Log ind</Link>
                    <Link className="" href="/signup">Opret bruger</Link>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-6 text-white font-extrabold">
                        <Link className="" href="/">Dashboard</Link>
                        <Link className="" href="/subscriptions">Abonnementer</Link>
                        <Link className="" href="/history">historik</Link>
                        
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center"
                                aria-label="Bruger menu"
                            >
                                <UserCircleIcon className="w-8 h-8" />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg py-1 min-w-[160px] z-20">
                                    <Link
                                        href="/user"
                                        className="block px-4 py-2 hover:bg-gray-100"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Min konto
                                    </Link>
                                    <button
                                        onClick={() => { 
                                            logout(); 
                                            setMenuOpen(false);
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
                </>
            )}
            
        </nav>
    );
}