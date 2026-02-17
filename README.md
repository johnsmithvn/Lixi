# Lixi PRO++ (Web Li Xi)

Web mini-game li xi theo huong mobile-first, module architecture, va mode lock linh hoat.

## 1. Tong quan

- Tech: HTML + CSS + JavaScript ES Modules.
- Khong can backend.
- Chay tren static hosting (Vercel, Netlify, GitHub Pages) hoac local static server.

## 2. Tinh nang hien tai

- Mo bao li xi voi animation reveal + confetti + vibration + sound.
- Reward gom 3 nhom:
  - `money`
  - `troll`
  - `joke`
- Streak system + best streak luu localStorage.
- Mode system:
  - `FREE`
  - `LOCKED`
  - `EVENT`
  - `TEST`
- Open gate theo gio:
  - Neu chua den gio mo cua -> hien man hinh dem nguoc.
  - Co the bat quiz trong luc cho mo cua.
- LOCKED mode co `Quiz Extra Chance`:
  - Neu lan dau mo ra `troll`/`joke`, user duoc quiz 1 cau.
  - Dung: them 1 luot mo bao.
  - Sai: khoa luot.
- Khi da bi lock van co the `Choi quiz cho vui` (khong mo khoa, khong tinh luot).
- Quiz chi ho tro `text` va `image` (khong ho tro video).

## 3. UX quiz (theo y tuong moi)

- Moi lan chi hien thi 1 cau hoi.
- Copy feedback:
  - Dung: `🎉 Chinh xac! Vu tru cho ban them 1 co hoi!`
  - Sai: `😆 Hoi thieu mot chut! Van may dung lai o day nhe~`
- Neu sai, khong show text "Sai" theo kieu tieu cuc.

## 4. Cau truc thu muc

```text
.
|-- assets
|   `-- images
|       `-- banhchung.svg
|-- config.js
|-- index.html
|-- main.js
|-- style.css
`-- src
    |-- core
    |   |-- config.js
    |   |-- eventBus.js
    |   `-- state.js
    |-- effects
    |   |-- confetti.js
    |   |-- sound.js
    |   `-- vibration.js
    |-- game
    |   |-- gameEngine.js
    |   |-- gameMode.js
    |   |-- quizData.js
    |   |-- quizEngine.js
    |   `-- rewardSystem.js
    |-- ui
    |   |-- envelope.js
    |   |-- modal.js
    |   |-- quizModal.js
    |   `-- renderer.js
    `-- utils
        |-- random.js
        `-- storage.js
```

## 5. Config de sua nhanh (true/false)

File: `config.js`

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
    enabledInLockedMode: true,
    maxAttempts: 3,
    uniquePerDevice: true
  },

  GAME: {
    totalEnvelopes: 10,
    rewardMode: 'CHANCE',

    trollChance: 0.2,
    specialChance: 0.05,
    moneyChance: 0.4,

    trollCount: 2,
    specialCount: 1,
    moneyCount: 4
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

Y nghia nhanh:

- `MODE` -> chon che do game (`FREE` | `LOCKED` | `EVENT` | `TEST`).
- `MODE_OPTIONS.allowQueryOverride` -> cho phep override nhanh bang query `?mode=...`.
- `OPEN_GATE` -> bat/tat mo cua theo gio.
- `QUIZ` -> cau hinh mini-quiz extra chance.
- `GAME` -> so bao + kieu chia reward.
- `GAME.rewardMode: 'CHANCE'` -> dung `trollChance`, `specialChance`, `moneyChance`.
- `GAME.rewardMode: 'COUNT'` -> dung `trollCount`, `specialCount`, `moneyCount`.
- Neu tong count vuot `totalEnvelopes`, he thong uu tien giu: `special` -> `money` -> `troll`.
- `DURATION` -> thoi gian lock cho tung mode.
- `STORAGE` -> key localStorage.

Mac dinh da de san trong code cho cac thong so ky thuat nhu confetti dac biet, sound source va open-flow face image. Chi can khai bao lai khi ban muon custom nang cao.

Luu y: key kieu cu (flat config) van duoc ho tro de tuong thich nguoc.

## 6. Thu tu uu tien mode

He thong resolve mode theo thu tu:

1. Query `?mode=` (neu `MODE_OPTIONS.allowQueryOverride = true`)
2. Boolean flags (chi de tuong thich nguoc): `FREE_MODE`, `EVENT_MODE`, `TEST_MODE`, `ENABLE_LOCK`
3. `MODE`
4. Mac dinh `LOCKED`

Gia tri query hop le:

- `?mode=free`
- `?mode=locked`
- `?mode=event`
- `?mode=test`

## 7. LocalStorage keys

- `lixi_best_streak_v1`: best streak.
- `lixi_fate_2026` (hoac key custom): lock state theo mode.

## 8. Them cau hoi quiz moi

Sua file: `src/game/quizData.js`

Mau `text`:

```js
{
  id: 'q_text_1',
  type: 'text',
  question: 'Tet thuong co may ngay nghi chinh thuc?',
  media: null,
  answers: [
    { text: '1 ngay', correct: false },
    { text: '3 ngay', correct: true },
    { text: '7 ngay', correct: false }
  ]
}
```

Mau `image`:

```js
{
  id: 'q_image_1',
  type: 'image',
  question: 'Trong hinh la mon gi ngay Tet?',
  media: '/assets/images/banhchung.svg',
  answers: [
    { text: 'Banh chung', correct: true },
    { text: 'Pizza', correct: false }
  ]
}
```

Mau `word` (co the truyen chu da xao san):

```js
{
  id: 'w_custom_1',
  question: 'Giai ma tu khoa Tet sau',
  hint: 'Mon banh truyen thong goi la dong',
  answer: 'BANH CHUNG',
  // Neu co field nay thi se dung luon, khong random nua
  presetScrambled: 'CHUN GHBAN'
}
```

Luu y:

- Khong dung `type: 'video'`.
- Moi cau can it nhat 2 dap an.
- Moi cau nen co dung 1 dap an `correct: true`.
- Word puzzle co ho tro alias `scrambled`, nhung nen dung `presetScrambled` de ro nghia.

## 9. Chay local

```powershell
# Option 1
python -m http.server 8080

# Option 2
npx serve .
```

Mo `http://localhost:8080`.

## 10. Versioning

- Dung Semantic Versioning.
- Moi thay doi can cap nhat `CHANGE4LOG.md`.
