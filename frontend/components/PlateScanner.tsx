"use client";

import { useState } from "react";

export default function SimulateScanButton({
	onScanSuccess,
}: {
	onScanSuccess?: () => void;
}) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<any>(null);

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

			const data = await res.json();
			setResult(data);

			onScanSuccess?.();
		} catch (err: any) {
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-3">

			{/* ACTION BUTTON */}
			<button
				onClick={runScan}
				disabled={loading}
				className="w-full bg-brand-green text-white px-4 py-3 hover:bg-brand-green-alt hover:shadow-md transition-all disabled:opacity-50"
			>
				{loading ? "Scanning..." : "Run Scan"}
			</button>

			{/* RESULT */}
			{result && (
				<div className="bg-gray-5 border border-gray-10 p-3 text-xs overflow-auto">
					<pre>{JSON.stringify(result, null, 2)}</pre>
				</div>
			)}

			{/* ERROR */}
			{error && (
				<p className="text-sm text-red-500">
					{error}
				</p>
			)}

		</div>
	);
}