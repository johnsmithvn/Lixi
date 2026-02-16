import { APP_CONFIG, GAME_MODES } from '../core/config.js';
import { readJSON, removeKey, writeJSON } from '../utils/storage.js';

function getLockDuration(mode) {
    if (mode === GAME_MODES.EVENT) {
        return APP_CONFIG.gameMode.eventDurationMs;
    }

    if (mode === GAME_MODES.TEST) {
        return APP_CONFIG.gameMode.testDurationMs;
    }

    return APP_CONFIG.gameMode.lockDurationMs;
}

function isLockingMode(mode) {
    return mode !== GAME_MODES.FREE;
}

function parseFate(raw) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const expireAt = Number(raw.expireAt);
    if (!Number.isFinite(expireAt) || expireAt <= 0) {
        return null;
    }

    return {
        mode: raw.mode,
        playedAt: Number(raw.playedAt) || Date.now(),
        expireAt,
        result: raw.result && typeof raw.result === 'object' ? raw.result : null,
        meta: raw.meta && typeof raw.meta === 'object' ? raw.meta : {}
    };
}

export function createGameModeManager() {
    const mode = APP_CONFIG.gameMode.mode;
    const storageKey = APP_CONFIG.gameMode.storageKey;

    function readActiveFate() {
        if (!isLockingMode(mode)) {
            return null;
        }

        const parsed = parseFate(readJSON(storageKey, null));
        if (!parsed) {
            return null;
        }

        if (parsed.mode !== mode || Date.now() >= parsed.expireAt) {
            removeKey(storageKey);
            return null;
        }

        return parsed;
    }

    function lockWithResult(result, meta = {}) {
        if (!isLockingMode(mode)) {
            return null;
        }

        const now = Date.now();
        const fate = {
            mode,
            playedAt: now,
            expireAt: now + getLockDuration(mode),
            result: {
                type: result.type,
                title: result.title,
                text: result.text,
                blessing: result.blessing
            },
            meta
        };

        writeJSON(storageKey, fate);
        return fate;
    }

    return {
        mode,
        isLockingMode: () => isLockingMode(mode),
        getActiveFate: readActiveFate,
        isLocked: () => Boolean(readActiveFate()),
        lockWithResult,
        clearLock: () => removeKey(storageKey)
    };
}
