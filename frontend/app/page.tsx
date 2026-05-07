"use client";

import { useEffect, useState } from "react";

import Login from "@/components/Login";
import UserProfile from "@/components/UserProfile";
import MembershipsController from "@/components/MembershipsController";
import ServiceHistory from "@/components/ServiceHistory";
import PlateScanner from "@/components/PlateScanner";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(0);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    setToken(storedToken);
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null;

  return (
    <main className="space-y-8">
      <h1 className="text-3xl font-bold">
        Wash World
      </h1>

      {token ? (
        <PlateScanner
          onScanComplete={() =>
          setRefreshHistory((prev) => prev + 1)
          }
        />
      ) : null}

      {!token ? <Login /> : <UserProfile />}

      {token ? <MembershipsController /> : null}

      {token ? (
        <ServiceHistory refreshKey={refreshHistory} />
      ) : null}
      
    </main>
  );
}