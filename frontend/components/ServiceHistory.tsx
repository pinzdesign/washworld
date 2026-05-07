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

    useEffect(() => {
        fetchHistory();
    }, [refreshKey]);

    const fetchHistory = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/service-history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch service history");
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error(error);
      setError("Could not load service history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading service history...</p>;
  if (error) return <p>{error}</p>;
  if (history.length === 0) return <p>No service history found.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Service History</h2>

      {history.map((item) => {
        const isFree = item.covered_by_membership;
        const isPaid = item.final_price > 0;

        return (
          <div
            key={item.service_history_pk}
            className="border rounded-xl p-4 space-y-2"
          >
            {/* Top row */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  {item.service_name}
                </h3>

                <p className="text-sm text-gray-500">
                  {item.service_type.toUpperCase()} wash
                </p>

                {item.car_plate && (
                  <p className="text-sm text-gray-500">
                    Plate: {item.car_plate}
                  </p>
                )}

                {item.membership_type_name && (
                  <p className="text-sm text-gray-500">
                    Membership: {item.membership_type_name}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date(
                    item.service_at * 1000
                  ).toLocaleString()}
                </p>

                <p
                  className={`font-bold mt-1 ${
                    isFree
                      ? "text-green-600"
                      : "text-black"
                  }`}
                >
                  {isFree ? "FREE" : `${item.final_price} DKK`}
                </p>
              </div>
            </div>

            {/* Status row */}
            <div className="text-sm flex justify-between border-t pt-2">
              <p className="text-gray-500">
                Terminal: {item.department_ext_id}
              </p>

              {isFree ? (
                <p className="text-green-600 font-medium">
                  Covered by membership
                </p>
              ) : isPaid ? (
                <p className="text-orange-600 font-medium">
                  Paid wash
                </p>
              ) : (
                <p className="text-gray-400">
                  Standard transaction
                </p>
              )}
            </div>

            {/* Pricing breakdown */}
            {!isFree && (
              <div className="text-xs text-gray-500">
                Base price: {item.base_price} DKK
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}