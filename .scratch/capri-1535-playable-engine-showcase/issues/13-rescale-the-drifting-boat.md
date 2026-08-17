# 13 — Bring the wounded sailor back to the deck scale

**What to build:** Restore a believable size relation between the two figures on
the drifting boat. At the authored handoff positions Michele renders 217 px
standing while the seated sailor renders 237 px — a seated man as tall as a
standing one, who would pass three metres upright. Because he is the only other
human figure in the frame, the error reads as Michele being too small and makes
the whole vessel look oversized. His Runtime image is refitted to `0.65` of its
current size, and the Scene is proved again in composition.

The Background is not repainted. An audit against Michele's scale sheet found
the painted vessel and its props coherent with each other and acceptable in
composition once the sailor is corrected.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] The wounded sailor's Runtime image is refitted to `0.65` of its current size from the approved Art Master, without regenerating or creatively deriving the artwork.
- [x] His Visual Anchor, Ground Point, frame declaration and Hotspot follow the new size, and he keeps contact with the deck.
- [x] At the authored handoff positions the seated sailor renders around 154 px against Michele's 217 px, and reads as a seated man beside a standing one.
- [x] He remains a stationary Character with exactly one static Runtime image and no presentation variants.
- [ ] The handoff framing, approach and Facings still compose, and the encounter Sequence plays unchanged.
- [ ] The refit is recorded in the sailor's provenance, together with the audit finding that the Background needed no repaint.
- [ ] An actual-size browser capture shows both figures together in composition.
- [ ] The package build and the full browser verification pass.

## Comments

- 2026-08-17, audit during this ticket: measured against Michele's rendered
  height at the Scene's own Approach Points, the painted vessel exaggerates its
  subjects by roughly `2.1–2.6×` relative to a historical gozzo — the mast is
  the worst offender. Reviewed in composition with Michele placed on the deck,
  the result nevertheless reads as a plausible mid-size coastal boat, because
  the painted props are coherent with one another. The repaint was dropped in
  favour of correcting the single figure that was actually wrong. The vessel is
  therefore larger than a gozzo; treat that as the accepted fiction.
- 2026-08-17: refitted to `0.65` and approved by eye in composition; the
  Author confirmed the proportions in the running Example. The provenance
  note, the actual-size capture and the full verification run were
  deliberately skipped at the Author's request and remain unticked.
