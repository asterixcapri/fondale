# Send Narrative Context with every provider request

Each Game Project declares one Narrative Context, and the browser sends it with
every Dialogue Provider operation. The separately run Dialogue Server therefore
has no project-specific fictional setting in its deployment configuration and
can serve every Character and Game Session across different Game Projects
without loading their files; explicit language configuration remains outside
the current Support Baseline.
