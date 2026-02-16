# CHANGE4LOG

Tai lieu theo doi version va lich su thay doi.

## 1. Quy uoc

- Luon cap nhat file nay moi khi co thay doi.
- Dung Semantic Versioning: `MAJOR.MINOR.PATCH`.
- Ngay theo dinh dang `YYYY-MM-DD`.
- Moi release gom 3 nhom: `Added`, `Changed`, `Fixed`.

## 2. Cach tang version

- Tang `PATCH` (`x.y.Z`) khi sua bug hoac update docs nho.
- Tang `MINOR` (`x.Y.z`) khi them tinh nang moi (backward-compatible).
- Tang `MAJOR` (`X.y.z`) khi co breaking change.

## 3. Current Version

**Current:** `0.8.4`

## 4. Lich su thay doi

## [0.8.4] - 2026-02-16

### Added
- Word puzzle ho tro field `presetScrambled` (hoac alias `scrambled`) de truyen chu da xao san.

### Changed
- Neu `presetScrambled` hop le thi su dung truc tiep, khong random nua.
- Neu khong co `presetScrambled` hoac field sai du lieu thi fallback ve random nhu cu.

### Fixed
- Bo sung validate de dam bao `presetScrambled` dung bo chu cua dap an, tranh puzzle loi.

## [0.8.3] - 2026-02-16

### Added
- Khi user da bi lock, man hinh lock van hien nut:
  - `🧠 Chơi quiz cho vui (không tính lượt)`.
- Them luong `locked_fun` trong `main.js` de choi quiz giai tri ma khong anh huong:
  - lock state
  - quiz attempts cua game
  - ket qua li xi da khoa.

### Changed
- `quiz modal` ho tro mode mo category khong hien counter attempts khi quiz chi de giai tri.

## [0.8.2] - 2026-02-16

### Added
- Them co che khong lap lai cau quiz tren cung 1 thiet bi (localStorage):
  - Mac dinh bat qua `QUIZ_UNIQUE_PER_DEVICE`.
  - Luu danh sach cau da hien qua `QUIZ_SEEN_STORAGE_KEY`.

### Changed
- Quiz trắc nghiệm co highlight ket qua ngay sau khi tra loi:
  - Dap an dung: mau xanh.
  - Dap an chon sai: mau do.
  - Cac dap an khac lam mo nhe de de nhin.
- Them motion nhe cho highlight dap an de UI mem mai hon.

### Fixed
- Neu het cau hoi moi tren thiet bi, hệ thống hien thong bao ro rang thay vi dung im.

## [0.8.1] - 2026-02-16

### Changed
- Viet hoa lai UI quiz theo tieng Viet de de hieu hon:
  - `🔤 Word Puzzle` -> `🔤 Xếp chữ Tết`
  - Label/chu trong modal quiz hien thi tieng Viet day du.
- Bo du lieu `WORD_PUZZLE_SET` cho phep dap an co khoang trang (vi du: `HOA MAI`, `BÁNH CHƯNG`, `LÌ XÌ`).
- Word Puzzle hien thi chu cai co dau (neu dap an co dau), trong khi logic cham diem van normalize de on dinh.

### Fixed
- Sua hien thi chu bi loi ma hoa trong quiz modal (chu tieng Viet bi vo dau/sai ky tu).
- Word Puzzle hien thi tach cum tu ro rang hon:
  - Chu xao tron duoc nhom theo tung tu.
  - O dien dap an co khoang ngat giua cac tu.

## [0.8.0] - 2026-02-16

### Added
- Them config mo cua theo gio:
  - `OPEN_GATE_ENABLED`
  - `OPEN_GATE_AT`
  - `OPEN_GATE_ALLOW_QUIZ`
- Them man hinh `opening-screen` dem nguoc den gio mo cua.
- Trong luc cho mo cua, user co the choi mini-quiz (neu bat config).

### Changed
- `main.js` doi flow bat dau game:
  - Neu chua den gio mo cua thi vao man hinh dem nguoc.
  - Den gio mo cua moi vao game.
- Cap nhat README de mo ta ro config `OPEN_GATE_*`.

### Fixed
- Loai bo hoan toan luong "gui ket qua cho ban be/share" khoi UI va controller.
- Don dep CSS du thua cua button share.

## [0.7.3] - 2026-02-16

### Changed
- Loai bo hoan toan co che `showShareFeedback` trong flow share result.
- Nút share khong doi text tam thoi sau khi copy/share nua.

### Fixed
- Chinh `open-flow-modal` can giua man hinh (desktop + mobile), khong con bi dinh sat phan duoi.

## [0.7.2] - 2026-02-16

