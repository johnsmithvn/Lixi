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
    ENABLE_LOCK: false,

    // ===== OPTIONAL (ADVANCED) =====
    // MODE fallback khi ban khong dung cac flag ben tren.
    // Gia tri: 'FREE' | 'LOCKED' | 'EVENT' | 'TEST'
    MODE: 'LOCKED',

    // Cho phep test nhanh bang URL: ?mode=free|locked|event|test
    ALLOW_QUERY_OVERRIDE: true,

    // LOCKED mode: cho phep mini-quiz de them 1 co hoi.
    ENABLE_EXTRA_CHANCE_QUIZ: true,
    QUIZ_MAX_ATTEMPTS: 3,
    // Khong lap lai cau quiz da tung hien tren cung 1 thiet bi.
    QUIZ_UNIQUE_PER_DEVICE: true,
    QUIZ_SEEN_STORAGE_KEY: 'lixi_quiz_seen_v1',

    // ===== OPEN FLOW (MOBILE-FIRST) =====
    // QUICK: click mo ngay (bo qua popup xac nhan)
    // DRAMA: 2-3 lop popup truoc khi mo
    OPEN_FLOW_MODE: 'DRAMA',
    DRAMA_OPEN_FLOW: true,
    DRAMA_TALK_STEP: true,
    DRAMA_FINAL_STEP: true,
    // Ti le random hien buoc FINAL (0 -> 1). Vi du 0.4 = 40%
    OPEN_FLOW_FINAL_RANDOM_CHANCE: 0.4,
    // Dẫn link ảnh trong thư mục assets (nếu để null thì dùng emoji mặc định)
    // Ví dụ: '/assets/images/confirm-face.png'
    OPEN_FLOW_CONFIRM_FACE_IMAGE: '/assets/images/suynghi.jpg',
    OPEN_FLOW_FINAL_FACE_IMAGE: null,

    // ===== OPEN GATE (THOI GIAN MO CUA WEB) =====
    // Bat/tat che do cho mo cua theo thoi gian.
    OPEN_GATE_ENABLED: true,
    // Dinh dang de xuat: '2026-02-20T20:00:00+07:00'
    OPEN_GATE_AT: '2026-02-17T17:00:00+07:00',
    // Cho phep choi quiz trong luc cho mo cua.
    OPEN_GATE_ALLOW_QUIZ: true,

    // ===== GAME BALANCE =====
    TOTAL_ENVELOPES: 20,
    TROLL_CHANCE: 0.2, // 20%
    // Giai dac biet lon nhat (uu tien truoc money)
    SPECIAL_CHANCE: 0.2, // 5%
    MONEY_CHANCE: 0.4, // 40%
    SPECIAL_CONFETTI_COUNT: 420,

    // ===== AUDIO SOURCES (OPTIONAL) =====
    // Dat file trong assets/audio va dien duong dan nhu ben duoi.
    // Neu bo trong/null, he thong se dung am fallback.
    SOUND_CLICK_SRC: '/assets/audio/click.mp3',
    SOUND_WIN_SRC: '/assets/audio/win.mp3',
    SOUND_TROLL_SRC: '/assets/audio/troll.mp3',
    SOUND_SPECIAL_SRC: '/assets/audio/special.mp3',

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
