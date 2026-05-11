"use client";

import { useState } from "react";

export default function SimulateScanButton({
  onScanSuccess,
}: {
  onScanSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const runScan = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/simulate-scan`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      await res.json();

      onScanSuccess?.();

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg w-fit space-y-2">
      <button
        onClick={runScan}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
      >
        {loading ? "Scanning..." : "Run Scan"}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}