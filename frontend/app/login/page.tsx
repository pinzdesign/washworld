"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Login from "@/components/Login";

export default function LoginPage() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoggedIn) router.push("/");
    }, [isLoggedIn, router]);

    return (
        <main className="max-w-md mx-auto px-18 py-12 border border-black/20 bg-white mt-12">
            <h1 className="text-2xl font-extrabold mb-6">Log ind</h1>
            <Login />
        </main>
    );
}