export function normalizeOrigin(value, fallback = 'http://localhost:5173') {
    const raw = (value || '').trim();
    if (!raw) return fallback;

    try {
        const url = new URL(raw);
        return url.origin;
    } catch {
        return fallback;
    }
}
