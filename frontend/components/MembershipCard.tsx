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
	onDelete: (id: number) => void;
};

export default function MembershipCard({ membership, onDelete }: Props) {
	return (
		<div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
			<h3>{membership.membership_type_name}</h3>

			<p><strong>Nummerplade:</strong> {membership.car_plate}</p>
			<p><strong>Status:</strong> {membership.membership_status}</p>
			<p><strong>Pris:</strong> {membership.membership_type_price}</p>
			<p><strong>Beskrivelse:</strong> {membership.membership_desc}</p>

			<p>
				<strong>Start:</strong>{" "}
				{new Date(membership.membership_start_at * 1000).toLocaleDateString()}
			</p>

			{membership.membership_end_at && (
				<p>
					<strong>End:</strong>{" "}
					{new Date(membership.membership_end_at * 1000).toLocaleDateString()}
				</p>
			)}

			<button onClick={() => onDelete(membership.membership_pk)}>
				Remove membership
			</button>
		</div>
	);
}