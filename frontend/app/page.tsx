"use client";

import { useEffect, useState } from "react";
import Login from "@/components/Login";
import UserProfile from "@/components/UserProfile";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    setIsLoaded(true);
  }, []);

  // Prevent render until client is ready
  if (!isLoaded) return null;

  return (
    <main>
      <h1>Wash World</h1>

      {!token ? <Login /> : <UserProfile />}
    </main>
  );
}