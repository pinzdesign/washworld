"use client";

import { useEffect, useState } from "react";
import { ArrowUpOnSquareIcon, PlusIcon } from "@heroicons/react/24/outline";

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallPage() {
	const [isIos, setIsIos] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);
	const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

	useEffect(() => {
		const ua = navigator.userAgent;
		setIsIos(/iPad|iPhone|iPod/.test(ua));
		setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

		const handler = (e: Event) => {
			e.preventDefault();
			setInstallPrompt(e as BeforeInstallPromptEvent);
		};
		window.addEventListener("beforeinstallprompt", handler);
		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	const handleInstall = async () => {
		if (!installPrompt) return;
		await installPrompt.prompt();
		const { outcome } = await installPrompt.userChoice;
		if (outcome === "accepted") setInstallPrompt(null);
	};

	return (
		<main className="mx-6 px-4 py-6 lg:w-1/2 lg:mx-auto lg:px-18 lg:py-12 border border-black/10 bg-white mt-12 space-y-6">
			<h1 className="text-xl lg:text-2xl font-extrabold">Installér Wash World</h1>

			{isStandalone ? (
				<p className="font-light">
					Du har allerede installeret appen. Du kan lukke denne side.
				</p>
			) : installPrompt ? (
				<>
					<p className="font-light">
						Få Wash World som en app på din hjemmeskærm — hurtigere
						adgang og full-screen visning.
					</p>
					<button
						onClick={handleInstall}
						className="w-full bg-brand-green text-white px-4 py-2 hover:bg-brand-green-alt transition-colors shadow-sm hover:shadow-md"
					>
						Installér app
					</button>
				</>
			) : isIos ? (
				<>
					<p className="font-light">
						For at installere Wash World på din iPhone:
					</p>
					<ol className="space-y-3 list-decimal list-inside">
						<li className="font-light">
							Tryk på <ArrowUpOnSquareIcon className="inline w-5 h-5 align-text-bottom text-brand-green" /> Del-ikonet
							i bunden af Safari
						</li>
						<li className="font-light">
							Scroll ned og tryk <strong>Føj til hjemmeskærm</strong> <PlusIcon className="inline w-5 h-5 align-text-bottom text-brand-green" />
						</li>
						<li className="font-light">
							Bekræft ved at trykke <strong>Tilføj</strong>
						</li>
					</ol>
					<p className="text-sm text-gray-60">
						Bemærk: virker kun i Safari, ikke i Chrome eller andre browsere på iOS.
					</p>
				</>
			) : (
				<p className="font-light">
					Brug din browsers menu for at installere Wash World — typisk
					under <strong>⋮ → Installér app</strong> eller{" "}
					<strong>Tilføj til hjemmeskærm</strong>.
				</p>
			)}
		</main>
	);
}
