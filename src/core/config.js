const ONE_MINUTE_MS = 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_YEAR_MS = 365 * ONE_DAY_MS;

export const GAME_MODES = Object.freeze({
    FREE: 'FREE',
    LOCKED: 'LOCKED',
    EVENT: 'EVENT',
    TEST: 'TEST'
});

function asPositiveNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeMode(rawMode) {
    if (typeof rawMode !== 'string') {
        return null;
    }

    const value = rawMode.trim().toUpperCase();
    if (value in GAME_MODES) {
        return value;
    }

    if (value === 'ONE_TIME' || value === 'ONETIME') {
        return GAME_MODES.LOCKED;
    }

    return null;
}

function resolveGlobalConfig() {
    if (typeof window === 'undefined' || typeof window.APP_CONFIG !== 'object') {
        return {};
    }

    return window.APP_CONFIG ?? {};
}

function resolveModeFromQuery(allowOverride) {
    if (!allowOverride || typeof window === 'undefined') {
        return null;
    }

    const queryMode = new URLSearchParams(window.location.search).get('mode');
    return normalizeMode(queryMode);
}

const globalConfig = resolveGlobalConfig();
const allowQueryOverride = globalConfig.ALLOW_QUERY_OVERRIDE !== false;
const configuredMode = normalizeMode(globalConfig.MODE ?? globalConfig.mode) ?? GAME_MODES.LOCKED;
const runtimeMode = resolveModeFromQuery(allowQueryOverride) ?? configuredMode;

export const APP_CONFIG = {
    totalEnvelopes: 6,
    speechDebounceMs: 350,
    probabilities: {
        trollChance: 0.3,
        moneyChanceWhenNotTroll: 0.55
    },
    timings: {
        speechHideMs: 550,
        revealDurationMs: 430,
        trollRevealDelayMs: 1800
    },
    effects: {
        vibrationMs: 80,
        confetti: {
            troll: 120,
            money: 160,
            moneyStreakBonus: 250,
            joke: 95,
            trollReveal: 65
        }
    },
    storage: {
        bestStreakKey: 'lixi_best_streak_v1'
    },
    gameMode: {
        mode: runtimeMode,
        storageKey: globalConfig.FATE_STORAGE_KEY ?? 'lixi_fate_2026',
        lockDurationMs: asPositiveNumber(globalConfig.LOCK_DURATION_MS, ONE_YEAR_MS),
        eventDurationMs: asPositiveNumber(globalConfig.EVENT_LOCK_DURATION_MS, ONE_DAY_MS),
        testDurationMs: asPositiveNumber(globalConfig.TEST_LOCK_DURATION_MS, ONE_MINUTE_MS),
        allowQueryOverride
    }
};
