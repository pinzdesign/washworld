import Link from "next/link";

import {
	MapPinIcon,
	EnvelopeIcon,
	PhoneIcon,
} from "@heroicons/react/24/outline";

export function Footer() {
	return (
		<footer className="w-full bg-gray-60 border-t border-gray-10 mt-12 shadow-[inset_0_8px_16px_rgba(0,0,0,0.35)]">
            <div className="container-wide py-8">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-white">

                    {/* LEFT */}
                    <div className="space-y-3">

                        <p className="font-semibold">
                            © {new Date().getFullYear()} WashWorld
                        </p>

                        <div className="space-y-2 text-gray-5">

                            <div className="flex items-start gap-2">
                                <MapPinIcon className="w-4 h-4 mt-0.5" />
                                <div>
                                    <p>Adressevej 123</p>
                                    <p>Bynavn 9999</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <EnvelopeIcon className="w-4 h-4" />
                                <p>info@washworld.dk</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <PhoneIcon className="w-4 h-4" />
                                <p>+45 12 34 56 78</p>
                            </div>

                        </div>

                    </div>

                    {/* CENTER */}
                    <div className="space-y-3 md:border-l md:border-white/10 md:pl-8">

                        <p className="font-semibold">
                            Navigation
                        </p>

                        <div className="flex flex-col gap-2 text-gray-5">

                            <Link
                                href="/"
                                className="hover:text-brand-green transition-colors"
                            >
                                Dashboard
                            </Link>

                            <Link
                                href="/subscriptions"
                                className="hover:text-brand-green transition-colors"
                            >
                                Abonnementer
                            </Link>

                            <Link
                                href="/history"
                                className="hover:text-brand-green transition-colors"
                            >
                                Historik
                            </Link>

                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="space-y-3 md:border-l md:border-white/10 md:pl-8">

                        <p className="font-semibold">
                            Information
                        </p>

                        <div className="space-y-2 text-gray-5 leading-relaxed">

                            <p>
                                Denne webside er en del af eksaminationsprojekt
                                i Erhvervsakademi København.
                            </p>

                            <p>
                                Lavet af Ivan Popov og Rasmus Lindberg Knabe.
                            </p>

                            <p>
                                All rights reserved.
                            </p>

                        </div>

                    </div>

                </div>

            </div>
        </footer>
	);
}