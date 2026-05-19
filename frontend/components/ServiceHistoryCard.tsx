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
	user_first_name: string | null;
	user_last_name: string | null;
};

function formatServiceDate(serviceAt: number) {
	const date = new Date(serviceAt);

	const formattedDate = new Intl.DateTimeFormat("da-DK", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(date);

	const formattedTime = new Intl.DateTimeFormat("da-DK", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(date);

	return `${formattedDate} kl: ${formattedTime}`;
}

export default function ServiceHistoryCard({
	item,
	isLast,
}: {
	item: ServiceHistoryItem;
	isLast: boolean;
}) {
	return (
		<div className={`pb-4 ${!isLast ? "border-b border-gray-10" : ""}`}>
			<div className="flex justify-between">
				<div>
					<h3 className="text-sm font-semibold">{item.service_name}</h3>

					<p className="text-xs text-gray-60">
						{formatServiceDate(item.service_at)}
					</p>
				</div>

				<div>
					{item.covered_by_membership ? (
						<span className="text-sm text-green-600 font-semibold">
							GRATIS
						</span>
					) : (
						<span className="text-sm font-semibold">
							{item.final_price} DKK
						</span>
					)}
				</div>
			</div>

			<div className="text-xs text-gray-60 mt-2">Nummerplade: <strong>{item.car_plate}</strong></div>
		</div>
	);
}