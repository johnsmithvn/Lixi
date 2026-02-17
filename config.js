window.APP_CONFIG = {
    // ===== CHE DO GAME =====
    // Gia tri: 'FREE' | 'LOCKED' | 'EVENT' | 'TEST'
    MODE: 'LOCKED',

    // Cho phep test nhanh bang URL: ?mode=free|locked|event|test
    MODE_OPTIONS: {
        allowQueryOverride: true
    },

    // ===== OPEN GATE (THOI GIAN MO CUA WEB) =====
    OPEN_GATE: {
        enabled: false,
        // Vi du: '2026-02-20T20:00:00+07:00'
        at: '2026-02-16T17:00:00+07:00',
        // Cho phep choi quiz trong luc cho mo cua
        allowQuiz: true
    },

    // ===== QUIZ =====
    QUIZ: {
        // So lan tra loi mini-quiz toi da trong 1 session lock.
        // Dat = 0 de khoa mini-quiz.
        maxAttempts: 30,
        // LOCKED mode co cho mini-quiz de mo them co hoi hay khong.
        enabledInLockedMode: true,
        // true: Trung money/special se duoc mo tiep ngay, khong can quiz.
        // Ket qua trung truoc do duoc giu, khong bi doi thanh ket qua truot sau.
        winContinueMode: true,
        // true: moi cau hoi chi hien 1 lan tren 1 thiet bi (luu localStorage).
        // false: co the lap lai cau hoi.
        uniquePerDevice: true
    },

    // ===== GAME BALANCE =====
    GAME: {
        totalEnvelopes: 30,
        // 'CHANCE' = theo ti le % ; 'COUNT' = theo so luong
        rewardMode: 'COUNT',

        // CHANCE mode
        trollChance: 0.2,
        specialChance: 0.2,
        moneyChance: 0.4,

        // COUNT mode (chi dung khi rewardMode = 'COUNT')
        // Neu tong vuot totalEnvelopes, uu tien giu: special -> money -> troll.
        trollCount: 2,
        specialCount: 1,
        moneyCount: 6
    },

    // ===== TIMINGS =====
    TIMINGS: {
        // Delay hien "reveal troll" trong modal ket qua (don vi: ms).
        // Vi du: 1200 = 1.2s.
        trollRevealDelayMs: 1111
    },

    // ===== LOCK DURATION =====
    DURATION: {
        // LOCKED mode: khoa trong bao nhieu ngay.
        lockDays: 365,
        // EVENT mode: khoa trong bao nhieu gio.
        eventHours: 24,
        // TEST mode: khoa trong bao nhieu giay.
        testSeconds: 60
    },

    // ===== STORAGE KEYS =====
    STORAGE: {
        // Key luu trang thai lock/fate.
        fateKey: 'lixi_fate_2026',
        // Key luu lich su cau quiz da hien (de tranh lap cau).
        quizSeenKey: 'lixi_quiz_seen_v1'
    }
};
