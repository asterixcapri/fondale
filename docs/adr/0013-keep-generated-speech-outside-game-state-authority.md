# Keep generated speech outside Game State authority

Knowledge-Driven Dialogue decides and stages each authorised Narrative Fact to
be learned by a Character before a Dialogue Provider verbalises the outcome.
Only an accepted Dialogue Turn atomically commits its generated speech and
Engine-decided Game Operations; the Engine never infers canonical knowledge or
other Game State changes back from that text. This preserves Fondale's state
authority while preventing model output from silently becoming narrative
truth or a failed provider call from partially advancing play.

Character Knowledge, Testimony, Relationship changes, and other narrative
effects belong to Game State. Provider-owned transcripts, summaries, and
context-window memory do not: they preserve conversational continuity without
becoming canonical playthrough state or being duplicated in Save Snapshots.
Loading a Save Snapshot resets every provider-owned Conversation instead of
attempting to rewind or restore that non-canonical memory.

An Author may declare the Game Variable that learning a Narrative Fact sets.
This extends the boundary rather than breaching it: the Engine, not generated
wording, decides the learning and commits the variable with it, after
Disclosure has authorised the Fact and before verbalisation. What changes is
only that an Engine decision may now carry a Game Variable, so knowledge
acquired in free-form dialogue can reach the Interaction Conditions that read
Game Variables and Inventory but never Character Knowledge.
