const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;
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

function asProbability(value, fallback) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }

    if (parsed < 0) {
        return 0;
    }

    if (parsed > 1) {
        return 1;
    }

    return parsed;
}

function asBooleanTrue(value) {
    return value === true;
}

function asOptionalString(value) {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function asTimestampMs(value) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        return value;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return null;
        }

        const parsed = Date.parse(trimmed);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
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

function normalizeOpenFlowMode(rawMode) {
    if (typeof rawMode !== 'string') {
        return null;
    }

    const value = rawMode.trim().toUpperCase();
    if (value === 'QUICK' || value === 'DRAMA') {
        return value;
    }

    return null;
}

function resolveGlobalConfig() {
    if (typeof window === 'undefined' || typeof window.APP_CONFIG !== 'object') {
        return {};
    }

    return window.APP_CONFIG ?? {};
}

function resolveModeFromFlags(config) {
    const freeMode = asBooleanTrue(config.FREE_MODE)
        || asBooleanTrue(config.IS_FREE_MODE)
        || config.ENABLE_LOCK === false;

    if (freeMode) {
        return GAME_MODES.FREE;
    }

    if (asBooleanTrue(config.EVENT_MODE) || asBooleanTrue(config.IS_EVENT_MODE)) {
        return GAME_MODES.EVENT;
    }

    if (asBooleanTrue(config.TEST_MODE) || asBooleanTrue(config.IS_TEST_MODE)) {
        return GAME_MODES.TEST;
    }

    if (config.ENABLE_LOCK === true) {
        return GAME_MODES.LOCKED;
    }

    return null;
}

function resolveModeFromQuery(allowOverride) {
    if (!allowOverride || typeof window === 'undefined') {
        return null;
    }

    const queryMode = new URLSearchParams(window.location.search).get('mode');
    return normalizeMode(queryMode);
}

function resolveDurationMs(config, primaryMsKey, altKey, altUnitMs, fallback) {
    const directMs = asPositiveNumber(config[primaryMsKey], 0);
    if (directMs > 0) {
        return directMs;
    }

    const altValue = asPositiveNumber(config[altKey], 0);
    if (altValue > 0) {
        return altValue * altUnitMs;
    }

    return fallback;
}

const globalConfig = resolveGlobalConfig();
const allowQueryOverride = globalConfig.ALLOW_QUERY_OVERRIDE !== false;

// Priority:
// 1) ?mode=... (when ALLOW_QUERY_OVERRIDE = true)
// 2) Boolean flags (FREE_MODE / EVENT_MODE / TEST_MODE / ENABLE_LOCK)
// 3) MODE string
// 4) Default LOCKED
const configuredModeFromFlags = resolveModeFromFlags(globalConfig);
const configuredModeFromText = normalizeMode(globalConfig.MODE ?? globalConfig.mode);
const runtimeMode = resolveModeFromQuery(allowQueryOverride)
    ?? configuredModeFromFlags
    ?? configuredModeFromText
    ?? GAME_MODES.LOCKED;

const openFlowMode = normalizeOpenFlowMode(globalConfig.OPEN_FLOW_MODE)
    ?? (globalConfig.DRAMA_OPEN_FLOW === false ? 'QUICK' : 'DRAMA');

const trollChance = asProbability(globalConfig.TROLL_CHANCE, 0.2);
const configuredMoneyChance = asProbability(globalConfig.MONEY_CHANCE, 0.4);
const moneyChance = Math.min(1 - trollChance, configuredMoneyChance);

export const APP_CONFIG = {
    totalEnvelopes: asPositiveNumber(globalConfig.TOTAL_ENVELOPES, 10),
    speechDebounceMs: 350,
    probabilities: {
        trollChance,
        moneyChance
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
    quiz: {
        enabledInLockedMode: globalConfig.ENABLE_EXTRA_CHANCE_QUIZ !== false,
        maxAttempts: asPositiveNumber(globalConfig.QUIZ_MAX_ATTEMPTS, 3)
    },
    openFlow: {
        mode: openFlowMode,
        talkStepEnabled: globalConfig.DRAMA_TALK_STEP !== false,
        finalStepEnabled: globalConfig.DRAMA_FINAL_STEP !== false,
        finalStepChance: asProbability(globalConfig.OPEN_FLOW_FINAL_RANDOM_CHANCE, 0.45),
        confirmFaceImage: asOptionalString(globalConfig.OPEN_FLOW_CONFIRM_FACE_IMAGE),
        finalFaceImage: asOptionalString(globalConfig.OPEN_FLOW_FINAL_FACE_IMAGE)
    },
    openGate: {
        enabled: globalConfig.OPEN_GATE_ENABLED === true,
        openAtMs: asTimestampMs(globalConfig.OPEN_GATE_AT),
        allowQuizWhileWaiting: globalConfig.OPEN_GATE_ALLOW_QUIZ !== false
    },
    gameMode: {
        mode: runtimeMode,
        storageKey: globalConfig.FATE_STORAGE_KEY ?? 'lixi_fate_2026',
        lockDurationMs: resolveDurationMs(globalConfig, 'LOCK_DURATION_MS', 'LOCK_DURATION_DAYS', ONE_DAY_MS, ONE_YEAR_MS),
        eventDurationMs: resolveDurationMs(globalConfig, 'EVENT_LOCK_DURATION_MS', 'EVENT_LOCK_DURATION_HOURS', ONE_HOUR_MS, ONE_DAY_MS),
        testDurationMs: resolveDurationMs(globalConfig, 'TEST_LOCK_DURATION_MS', 'TEST_LOCK_DURATION_SECONDS', ONE_MINUTE_MS, ONE_MINUTE_MS),
        allowQueryOverride
    }
};
