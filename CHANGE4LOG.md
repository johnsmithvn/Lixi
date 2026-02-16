# CHANGE4LOG

Tai lieu nay dung de theo doi version va lich su thay doi cua project.

## 1. Quy Uoc Bat Buoc

- Luon cap nhat file nay moi khi merge thay doi vao nhanh chinh.
- Version theo Semantic Versioning: `MAJOR.MINOR.PATCH`.
- Ngay theo dinh dang: `YYYY-MM-DD`.
- Moi release gom 3 nhom:
  - `Added`
  - `Changed`
  - `Fixed`

## 2. Cach Tang Version

- Tang `PATCH` (`x.y.Z`) khi:
  - Sua bug.
  - Refactor nho khong doi behavior chinh.
- Tang `MINOR` (`x.Y.z`) khi:
  - Them tinh nang moi backwards-compatible.
  - Them mode/tuy chon moi.
- Tang `MAJOR` (`X.y.z`) khi:
  - Co breaking change.
  - Doi cau truc hoac API noi bo anh huong luong hien tai.

## 3. Mau Release

```md
## [x.y.z] - YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Fixed
- ...
```

## 4. Current Version

**Current:** `0.4.2`

## 5. Lich Su Thay Doi

## [0.4.2] - 2026-02-16

### Added
- Them phan hien thi `Kết quả gần nhất` theo the ro rang hon tren man hinh lock:
  - Badge theo loai ket qua (`money`, `joke`, `troll`)
  - Highlight gia tri tien neu co
  - Luon hien thi loi chuc vui nhon
- Them cac style moi cho khu vuc ket qua lock (`latest-result-*`).

### Changed
- Loai bo hoan toan `Mã may mắn` khoi:
  - Result modal
  - Share text
  - Du lieu fate luu localStorage
- Dieu chinh text ket qua tien de tone vui nhon hon.

### Fixed
- Tranh hien thi thong tin du thua trong modal va lock screen.

## [0.4.1] - 2026-02-16

### Added
- Them bo cờ boolean de bat/tat mode de dang trong `config.js`:
  - `FREE_MODE`
  - `EVENT_MODE`
  - `TEST_MODE`
  - `ENABLE_LOCK`
- Them duration theo don vi de doc:
  - `LOCK_DURATION_DAYS`
  - `EVENT_LOCK_DURATION_HOURS`
  - `TEST_LOCK_DURATION_SECONDS`

### Changed
- `src/core/config.js` ho tro dong thoi:
  - Kieu cu (`MODE`, `*_MS`)
  - Kieu moi (boolean flags + don vi day/hour/second)
- Cap nhat `README.md` them huong dan toggle true/false va thu tu uu tien resolve mode.

### Fixed
- Don gian hoa thao tac config de tranh sua nham cho team non-technical.

## [0.4.0] - 2026-02-16

### Added
- Them mode system `FREE | LOCKED | EVENT | TEST` qua `config.js`.
- Them co che lock fate bang localStorage va man hinh locked state.
- Them tai lieu `README.md` mo ta chi tiet kien truc va cau hinh.
- Them file `CHANGE4LOG.md` de quan ly version lau dai.

### Changed
- Refactor theo kien truc module `src/core`, `src/game`, `src/ui`, `src/effects`, `src/utils`.
- Cap nhat flow `main.js` de dieu phoi bang event bus.
- Cap nhat `index.html` de nap `config.js` truoc `main.js`.

### Fixed
- Chuan hoa lock check o `startSession`, `startRound`, `openEnvelope`.
- Tu dong xoa fate het han hoac sai mode de tranh lock sai.
