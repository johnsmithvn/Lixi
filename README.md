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
  FREE_MODE: false,
  EVENT_MODE: false,
  TEST_MODE: false,
  ENABLE_LOCK: true,

  MODE: 'LOCKED',
  ALLOW_QUERY_OVERRIDE: true,
  ENABLE_EXTRA_CHANCE_QUIZ: true,
  QUIZ_MAX_ATTEMPTS: 3,
  QUIZ_UNIQUE_PER_DEVICE: true,
  QUIZ_SEEN_STORAGE_KEY: 'lixi_quiz_seen_v1',

  OPEN_GATE_ENABLED: false,
  OPEN_GATE_AT: '2026-02-20T20:00:00+07:00',
  OPEN_GATE_ALLOW_QUIZ: true,

  TOTAL_ENVELOPES: 10,
  TROLL_CHANCE: 0.2,
  MONEY_CHANCE: 0.4,

  LOCK_DURATION_DAYS: 365,
  EVENT_LOCK_DURATION_HOURS: 24,
  TEST_LOCK_DURATION_SECONDS: 60,

  FATE_STORAGE_KEY: 'lixi_fate_2026'
};
```

Y nghia nhanh:

- `FREE_MODE: true` -> mo free mode ngay.
- `EVENT_MODE: true` -> lock theo gio event.
- `TEST_MODE: true` -> lock ngan de test.
- `ENABLE_LOCK: false` -> tuong duong free mode.
- `ENABLE_EXTRA_CHANCE_QUIZ: false` -> tat mini-quiz extra chance.
- `QUIZ_MAX_ATTEMPTS` -> so lan tra loi quiz toi da.
- `QUIZ_UNIQUE_PER_DEVICE: true` -> moi cau quiz chi hien thi 1 lan tren 1 thiet bi.
- `QUIZ_SEEN_STORAGE_KEY` -> key localStorage de luu lich su cau da hien.
- `OPEN_GATE_ENABLED: true` -> bat che do mo cua theo gio.
- `OPEN_GATE_AT` -> thoi diem web cho phep vao game.
- `OPEN_GATE_ALLOW_QUIZ: true` -> cho choi quiz khi dang cho mo cua.
- `TOTAL_ENVELOPES` -> so bao li xi moi round.
- `TROLL_CHANCE` -> ti le troll.
- `MONEY_CHANCE` -> ti le tien (phan con lai la joke).

## 6. Thu tu uu tien mode

He thong resolve mode theo thu tu:

1. Query `?mode=` (neu `ALLOW_QUERY_OVERRIDE = true`)
2. Boolean flags (`FREE_MODE`, `EVENT_MODE`, `TEST_MODE`, `ENABLE_LOCK`)
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
