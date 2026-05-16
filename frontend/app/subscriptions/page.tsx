import MembershipsController from "@/components/MembershipsController";

export default function SubscriptionsPage() {
	return (
		<main className="space-y-8 px-4 lg:px-18 mt-12">

			{/* FULL SUBSCRIPTIONS */}
			<div className="container-wide py-6 lg:py-12 border border-black/10 bg-white">
                <h2 className="text-xl font-semibold text-gray-80 mb-6">Dine abonnementer</h2>
				<MembershipsController mode="full" />
			</div>

		</main>
	);
}
