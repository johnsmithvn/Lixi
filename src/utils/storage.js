function isStorageAvailable() {
    try {
        return typeof window !== 'undefined' && Boolean(window.localStorage);
    } catch {
        return false;
    }
}

export function readNumber(key, fallback = 0) {
    if (!isStorageAvailable()) {
        return fallback;
    }

    const raw = window.localStorage.getItem(key);
    const value = Number(raw);
    return Number.isFinite(value) ? value : fallback;
}

export function writeNumber(key, value) {
    if (!isStorageAvailable() || !Number.isFinite(value)) {
        return;
    }

    window.localStorage.setItem(key, String(value));
}

export function readJSON(key, fallback = null) {
    if (!isStorageAvailable()) {
        return fallback;
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) {
        return fallback;
    }

    try {
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

export function writeJSON(key, value) {
    if (!isStorageAvailable()) {
        return;
    }

    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignore quota errors.
    }
}

export function removeKey(key) {
    if (!isStorageAvailable()) {
        return;
    }

    window.localStorage.removeItem(key);
}
