# Keep authored and Knowledge-Driven Dialogue complementary

Fondale uses Knowledge-Driven Dialogue for exploratory free-form conversation
and retains Sequence, Line, and Choice for scenes that require exact authored
language, branching, timing, or choreography. Both paths share canonical
Narrative Facts and change Game State only through Game Operations; authored
conditions, never generated speech or a Dialogue Provider, decide when play
moves between them, avoiding both rigid dialogue trees for investigation and
loss of authorial control over directed scenes.

A Conversation is the dominant Game Activity while the Player conducts
Knowledge-Driven Dialogue. An authored condition may hand control to a
Sequence, and the Engine explicitly decides whether the Conversation resumes
or closes afterward; generated speech cannot initiate that handoff.
