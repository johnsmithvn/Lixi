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

**Current:** `0.4.0`

## 5. Lich Su Thay Doi

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

