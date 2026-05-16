import LocationsExplorer from "@/components/LocationsExplorer";
import ServiceHistory from "@/components/ServiceHistory";

export default function HistoryPage() {
	return (
		<main className="space-y-8 px-18 mt-16">

			{/* FULL HISTORY (PAGINATED) */}
			<div className="container-wide py-12 border border-black/10 bg-white">
				<ServiceHistory mode="full" />
			</div>

		</main>
	);
}