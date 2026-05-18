import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { AuthProvider } from "@/components/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { APPLE_SPLASH_SCREENS } from "./splash-screens";

const gilroy = localFont({
  src: [
    {
      path: "../public/fonts/Gilroy-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Gilroy-ExtraBold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-gilroy",
  display: "swap",
});

export const metadata: Metadata = {
	title: "Wash World",
	description: "Find nærmeste vaskehal, se status og åbningstider",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		title: "Wash World",
		statusBarStyle: "default",
	},
	icons: {
		apple: "/apple-touch-icon.png",
		other: APPLE_SPLASH_SCREENS,
	},
};

export const viewport: Viewport = {
	themeColor: "#06c167",
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={gilroy.variable}
		>
			<body className="min-h-full flex flex-col pt-16 bg-surface">
				<AuthProvider>
					<Navbar />
					{children}
					<Footer />
					<BottomNav />
				</AuthProvider>
				<ServiceWorkerRegistration />
			</body>
		</html>
	);
}
