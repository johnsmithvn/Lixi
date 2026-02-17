# Lixi PRO++ (Web Li Xi)

Web mini-game li xi theo huong mobile-first, khong can backend, chay duoc tren static hosting.

## 1. Tong quan

- Tech: HTML + CSS + JavaScript ES Modules.
- Kien truc module: `src/core`, `src/game`, `src/ui`, `src/effects`, `src/utils`.
- Co lock mode theo localStorage + event bus de tach luong UI/game.

## 2. Tinh nang hien tai

- Mo bao li xi voi reveal animation + confetti + vibration + sound.
- Reward type:
  - `money`
  - `special`
  - `troll`
  - `joke`
- Open flow truoc khi mo bao (`QUICK` / `DRAMA`), co buoc warning.
- Open gate theo gio (`OPEN_GATE`) voi man hinh dem nguoc.
- Quiz he thong:
  - `choice`
  - `word`
  - `stroop` (dynamic)
  - `reaction` (dynamic)
- Locked state:
  - co man hinh ket qua gan nhat
  - co footer dem nguoc `Co the mo lai tu...` + `Con khoang...`
- Modal ket qua da ho tro:
  - noi dung dai co the scroll tren mobile
  - highlight loi chuc theo tung loai ket qua

## 3. Mode game va lock behavior

Mode ho tro:

- `FREE`
- `LOCKED`
- `EVENT`
- `TEST`

Thu tu resolve mode:

1. Query `?mode=` (neu `MODE_OPTIONS.allowQueryOverride = true`)
2. Legacy flags (`FREE_MODE`, `EVENT_MODE`, `TEST_MODE`, `ENABLE_LOCK`)
3. `MODE`
4. Mac dinh `LOCKED`

## 4. Config nhanh (config.js)

```js
window.APP_CONFIG = {
  MODE: 'LOCKED',
  MODE_OPTIONS: {
    allowQueryOverride: true
  },

  OPEN_GATE: {
    enabled: false,
    at: '2026-02-20T20:00:00+07:00',
    allowQuiz: true
  },

  QUIZ: {
    // Neu winContinueMode = false: so lan quiz toi da
    // Neu winContinueMode = true: so luot xit toi da truoc khi khoa
    maxAttempts: 3,
    enabledInLockedMode: true,

    // true: trung money/special thi duoc mo tiep ngay, bo qua quiz
    // maxAttempts luc nay duoc tinh la so luot xit toi da truoc khi khoa
    winContinueMode: false,

    uniquePerDevice: true
  },

  GAME: {
    totalEnvelopes: 10,
    rewardMode: 'CHANCE', // 'CHANCE' | 'COUNT'

    // CHANCE mode
    trollChance: 0.2,
    specialChance: 0.05,
    moneyChance: 0.4,

    // COUNT mode
    trollCount: 2,
    specialCount: 1,
    moneyCount: 4
  },

  TIMINGS: {
    trollRevealDelayMs: 1200
  },

  DURATION: {
    lockDays: 365,
    eventHours: 24,
    testSeconds: 60
  },

  STORAGE: {
    fateKey: 'lixi_fate_2026',
    quizSeenKey: 'lixi_quiz_seen_v1'
  }
};
```

Luu y quan trong:

- `GAME.rewardMode = 'COUNT'`: neu tong count vuot `totalEnvelopes`, he thong uu tien `special -> money -> troll`.
- `QUIZ.winContinueMode = false`: `maxAttempts` la quota quiz.
- `QUIZ.winContinueMode = true`: `maxAttempts` la so luot xit toi da truoc khi khoa.
- Khi `winContinueMode = true`, ket qua trung dau tien duoc giu (khong bi doi bang ket qua mo sau).

## 5. Quiz data

Sua file: `src/game/quizData.js`.

- `choice`: cau hoi text/image.
- `word`: sap xep chu.
- `stroop`: tao cau hoi dynamic tu `STROOP_DYNAMIC_CONFIG`.
- `reaction`: tao cau hoi dynamic tu `REACTION_DYNAMIC_CONFIG`.

Media quiz image hien tai nam trong:

- `assets/images/banhchung.png`
- `assets/images/daudau.png`
- `assets/images/dautim.jpg`
- `assets/images/hoc.jpg`
- `assets/images/leuleu.jpg`
- `assets/images/suynghi.jpg`
- `assets/images/uwu.jpg`
- `assets/images/yamero.jpg`

## 6. Run local

```powershell
# Option 1
python -m http.server 8080

# Option 2
npx serve .
```

Mo `http://localhost:8080`.

## 7. Tai lieu version

- Changelog: `CHANGELOG.md`
- Dung Semantic Versioning.
