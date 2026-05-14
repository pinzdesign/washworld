type Membership = {
	membership_pk: number;
	car_plate: string;
	membership_status: string;
	membership_start_at: number;
	membership_end_at: number | null;
	membership_type_name: string;
	membership_type_price: number;
	membership_desc: string;
};

type Props = {
	membership: Membership;
	onDelete: (id: number) => Promise<void> | void;
};

export default function MembershipCard({
	membership,
	onDelete,
}: Props) {
	const isCancelled =
		membership.membership_status === "cancelled";

	return (
		<div className="border border-gray-10 mb-4 hover:shadow-md transition-shadow duration-200">

			{/* HEADER */}
			<div className="flex items-start justify-between p-4 pb-3">
				<h3 className="text-base font-semibold text-gray-80">
					{membership.membership_type_name}
				</h3>

				<span
					className={`text-xs px-2 py-1 ${
						isCancelled
							? "bg-red-100 text-red-600"
							: "bg-green-100 text-green-600"
					}`}
				>
					{membership.membership_status}
				</span>
			</div>

			{/* BODY */}
			<div className="px-4 pb-4 text-sm text-gray-60 space-y-1">
				<p>Nummerplade: {membership.car_plate}</p>

				<p>Pris: {membership.membership_type_price} DKK</p>

				<p>Beskrivelse: {membership.membership_desc}</p>

				<p>
					Start:{" "}
					{new Date(
						membership.membership_start_at * 1000
					).toLocaleDateString()}
				</p>

				{membership.membership_end_at && (
					<p>
						Næste betaling:{" "}
						{new Date(
							membership.membership_end_at * 1000
						).toLocaleDateString()}
					</p>
				)}
			</div>

			{/* FOOTER */}
			{!isCancelled && (
				<div className="px-4 py-3 bg-gray-5 border-t border-gray-10 flex justify-end">
					<button
						onClick={() =>
							onDelete(membership.membership_pk)
						}
						className="bg-red-500 hover:bg-red-600 transition-colors text-white text-sm px-3 py-1"
					>
						Opsig medlemskab
					</button>
				</div>
			)}

		</div>
	);
}