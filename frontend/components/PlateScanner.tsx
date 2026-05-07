"use client";

import { useState } from "react";

type ScanResult = {
  success: boolean;
  car_plate: string;

  membership_found: boolean;
  membership: string | null;

  final_price: number;

  covered_by_membership: boolean;

  error?: string;
};

export default function PlateScanner({
  onScanComplete,
}: {
  onScanComplete?: () => void;
}) {
  const [result, setResult] =
    useState<ScanResult | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const simulateScan = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You must be logged in");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/simulate-scan`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Scanner failed");
        return;
      }

      setResult(data);

      // refresh history list
      onScanComplete?.();

    } catch (error) {
      console.error(error);

      setError("Could not simulate scan");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">
        Car Plate Scanner
      </h2>

      <button
        onClick={simulateScan}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Scanning..." : "Scan Car Plate"}
      </button>

      {error && (
        <p className="text-red-600">
          {error}
        </p>
      )}

      {result && (
        <div className="border rounded-lg p-4 space-y-2">
          <p>
            <strong>Plate:</strong>{" "}
            {result.car_plate}
          </p>

          <p>
            <strong>Membership Found:</strong>{" "}
            {result.membership_found
              ? "Yes"
              : "No"}
          </p>

          {result.membership && (
            <p>
              <strong>Membership:</strong>{" "}
              {result.membership}
            </p>
          )}

          <p>
            <strong>Final Price:</strong>{" "}
            {result.final_price} DKK
          </p>

          {result.covered_by_membership ? (
            <p className="text-green-600">
              Wash covered by membership
            </p>
          ) : (
            <p className="text-orange-600">
              Full price charged
            </p>
          )}
        </div>
      )}
    </div>
  );
}