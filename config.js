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
        enabled: true,
        // Vi du: '2026-02-20T20:00:00+07:00'
        at: '2026-02-17T14:00:00+07:00',
        // Cho phep choi quiz trong luc cho mo cua
        allowQuiz: true
    },

    // ===== QUIZ =====
    QUIZ: {
        // Neu winContinueMode = false: so lan tra loi mini-quiz toi da.
        // Neu winContinueMode = true: so luot xit toi da truoc khi bi khoa.
        maxAttempts: 20,
        // LOCKED mode co cho mini-quiz de mo them co hoi hay khong.
        enabledInLockedMode: true,
        // true: Trung money/special se duoc mo tiep ngay, khong can quiz.
        // Ket qua trung truoc do duoc giu, khong bi doi thanh ket qua truot sau.
        winContinueMode: false,
        // true: moi cau hoi chi hien 1 lan tren 1 thiet bi (luu localStorage).
        // false: co the lap lai cau hoi.
        uniquePerDevice: true,

        // Danh sach anh random dung chung cho 2 mini game:
        // - "Ai nhanh hon" (stroop)
        // - "Phan xa nhanh" (reaction)
        // De [] hoac bo qua de dung list mac dinh trong code.
        mediaPool: [
            '/assets/images/hoc.jpg',
            '/assets/images/suynghi.jpg',
            // '/assets/images/daudau.png',
            // '/assets/images/uwu.jpg',
            // '/assets/images/leuleu.jpg',
            // '/assets/images/dautim.jpg'
                        '/assets/images/tenor.gif'

        ]
    },

    // ===== GAME BALANCE =====
    GAME: {
        totalEnvelopes: 24,
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
        moneyCount: 7
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
