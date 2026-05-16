import LocationsExplorer from "@/components/LocationsExplorer";
import ServiceHistory from "@/components/ServiceHistory";

export default function HistoryPage() {
	return (
		<main className="space-y-8 px-4 lg:px-18 mt-12">

			{/* FULL HISTORY (PAGINATED) */}
			<div className="container-wide py-6 lg:py-12 border border-black/10 bg-white">
				<ServiceHistory mode="full" />
			</div>

		</main>
	);
}