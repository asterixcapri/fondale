# 08 — Entry point, prerequisites, and retiring what the pipeline replaces

**What to build:** what a stranger reads first. Someone who has installed
Fondale and wants to build a game should find, in one place, the order of the
pipeline, the exact command for each step, what each step leaves behind, and what
must be installed for any of it to work — `grilling`, `to-tickets`, `implement`,
and ImageMagick. It should also say honestly how long a short adventure takes, so
that nobody abandons the process at the third ticket expecting a demo in an
afternoon.

And it removes what the pipeline supersedes. `define-dialogue` goes: dialogue in
Fondale is declarative data with a documented contract and a complete worked
example, so an agent authors it from the guide like a Sequence or a Command Case.
The shared visual direction document stops being a contract cited by skills and
becomes what it always was, a record of Capri 1535's own choices.

**Blocked by:** 03, 07

**Status:** ready-for-agent

- [ ] A newcomer can follow the pipeline end to end from this document alone
- [ ] Every prerequisite is named, including the ones outside npm
- [ ] The realistic effort of building a short adventure is stated
- [ ] `define-dialogue` is removed and the pipeline documents where dialogue is authored instead
- [ ] No installed skill references any file outside its own directory
- [ ] The Capri 1535 visual direction document survives as an example, cited by nothing that ships
