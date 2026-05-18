// Minimal service worker for PWA installability.
// No caching yet — just satisfies Chrome's installability criteria.

self.addEventListener("install", (event) => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
	// Empty handler is required for installability.
});
