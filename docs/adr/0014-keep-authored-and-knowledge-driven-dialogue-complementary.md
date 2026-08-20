# Keep authored and Knowledge-Driven Dialogue complementary

Fondale uses Knowledge-Driven Dialogue for exploratory free-form conversation
and retains Sequence, Line, and Choice for scenes that require exact authored
language, branching, timing, or choreography. Neither replaces the other:
without the first, investigation collapses into rigid dialogue trees; without
the second, directed scenes lose authorial control over wording and timing.

Both paths share canonical Narrative Facts and change Game State only through
Game Operations. A Conversation is the dominant Game Activity while the Player
conducts Knowledge-Driven Dialogue, and an authored condition may hand control
to a Sequence, after which the Engine explicitly decides whether the
Conversation resumes or closes. Generated speech decides none of this.

How the two paths are presented is settled by ADR-0017: authored alternatives
and free-form input are offered together for a Conversation's whole duration,
rather than reached one at a time.
