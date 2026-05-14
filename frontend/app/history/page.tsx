import LocationsExplorer from "@/components/LocationsExplorer";
import ServiceHistory from "@/components/ServiceHistory";

export default function HistoryPage() {
	return (
		<main className="space-y-8">

			{/* FULL WIDTH MAP */}
			<div className="full-bleed">
				<LocationsExplorer />
			</div>

			{/* FULL HISTORY (PAGINATED) */}
			<div className="container-wide">
				<ServiceHistory mode="full" />
			</div>

		</main>
	);
}