# Mana Seed character assets

Everything here is Mana Seed art by **Seliel the Shaper**. What used to be ~20 unzipped
store folders is now merged into **two sprite systems**, each organised by _what the player
picks_ (body → outfit → hair → hat → tool) rather than by which store page it shipped from.

```
character-base/          ← system A: char_a_*  (512×512 pages of 64×64 frames)
farmer-sprite-system/    ← system B: fbas_*    (one sheet per part, 64×64 cells)
docs/                    ← licence, creator guidelines, support links
catalog.json             ← machine-readable index of every part (for the customizer UI)
MANIFEST-file-moves.csv  ← every file move made during the reorg (undo record)
_archive/                ← free demos, an exact-duplicate folder, redundant doc copies
```

## The two systems are not interchangeable

They are different characters drawn at different proportions with different layer schemes.
**Pick one for your game.** Nothing layers across the two.

|                | `character-base`                            | `farmer-sprite-system`                     |
| -------------- | ------------------------------------------- | ------------------------------------------ |
| File prefix    | `char_a_`                                   | `fbas_`                                    |
| Sheet layout   | one 512×512 "page" per animation set        | one sheet per part, all animations on it   |
| Frame / cell   | 64×64                                       | 64×64                                      |
| Layers         | 9 (`0bot`…`7tlb`)                           | 16 (`00undr`…`15over`)                     |
| Combat         | yes — bow, one-hand, polearm                | light (slash effects, 1h weapon props)     |
| Farming        | yes                                         | yes, more of it                            |
| Body variants  | 11 human skin tones + goblin + demon        | 1 body, recoloured at runtime              |
| Outfit slots   | 1 outfit covers the whole body              | separate socks / shoes / pants / shirt / … |
| Recolour model | pre-baked colour variants (`_v01`, `_v02`…) | swap palette ramps at runtime              |
| Has a GUI tool | no                                          | yes — `customizer/`                        |

Rough guidance: **`farmer-sprite-system`** gives finer-grained dress-up (you can mix socks,
boots, pants and a shirt independently) and is designed for runtime palette swapping, so a
"pick any colour" UI is cheaper. **`character-base`** gives far more animation coverage —
real bow / sword / spear combat pages — but outfits are whole-body and colours are
pre-baked, so your colour picker is limited to the variants that ship.

## Choosing skin / outfit / hair

Both systems are paper dolls: draw the layers in order, same frame index, same sheet
coordinates. Each system's `README.md` has its own draw order and a worked example.

`catalog.json` enumerates every part with its layer, folder, available animation pages and
colour variants — feed it to the character-creator UI instead of hard-coding filenames.

## Where the old folders went

Nothing was renamed and nothing was deleted. Filenames still carry the author's naming
convention (that convention is what the guides and the code should key off, not the folder
names). `MANIFEST-file-moves.csv` records every `source → destination` pair, so any move can
be reversed.