### Changed
- `FLOW_FINAL` doi sang co che hien ngau nhien, khong con phu thuoc vao ket qua `money/troll`.
- Them config `OPEN_FLOW_FINAL_RANDOM_CHANCE` de chinh ti le hien buoc final.

## [0.7.1] - 2026-02-16

### Added
- Ho tro dung anh asset cho icon trong open-flow modal:
  - `OPEN_FLOW_CONFIRM_FACE_IMAGE`
  - `OPEN_FLOW_FINAL_FACE_IMAGE`
- Them style rieng cho avatar anh trong open-flow (`.open-flow-face-image`).

### Changed
- Chuan hoa lai noi dung text trong `src/ui/openFlowModal.js` sang tieng Viet co dau.
- Neu co anh config thi uu tien hien anh, neu khong se fallback ve emoji mac dinh.

## [0.7.0] - 2026-02-16

### Added
- Them `open flow modal` theo state machine de mo bao theo kieu mobile-first:
  - `TALK`
  - `CONFIRM`
  - `FINAL_CONFIRM` (drama step)
- Them module moi: `src/ui/openFlowModal.js`.
- Them config de bat/tat luong drama:
  - `OPEN_FLOW_MODE` (`QUICK` | `DRAMA`)
  - `DRAMA_OPEN_FLOW`
  - `DRAMA_TALK_STEP`
  - `DRAMA_FINAL_STEP`

### Changed
- Click vao bao khong mo ngay nua (khi o `DRAMA`), ma di qua popup flow truoc.
- `main.js` doi event flow:
  - `ui:open-envelope` -> open flow
  - `ui:open-envelope-confirmed` -> mo bao that su.
- Them helper `getEnvelopePreview(index)` trong `src/game/gameEngine.js` de render noi dung popup theo bao da chon.

### Fixed
- Dong bo viec dong modal flow khi vao lock screen, extra chance screen, quiz va cac luong close modal khac, tranh overlap UI.

## [0.6.3] - 2026-02-16

### Changed
- Dieu chinh flow `LOCKED + Quiz`:
  - Sau khi user quiz dung va bốc lai, neu van con luot quiz thi tiep tuc duoc quiz them.
  - Khong khoa cung ngay sau lan bốc lai neu van con quota quiz.
- Cho phep vong lap:
  - `Quiz dung -> mo 1 bao`
  - `Neu chua het quiz attempts -> duoc quiz tiep`.

### Fixed
- Sua dieu kien `canOfferExtraChance()` de khong bi chan boi flag `usedExtraChance` khi user van con luot quiz.

## [0.6.2] - 2026-02-16

### Added
- Ho tro flow `trung tien lan dau` + `Bốc lại nào`:
  - Bam `Bốc lại nào` se mo chon the loai quiz.
  - Qua quiz se duoc mo them 1 bao de bốc lại.

### Changed
- LOCKED mode cho phep `extra chance` ca khi ket qua lan dau la `money`.
- Khi da lock ket qua lan dau va user mo thanh cong luot bốc lai, ket qua moi se ghi de fate cu.
- Cap nhat man hinh extra chance de co thong diep rieng cho case `trung roi nhung muon bốc lai`.

### Fixed
- Luu them truong `reveal` / `claimNote` vao fate de lock screen hien dung thong tin ket qua.

## [0.6.1] - 2026-02-16

### Changed
- Khoi phuc troll jackpot ve dang:
  - `BẠN TRÚNG JACKPOT!!!`
  - `999.999.999đ`
- Word Puzzle doi tu kieu nhap text sang kieu chon chu cai:
  - Bam chu cai de dien vao o.
  - Bam lai o da dien de go chu.
  - Them nut `Xóa hết`.

### Fixed
- Man hinh khoa (`Ket qua gan nhat`) voi ket qua troll se uu tien hien `reveal` thay vi dong `999.999.999đ` de tranh hieu nham trung tien that.

## [0.6.0] - 2026-02-16

### Added
- Them he thong chon the loai quiz truoc khi tra loi:
  - `🧠 Trắc nghiệm`
  - `🔤 Word Puzzle`
- Them bo du lieu `word puzzle` trong `src/game/quizData.js`.
- Them UI quiz moi:
  - danh sach chon the loai
  - o nhap dap an cho word puzzle
  - hien thi tien trinh luot tra loi theo tung the loai.
- Them thong diep claim khi trung tien:
  - `📸 Chụp ảnh màn hình gửi chủ thớt để lĩnh xèng nha!`

### Changed
- Refactor `src/game/quizEngine.js` de ho tro:
  - nhieu kieu quiz (`choice`, `word`)
  - nhieu kieu input tra loi (`answerIndex`, `textAnswer`)
- Cap nhat flow `main.js`:
  - vao quiz se chon the loai truoc
  - neu sai nhung con luot se duoc chon the loai lai.
