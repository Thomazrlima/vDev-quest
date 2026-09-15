# Archive

Nothing here is needed to build a character. Kept rather than deleted so nothing is lost.

- **`duplicate-of-bow-combat-3.2/`** — the folder that was sitting next to
  `20.08b - Bow Combat 3.2` as `... (1)`. Byte-for-byte identical (verified with `diff -rq`);
  the sprites from the original are now in `character-base/`.

- **`free-demo-character-base-2.0/`** — the free demo of the Character Base. It is a subset
  of the packs you own, and its sprites are an **older revision** — same filenames, different
  pixels — so it was kept separate rather than merged, to avoid stale art overwriting the
  paid versions.

- **`free-sample-farmer-sprite/`** — free sample of the Farmer Sprite System. Same story:
  a subset of `farmer-sprite-system/`, and it uses an older filename spelling
  (`fbas_1body_...` vs `fbas_01body_...`).

- **`redundant-duplicate-docs/`** — the per-pack `readme.txt` / `requirements.txt` /
  `naming conventions.txt` files. Each store pack shipped its own copy and they were
  byte-identical across packs, so one copy of each was kept in `docs/` and
  `character-base/guides/`. Original paths are encoded in the filenames with `__`.
