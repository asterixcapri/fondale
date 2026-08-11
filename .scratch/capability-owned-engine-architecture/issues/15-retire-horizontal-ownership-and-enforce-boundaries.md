# 15 — Retire horizontal ownership and enforce boundaries

**What to build:** Finish the architectural contraction by assigning every remaining implementation to a capability or browser adapter and automatically preventing future dependencies on another module’s private details.

**Blocked by:** 12 — Compose Game Project and Authoring Diagnostic; 13 — Reduce CoreSession to the Game Session coordinator; 14 — Contract the browser into technical adapters.

**Status:** ready-for-agent

- [ ] Every production source has an explicit owner among Game Project, Game Session, World, Interaction, Sequence, Animation, Camera, HUD, Save or browser adapters.
- [ ] Historical horizontal public and internal ownership containers are removed after their final contents have moved or been deleted as duplicates.
- [ ] Each capability exposes one declared internal interface and keeps implementation details private to itself.
- [ ] An automated structural check rejects imports into another capability’s private implementation.
- [ ] The structural check rejects new domain policy placed in historical horizontal categories.
- [ ] No generic shared module contains domain policy or bypasses an owning capability.
- [ ] The package retains one public root entry point while its exports are composed from capability-owned contracts.
- [ ] Tests are colocated with capability policy where appropriate; package, CoreSession and browser acceptance tests remain at their stable seams.
- [ ] No public contract exists solely to make an internal test convenient.
- [ ] Type checking, structural checks, documentation verification, browser tests and Capri 1535 acceptance all pass with no duplicate interpretation path remaining.
