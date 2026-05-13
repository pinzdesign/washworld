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
		<div className="border rounded-xl p-4 space-y-2">
			<div className="flex justify-between items-start">
				<h3 className="text-lg font-bold">
					{membership.membership_type_name}
				</h3>

				<span
					className={`text-sm px-2 py-1 rounded ${
						isCancelled
							? "bg-red-100 text-red-600"
							: "bg-green-100 text-green-600"
					}`}
				>
					{membership.membership_status}
				</span>
			</div>

			<p>
				<strong>Nummerplade:</strong>{" "}
				{membership.car_plate}
			</p>

			<p>
				<strong>Pris:</strong>{" "}
				{membership.membership_type_price} DKK
			</p>

			<p>
				<strong>Beskrivelse:</strong>{" "}
				{membership.membership_desc}
			</p>

			<p>
				<strong>Start:</strong>{" "}
				{new Date(
					membership.membership_start_at * 1000
				).toLocaleDateString()}
			</p>

			{membership.membership_end_at && (
				<p>
					<strong>Slut:</strong>{" "}
					{new Date(
						membership.membership_end_at * 1000
					).toLocaleDateString()}
				</p>
			)}

			{/* only show delete if active */}
			{!isCancelled && (
				<button
					onClick={() =>
						onDelete(membership.membership_pk)
					}
					className="bg-red-500 text-white px-3 py-1 rounded"
				>
					Opsig medlemskab
				</button>
			)}
		</div>
	);
}