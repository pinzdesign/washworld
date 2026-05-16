"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Signup from "@/components/Signup";

export default function SignupPage() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoggedIn) router.push("/");
    }, [isLoggedIn, router]);

    return (
        <main className="mx-6 px-4 py-6 lg:w-1/2 lg:mx-auto lg:px-18 lg:py-12 border border-black/10 bg-white mt-12">
            <h1 className="text-xl lg:text-2xl font-extrabold mb-6">Opret bruger</h1>
            <Signup />
        </main>
    );
}