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

ADR-0017 supersedes the assumption above that play reaches one path at a time
through an authored handoff: authored alternatives and free-form input are now
presented together for a Conversation's whole duration. What stands here is the
division of authority — authored conditions and Engine decisions govern Game
State, and generated speech decides nothing.
