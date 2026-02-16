# Lixi PRO++ (Web Li Xi)

Web mini-game li xi theo phong cach mobile-first, tap trung vao game-feel (animation, confetti, vibration, sound), mode system (FREE/LOCKED/EVENT/TEST) va kien truc tach module de mo rong de dang.

## 1. Tong Quan

- Cong nghe: HTML, CSS, JavaScript ES Modules (khong can framework).
- Runtime: Chay duoc tren static hosting (Vercel/Netlify/GitHub Pages) hoac local static server.
- Muc tieu UX:
  - Mo bao co cam giac game: reveal animation, confetti, streak.
  - Co co che "van menh" bang localStorage de han che spam refresh.
  - Co mode linh hoat de doi behavior nhanh khi deploy.

## 2. Tinh Nang Chinh

- Welcome screen + game screen + result modal.
- Envelope interactions:
  - Hover quote (desktop) + debounce.
  - Click mo bao + reveal zoom vao center.
- Reward system:
  - Money / Joke / Troll jackpot.
  - Lucky code cho tung ket qua.
  - Streak system + confetti tang cuong khi streak cao.
- Effects:
  - Confetti canvas.
  - Vibration tren mobile.
  - Sound effect (co fallback tone bang WebAudio neu chua gan file mp3).
- Share ket qua:
  - Su dung Web Share API neu ho tro.
  - Fallback copy clipboard.
- Game mode system:
  - `FREE`: choi tu do.
  - `LOCKED`: khoa sau lan choi, mo lai sau chu ky lock mac dinh (1 nam).
  - `EVENT`: khoa theo chu ky su kien (mac dinh 24h).
  - `TEST`: khoa ngan de test (mac dinh 60s).
- Locked screen:
  - Hien thong diep de thuong.
  - Hien ket qua gan nhat, ma may man, thoi diem mo lai.

## 3. Cau Truc Thu Muc

```text
.
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
    |   `-- rewardSystem.js
    |-- ui
    |   |-- envelope.js
    |   |-- modal.js
    |   `-- renderer.js
    `-- utils
        |-- random.js
        `-- storage.js
```

## 4. Kien Truc He Thong

### 4.1 `main.js` (composition root)

- Khoi tao renderer, modal, game engine, sound, confetti.
- Dang ky event qua event bus.
- Dieu phoi flow:
  - Start session.
  - Render round.
  - Open envelope -> reveal -> show result.
  - Handle locked state.

### 4.2 `src/core`

- `config.js`: tong hop config runtime + mode + timing + effect + storage keys.
- `eventBus.js`: pub/sub nhe de tach logic va UI.
- `state.js`: state runtime cua session/round.

### 4.3 `src/game`

- `rewardSystem.js`: random data (faces, quotes, rewards) va resolve ket qua.
- `gameMode.js`: lock/fate logic theo mode, su dung localStorage.
- `gameEngine.js`: nghiep vu game chinh, emit cac event `round:ready`, `state:updated`, `session:locked`.

### 4.4 `src/ui`

- `renderer.js`: render game screen, envelopes, speech, locked screen.
- `envelope.js`: tao DOM envelope + reveal animation.
- `modal.js`: hien/an result modal + feedback share.

### 4.5 `src/effects`

- `confetti.js`: canvas confetti engine.
- `sound.js`: phat am thanh tu `<audio>`, fallback tone.
- `vibration.js`: rung thiet bi neu browser ho tro.

### 4.6 `src/utils`

- `random.js`: random helpers (shuffle, pick, lucky code).
- `storage.js`: wrapper localStorage (number/json).

## 5. Cau Hinh Runtime

File: `config.js` (root).

```js
window.APP_CONFIG = {
  MODE: 'LOCKED',
  LOCK_DURATION_MS: 365 * 24 * 60 * 60 * 1000,
  EVENT_LOCK_DURATION_MS: 24 * 60 * 60 * 1000,
  TEST_LOCK_DURATION_MS: 60 * 1000,
  ALLOW_QUERY_OVERRIDE: true,
  FATE_STORAGE_KEY: 'lixi_fate_2026'
};
```

### 5.1 Meaning

- `MODE`: `FREE | LOCKED | EVENT | TEST`
- `LOCK_DURATION_MS`: thoi gian lock cho `LOCKED`.
- `EVENT_LOCK_DURATION_MS`: thoi gian lock cho `EVENT`.
- `TEST_LOCK_DURATION_MS`: thoi gian lock cho `TEST`.
- `ALLOW_QUERY_OVERRIDE`: cho phep test nhanh bang query.
- `FATE_STORAGE_KEY`: key localStorage luu fate.

### 5.2 Query override

Neu `ALLOW_QUERY_OVERRIDE = true`, co the test nhanh:

- `?mode=free`
- `?mode=locked`
- `?mode=event`
- `?mode=test`

## 6. LocalStorage Keys

- `lixi_best_streak_v1`: luu best streak.
- `lixi_fate_2026` (hoac key custom): luu fate lock state.

Gia tri fate mau:

```json
{
  "mode": "LOCKED",
  "playedAt": 1760000000000,
  "expireAt": 1791536000000,
  "result": {
    "type": "money",
    "title": "Ban nhan duoc: 100.000d",
    "text": "Chuc mung nam moi!",
    "luckyCode": "#AB12CD"
  }
}
```

## 7. Cach Chay Local

Du an la static site, dung bat ky static server nao.

Vi du voi VS Code Live Server hoac:

```powershell
# Option 1: Python
python -m http.server 8080

# Option 2: Node (neu da co npx)
npx serve .
```

Sau do mo `http://localhost:8080`.

## 8. Deploy Vercel (Static)

- Framework Preset: `Other`.
- Build Command: de trong.
- Output Directory: de trong.
- Chinh mode bang cach sua `config.js` roi redeploy.

## 9. Quy Uoc Versioning

- Dung Semantic Versioning: `MAJOR.MINOR.PATCH`.
- Moi thay doi phai cap nhat `CHANGE4LOG.md`.
- Tham chieu section huong dan trong `CHANGE4LOG.md`.

## 10. Huong Phat Trien Tiep

- Them animation flow 2-step/3-step drama cho mobile.
- Gan file mp3 that cho `click-sfx`, `win-sfx`, `troll-sfx`.
- Them test nhe cho logic mode va storage wrappers.

