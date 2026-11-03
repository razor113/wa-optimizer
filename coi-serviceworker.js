if (typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
    self.addEventListener("fetch", function (event) {
        if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") return;
        event.respondWith(
            fetch(event.request).then((response) => {
                if (response.status === 0) return response;
                const newHeaders = new Headers(response.headers);
                newHeaders.set("Cross-Origin-Embedder-Policy", "credentialless");
                newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
                return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
            }).catch((e) => console.error(e))
        );
    });
} else {
    (async function () {
        if (window.crossOriginIsolated !== false) return;
        const registration = await navigator.serviceWorker.register(window.document.currentScript.src).catch(() => {});
        if (registration) {
            registration.addEventListener("updatefound", () => {
                const installing = registration.installing;
                if (installing) {
                    installing.addEventListener("statechange", () => {
                        if (installing.state === "activated") window.location.reload();
                    });
                }
            });
            if (registration.active && !navigator.serviceWorker.controller) {
                window.location.reload();
            }
        }
    })();
}
