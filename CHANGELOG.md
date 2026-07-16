# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-07-17

### Fixed

- `toKey({})` and `toKey([])` produced the same key. Empty (or all-`undefined`) objects and empty arrays are now distinguished, as are nested cases like `[{}]` vs `[[]]` and `{ a: {} }` vs `{ a: [] }`.

### Changed

- Performance: ~1.3–1.6x faster key generation for objects and arrays.
- Internal key encoding for arrays changed as part of the fix above. Keys are opaque and one-way, but if you persist keys across versions, keys containing arrays will differ from those produced by 1.0.3.

## 1.0.3 - 2024-10-24

## 1.0.2 - 2024-09-14

## 1.0.1 - 2024-07-01

## 1.0.0 - 2024-05-18

- Initial release.

[1.0.4]: https://github.com/Krombik/keyweaver/releases/tag/v1.0.4
