type Location = {
    Location_id: number;
    name: string;
    image: string;
};

type Props = {
    location: Location;
};

export default function WashHallCard({ location }: Props) {
    return (
        <div className="border rounded-lg overflow-hidden">
            <img src={location.image} alt={location.name} className="w-full h-40 object-cover" />
            <div className="p-4">
                <h3 className="font-semibold">{location.name}</h3>
            </div>
        </div>
    )
}