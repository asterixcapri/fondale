# 01 — Send Narrative Context with Dialogue Turns

**What to build:** Let an Author declare one Narrative Context for a Game
Project that uses Knowledge-Driven Dialogue, and carry it through the ordinary
Dialogue Provider connection so interpretation, verbalisation and Reflection
all phrase authorised material within that fictional setting. Remove the
deployment-wide language and setting requirements so one running Dialogue
Server can answer for different games.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] A Game Project using Knowledge-Driven Dialogue declares a non-empty Narrative Context and receives an Authoring Diagnostic when it is absent or empty.
- [ ] A Game Project that does not require a Dialogue Provider is not forced to declare irrelevant dialogue configuration.
- [ ] Interpretation, verbalisation and Reflection receive the compiled Game Project's Narrative Context through the public Dialogue Provider contract.
- [ ] The HTTP adapter carries Narrative Context for all three provider phases without requiring an Author to repeat it at call sites.
- [ ] The live Dialogue Model uses Narrative Context only to guide phrasing and does not treat it as a Narrative Fact or other narrative authority.
- [ ] The server no longer reads, requires or documents deployment-wide dialogue language or fictional-setting variables.
- [ ] No replacement language, locale or Player Preference is introduced.
- [ ] Two requests carrying different Narrative Contexts produce model instructions for their respective fictional settings through the same live model instance.
- [ ] Existing Voice, Personality, Biography, Dialogue State, Character Knowledge and Disclosure behavior remains unchanged.
- [ ] Public authoring and server documentation explain Narrative Context and the absence of explicit language support.
- [ ] Standard build, unit verification and browser verification pass without PostgreSQL or a live model.
