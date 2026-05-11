"use client";

import { useEffect, useState } from "react";

type ServiceHistoryItem = {
  service_history_pk: number;
  service_fk: number;
  membership_fk: number | null;
  department_ext_id: string;
  base_price: number;
  final_price: number;
  covered_by_membership: boolean;
  service_at: number;
  service_name: string;
  service_type: string;
  car_plate: string | null;
  membership_type_name: string | null;
};

export default function ServiceHistory({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const [history, setHistory] = useState<ServiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/history`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error("Failed to fetch history");

      const data = await res.json();
      setHistory(data.history || []);
    } catch (e) {
      setError("Could not load service history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshKey]);

  if (loading) return <p>Loading service history...</p>;
  if (error) return <p>{error}</p>;
  if (!history.length) return <p>No service history found.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Service History</h2>

      {history.map((item) => (
        <div key={item.service_history_pk} className="border rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">{item.service_name}</h3>
              <p className="text-sm text-gray-500">
                {item.service_type.toUpperCase()} wash
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">
                {new Date(item.service_at * 1000).toLocaleString()}
              </p>

              <p className="font-bold">
                {item.covered_by_membership
                  ? "FREE"
                  : `${item.final_price} DKK`}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}