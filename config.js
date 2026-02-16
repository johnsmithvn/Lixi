window.APP_CONFIG = {
    // ===== EASY TOGGLE (TRUE/FALSE) =====
    // FREE_MODE true => bo lock, ai cung choi duoc moi lan vao web.
    FREE_MODE: false,

    // EVENT_MODE true => lock theo gio su kien (uu tien sau FREE_MODE).
    EVENT_MODE: false,

    // TEST_MODE true => lock ngan de test nhanh (uu tien sau EVENT_MODE).
    TEST_MODE: false,

    // Neu muon bat lock binh thuong va khong dung MODE, de true.
    // Neu de false thi tuong duong FREE_MODE.
    ENABLE_LOCK: true,

    // ===== OPTIONAL (ADVANCED) =====
    // MODE fallback khi ban khong dung cac flag ben tren.
    // Gia tri: 'FREE' | 'LOCKED' | 'EVENT' | 'TEST'
    MODE: 'LOCKED',

    // Cho phep test nhanh bang URL: ?mode=free|locked|event|test
    ALLOW_QUERY_OVERRIDE: true,

    // LOCKED mode: cho phep mini-quiz de them 1 co hoi.
    ENABLE_EXTRA_CHANCE_QUIZ: true,
    QUIZ_MAX_ATTEMPTS: 3,

    // ===== GAME BALANCE =====
    TOTAL_ENVELOPES: 10,
    TROLL_CHANCE: 0.2, // 20%
    MONEY_CHANCE: 0.4, // 40%

    // ===== LOCK DURATION (DANG DE DOC) =====
    LOCK_DURATION_DAYS: 365,
    EVENT_LOCK_DURATION_HOURS: 24,
    TEST_LOCK_DURATION_SECONDS: 60,

    // ===== LEGACY MS (neu ban thich dung ms) =====
    // LOCK_DURATION_MS: 365 * 24 * 60 * 60 * 1000,
    // EVENT_LOCK_DURATION_MS: 24 * 60 * 60 * 1000,
    // TEST_LOCK_DURATION_MS: 60 * 1000,

    FATE_STORAGE_KEY: 'lixi_fate_2026'
};
