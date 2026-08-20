# 02 — `define-story`

**What to build:** the skill an author invokes first, in an empty repository, when
all they have is an idea. It interviews them and leaves a written story document
naming every place and how places connect, every Character, every Object, and
every Narrative Fact — with the names that will later become Game Project
registry keys, so nothing has to be renamed afterwards.

The document is written for the next skill to extract values from and for a human
to read: stable keys and lists, not prose.

This ticket also establishes the header contract every other skill in the
pipeline reuses: which documents the skill consumes, which it produces, what it
does when an input is missing, and the exact command to type next.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Invoking the skill in a repository with no documents conducts an interview and leaves the story document
- [ ] Every place, Character, Object and Narrative Fact carries a name usable as a registry key
- [ ] The document states which documents it derives from
- [ ] The skill contains no reference to any particular game's setting or style
- [ ] The skill ends by naming the next command to run
- [ ] The skill runs `grilling` for the interview rather than improvising its own
