"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import UserProfile from "@/components/UserProfile";

export default function UserPage() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoggedIn) router.push("/login");
    }, [isLoggedIn, router]);

    return (
        <main className="max-w-md mx-auto px-18 py-12 border border-black/20 bg-[#f7f7f7] rounded mt-12">
            <h1 className="text-2xl font-extrabold mb-6">Min konto</h1>
            <UserProfile />
        </main>
    );
}
