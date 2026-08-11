# 11 — Own narrative and system HUD

**What to build:** Complete HUD ownership for narrative text, Choices and system overlays so accessible presentation decisions are separate from Sequence, Save and browser mechanics while Player behaviour remains unchanged.

**Blocked by:** 08 — Own the remaining Sequence flow; 09 — Own Save validation and exact restore; 10 — Own contextual and Inventory HUD.

**Status:** ready-for-agent

- [ ] HUD owns presentation models and interaction intentions for Line, Narration, Choice, command responses, options, help and Save/Load overlays.
- [ ] Sequence supplies narrative and choice facts without containing DOM timing, focus or styling decisions.
- [ ] Save supplies compatible and incompatible slot facts without owning localStorage or modal rendering.
- [ ] HUD owns text-speed, speech visibility, speech colour, layout intent and modal-state policy; browser storage of preferences remains an adapter concern.
- [ ] Browser code creates accessible DOM, manages audio playback and forwards timers or user actions through declared interfaces.
- [ ] Choice numbering, keyboard navigation, focus restoration, Line advancement, Sequence skipping and modal blocking retain current behaviour.
- [ ] Speech and Narration positioning use Camera and World presentation facts rather than private renderer calculations.
- [ ] Existing visual presentation and Capri 1535 acceptance behaviour remain unchanged.
- [ ] HUD and browser tests cover all activities, modal transitions, preferences, audio, focus and incompatible Save Slot presentation.
- [ ] Standard build, documentation and browser verification pass.
