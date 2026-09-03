// Registers the service worker in production builds only, so the dev server's
// HMR is never intercepted by a cache. The SW lives at the app base (public/sw.js),
// which makes its scope the whole app on any GitHub Pages subpath.
export function registerSW() {
  if (!import.meta.env.PROD) return;
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    const url = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(url).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