- Dieu chinh `troll jackpot` theo huong de thuong, giam cam giac trung tien that.

### Fixed
- Tranh hien thi thong diep troll de gay hieu nham trung giai lon.

## [0.5.2] - 2026-02-16

### Added
- Them config game balance trong `config.js`:
  - `TOTAL_ENVELOPES`
  - `TROLL_CHANCE`
  - `MONEY_CHANCE`
  - `QUIZ_MAX_ATTEMPTS`

### Changed
- Tang so luong bao li xi mac dinh len `10`.
- Chinh lai xac suat ket qua theo yeu cau:
  - `money`: `40%`
  - `troll`: `20%`
  - `joke`: phan con lai
- Cap nhat flow quiz extra chance:
  - User co toi da `3` lan tra loi.
  - Dung bat ky lan nao thi duoc mo them 1 bao.
  - Sai se duoc tra loi tiep den khi het 3 lan moi khoa.
- Cap nhat UI quiz de hien thi tien trinh luot (`1/3`, `2/3`, ...).

### Fixed
- Dam bao game tao du `10` bao ngay ca khi pool face nho hon.

## [0.5.1] - 2026-02-16

### Added
- Cap nhat `README.md` mo ta ro `Quiz Extra Chance` va huong dan config true/false de sua nhanh.
- Bo sung huong dan them cau hoi quiz (`text`/`image`) trong `README.md`.

### Changed
- Dong bo tai lieu voi code hien tai:
  - Da bo logic lucky code.
  - Da co cau truc module quiz (`quizData`, `quizEngine`, `quizModal`).

### Fixed
- Chinh lai tai lieu de tranh nham lan feature cu va feature moi.

## [0.5.0] - 2026-02-16

### Added
- Them mini-game `Quiz Extra Chance` cho `LOCKED` mode:
  - Sau ket qua `troll`/`joke` lan dau, user co the lam quiz 1 cau de mo them 1 bao.
  - Quiz render dynamic tu `src/game/quizData.js`.
  - Ho tro media `text` + `image` (khong dung video).
- Them module moi:
  - `src/game/quizData.js`
  - `src/game/quizEngine.js`
  - `src/ui/quizModal.js`
- Them sample media asset: `assets/images/banhchung.svg`.

### Changed
- Refactor `gameEngine` de ho tro state cho extra chance:
  - `played`, `hasMoney`, `usedExtraChance`, `quizPassed`, `extraChanceAvailable`, `extraChanceUnlocked`.
- Cap nhat lock flow:
  - `LOCKED` mode khong lock ngay khi non-money lan 1.
  - Sai quiz hoac non-money lan 2 moi lock.
- Cap nhat UI:
  - Them nut `Thử vận may lần nữa` trong result modal.
  - Them man extra chance prompt.
  - Them quiz modal theo style mobile-first.

### Fixed
- Quiz feedback theo UX moi:
  - Sai: `😆 Hơi thiếu một chút! Vận may dừng lại ở đây nhé~`
  - Dung: `🎉 Chính xác! Vũ trụ cho bạn thêm 1 cơ hội!`
- Tranh dong lock screen ngay lap tuc truoc khi user doc quiz feedback.

## [0.4.2] - 2026-02-16

### Added
- Them khu `Ket qua gan nhat` ro rang hon tren man lock:
  - Badge theo loai ket qua.
  - Highlight gia tri tien neu co.
  - Luon co loi chuc.

### Changed
- Loai bo hoan toan `Ma may man` khoi modal/share/fate.

### Fixed
- Giam thong tin du thua trong modal va lock screen.

## [0.4.1] - 2026-02-16

### Added
- Them bo flag true/false trong `config.js`:
  - `FREE_MODE`, `EVENT_MODE`, `TEST_MODE`, `ENABLE_LOCK`.
- Them duration theo don vi de doc:
  - `LOCK_DURATION_DAYS`, `EVENT_LOCK_DURATION_HOURS`, `TEST_LOCK_DURATION_SECONDS`.

### Changed
- `src/core/config.js` ho tro ca kieu cu (`*_MS`) va kieu moi (flags + unit).

### Fixed
- Don gian hoa thao tac config, tranh sua nham.

## [0.4.0] - 2026-02-16

### Added
- Them mode system `FREE | LOCKED | EVENT | TEST` qua `config.js`.
- Them co che lock fate bang localStorage va man hinh locked state.
- Them `README.md` va `CHANGE4LOG.md`.

### Changed
- Refactor sang kien truc module (`src/core`, `src/game`, `src/ui`, `src/effects`, `src/utils`).
- Cap nhat flow `main.js` theo event bus.

### Fixed
- Chuan hoa lock check o `startSession`, `startRound`, `openEnvelope`.
- Tu dong xoa fate het han hoac sai mode.
