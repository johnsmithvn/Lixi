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

function getNestedValue(source, path) {
    if (!source || typeof source !== 'object' || !Array.isArray(path) || path.length === 0) {
        return undefined;
    }

    let current = source;
    for (const segment of path) {
        if (!current || typeof current !== 'object' || !(segment in current)) {
            return undefined;
        }

        current = current[segment];
    }

    return current;
}

function pickConfigValue(config, path, legacyKeys = []) {
    const nestedValue = getNestedValue(config, path);
    if (nestedValue !== undefined) {
        return nestedValue;
    }

    for (const key of legacyKeys) {
        if (key in config) {
            return config[key];
        }
    }

    return undefined;
}

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

function asNonNegativeInteger(value, fallback = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
        return fallback;
    }

    return Math.floor(parsed);
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

function asStringList(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => String(item ?? '').trim())
        .filter(Boolean);
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

function normalizeRewardMode(rawMode) {
    if (typeof rawMode !== 'string') {
        return null;
    }

    const value = rawMode.trim().toUpperCase();
    if (value === 'CHANCE' || value === 'COUNT') {
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
    const freeModeFlag = pickConfigValue(config, ['MODE_FLAGS', 'free'], ['FREE_MODE', 'IS_FREE_MODE']);
    const eventModeFlag = pickConfigValue(config, ['MODE_FLAGS', 'event'], ['EVENT_MODE', 'IS_EVENT_MODE']);
    const testModeFlag = pickConfigValue(config, ['MODE_FLAGS', 'test'], ['TEST_MODE', 'IS_TEST_MODE']);
    const enableLockFlag = pickConfigValue(config, ['MODE_FLAGS', 'enableLock'], ['ENABLE_LOCK']);

    const freeMode = asBooleanTrue(freeModeFlag) || enableLockFlag === false;

    if (freeMode) {
        return GAME_MODES.FREE;
    }

    if (asBooleanTrue(eventModeFlag)) {
        return GAME_MODES.EVENT;
    }

    if (asBooleanTrue(testModeFlag)) {
        return GAME_MODES.TEST;
    }

    if (enableLockFlag === true) {
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

function resolveDurationMs(primaryMsValue, altValue, altUnitMs, fallback) {
    const directMs = asPositiveNumber(primaryMsValue, 0);
    if (directMs > 0) {
        return directMs;
    }

    const alt = asPositiveNumber(altValue, 0);
    if (alt > 0) {
        return alt * altUnitMs;
    }

    return fallback;
}

const globalConfig = resolveGlobalConfig();
const allowQueryOverride = pickConfigValue(
    globalConfig,
    ['MODE_OPTIONS', 'allowQueryOverride'],
    ['ALLOW_QUERY_OVERRIDE']
) !== false;

// Priority:
// 1) ?mode=... (when allowQueryOverride = true)
// 2) Boolean flags
// 3) MODE string
// 4) Default LOCKED
const configuredModeFromFlags = resolveModeFromFlags(globalConfig);
const configuredModeFromText = normalizeMode(
    pickConfigValue(globalConfig, ['MODE'], ['mode'])
);
const runtimeMode = resolveModeFromQuery(allowQueryOverride)
    ?? configuredModeFromFlags
    ?? configuredModeFromText
    ?? GAME_MODES.LOCKED;

const openFlowMode = normalizeOpenFlowMode(
    pickConfigValue(globalConfig, ['OPEN_FLOW', 'mode'], ['OPEN_FLOW_MODE'])
) ?? (pickConfigValue(globalConfig, ['OPEN_FLOW', 'dramaEnabled'], ['DRAMA_OPEN_FLOW']) === false ? 'QUICK' : 'DRAMA');

const trollChance = asProbability(
    pickConfigValue(globalConfig, ['GAME', 'trollChance'], ['TROLL_CHANCE']),
    0.2
);
const configuredSpecialChance = asProbability(
    pickConfigValue(globalConfig, ['GAME', 'specialChance'], ['SPECIAL_CHANCE']),
    0.05
);
const specialChance = Math.min(1 - trollChance, configuredSpecialChance);
const configuredMoneyChance = asProbability(
    pickConfigValue(globalConfig, ['GAME', 'moneyChance'], ['MONEY_CHANCE']),
    0.4
);
const moneyChance = Math.min(1 - trollChance - specialChance, configuredMoneyChance);

const rewardDistributionMode = normalizeRewardMode(
    pickConfigValue(globalConfig, ['GAME', 'rewardMode'], ['REWARD_MODE'])
);
const trollCount = asNonNegativeInteger(
    pickConfigValue(globalConfig, ['GAME', 'trollCount'], ['TROLL_COUNT']),
    0
);
const specialCount = asNonNegativeInteger(
    pickConfigValue(globalConfig, ['GAME', 'specialCount'], ['SPECIAL_COUNT']),
    0
);
const moneyCount = asNonNegativeInteger(
    pickConfigValue(globalConfig, ['GAME', 'moneyCount'], ['MONEY_COUNT']),
    0
);

const hasCountConfig = trollCount > 0 || specialCount > 0 || moneyCount > 0;
const rewardMode = rewardDistributionMode ?? (hasCountConfig ? 'COUNT' : 'CHANCE');

export const APP_CONFIG = {
    totalEnvelopes: asPositiveNumber(
        pickConfigValue(globalConfig, ['GAME', 'totalEnvelopes'], ['TOTAL_ENVELOPES']),
        10
    ),
    speechDebounceMs: 350,
    probabilities: {
        trollChance,
        specialChance,
        moneyChance
    },
    rewardDistribution: {
        mode: rewardMode,
        counts: {
            troll: trollCount,
            special: specialCount,
            money: moneyCount
        }
    },
    timings: {
        speechHideMs: asPositiveNumber(
            pickConfigValue(globalConfig, ['TIMINGS', 'speechHideMs'], ['SPEECH_HIDE_MS']),
            550
        ),
        revealDurationMs: asPositiveNumber(
            pickConfigValue(globalConfig, ['TIMINGS', 'revealDurationMs'], ['REVEAL_DURATION_MS']),
            430
        ),
        trollRevealDelayMs: asPositiveNumber(
            pickConfigValue(globalConfig, ['TIMINGS', 'trollRevealDelayMs'], ['TROLL_REVEAL_DELAY_MS']),
            1800
        )
    },
    effects: {
        vibrationMs: 80,
        confetti: {
            troll: 120,
            money: 160,
            special: asPositiveNumber(
                pickConfigValue(globalConfig, ['EFFECTS', 'confetti', 'special'], ['SPECIAL_CONFETTI_COUNT']),
                420
            ),
            moneyStreakBonus: 250,
            joke: 95,
            trollReveal: 65
        }
    },
    audio: {
        clickSrc: asOptionalString(
            pickConfigValue(globalConfig, ['AUDIO', 'clickSrc'], ['SOUND_CLICK_SRC'])
        ),
        winSrc: asOptionalString(
            pickConfigValue(globalConfig, ['AUDIO', 'winSrc'], ['SOUND_WIN_SRC'])
        ),
        trollSrc: asOptionalString(
            pickConfigValue(globalConfig, ['AUDIO', 'trollSrc'], ['SOUND_TROLL_SRC'])
        ),
        specialSrc: asOptionalString(
            pickConfigValue(globalConfig, ['AUDIO', 'specialSrc'], ['SOUND_SPECIAL_SRC'])
        )
    },
    storage: {
        bestStreakKey: 'lixi_best_streak_v1',
        quizSeenKey: pickConfigValue(globalConfig, ['STORAGE', 'quizSeenKey'], ['QUIZ_SEEN_STORAGE_KEY'])
            ?? 'lixi_quiz_seen_v1'
    },
    quiz: {
        enabledInLockedMode: pickConfigValue(
            globalConfig,
            ['QUIZ', 'enabledInLockedMode'],
            ['ENABLE_EXTRA_CHANCE_QUIZ']
        ) !== false,
        winContinueMode: pickConfigValue(
            globalConfig,
            ['QUIZ', 'winContinueMode'],
            ['WIN_CONTINUE_MODE']
        ) === true,
        maxAttempts: asPositiveNumber(
            pickConfigValue(globalConfig, ['QUIZ', 'maxAttempts'], ['QUIZ_MAX_ATTEMPTS']),
            3
        ),
        uniquePerDevice: pickConfigValue(
            globalConfig,
            ['QUIZ', 'uniquePerDevice'],
            ['QUIZ_UNIQUE_PER_DEVICE']
        ) !== false,
        mediaPool: asStringList(
            pickConfigValue(
                globalConfig,
                ['QUIZ', 'mediaPool'],
                ['QUIZ_MEDIA_POOL']
            )
        )
    },
    openFlow: {
        mode: openFlowMode,
        talkStepEnabled: pickConfigValue(globalConfig, ['OPEN_FLOW', 'talkStepEnabled'], ['DRAMA_TALK_STEP']) !== false,
        finalStepEnabled: pickConfigValue(globalConfig, ['OPEN_FLOW', 'finalStepEnabled'], ['DRAMA_FINAL_STEP']) !== false,
        finalStepChance: asProbability(
            pickConfigValue(globalConfig, ['OPEN_FLOW', 'finalStepChance'], ['OPEN_FLOW_FINAL_RANDOM_CHANCE']),
            0.45
        ),
        confirmFaceImage: asOptionalString(
            pickConfigValue(globalConfig, ['OPEN_FLOW', 'confirmFaceImage'], ['OPEN_FLOW_CONFIRM_FACE_IMAGE'])
        ),
        finalFaceImage: asOptionalString(
            pickConfigValue(globalConfig, ['OPEN_FLOW', 'finalFaceImage'], ['OPEN_FLOW_FINAL_FACE_IMAGE'])
        )
    },
    openGate: {
        enabled: pickConfigValue(globalConfig, ['OPEN_GATE', 'enabled'], ['OPEN_GATE_ENABLED']) === true,
        openAtMs: asTimestampMs(
            pickConfigValue(globalConfig, ['OPEN_GATE', 'at'], ['OPEN_GATE_AT'])
        ),
        allowQuizWhileWaiting: pickConfigValue(
            globalConfig,
            ['OPEN_GATE', 'allowQuiz'],
            ['OPEN_GATE_ALLOW_QUIZ']
        ) !== false
    },
    gameMode: {
        mode: runtimeMode,
        storageKey: pickConfigValue(globalConfig, ['STORAGE', 'fateKey'], ['FATE_STORAGE_KEY']) ?? 'lixi_fate_2026',
        lockDurationMs: resolveDurationMs(
            pickConfigValue(globalConfig, ['DURATION', 'lockMs'], ['LOCK_DURATION_MS']),
            pickConfigValue(globalConfig, ['DURATION', 'lockDays'], ['LOCK_DURATION_DAYS']),
            ONE_DAY_MS,
            ONE_YEAR_MS
        ),
        eventDurationMs: resolveDurationMs(
            pickConfigValue(globalConfig, ['DURATION', 'eventMs'], ['EVENT_LOCK_DURATION_MS']),
            pickConfigValue(globalConfig, ['DURATION', 'eventHours'], ['EVENT_LOCK_DURATION_HOURS']),
            ONE_HOUR_MS,
            ONE_DAY_MS
        ),
        testDurationMs: resolveDurationMs(
            pickConfigValue(globalConfig, ['DURATION', 'testMs'], ['TEST_LOCK_DURATION_MS']),
            pickConfigValue(globalConfig, ['DURATION', 'testSeconds'], ['TEST_LOCK_DURATION_SECONDS']),
            ONE_MINUTE_MS,
            ONE_MINUTE_MS
        ),
        allowQueryOverride
    }
};
