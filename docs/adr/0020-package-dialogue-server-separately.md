# Package the Dialogue Provider server separately

Fondale keeps the Node.js Dialogue Provider server in the same repository but
publishes it as `@asterixcapri/fondale-dialogue-server`, separate from the
browser-first `@asterixcapri/fondale` package. This keeps Mastra, PostgreSQL and
HTTP-server dependencies out of browser-only installations while the shared
Dialogue Provider contract continues to define the seam between the two
packages. An ordinary browser Game Project declares only the separately run
Dialogue Server URL; Fondale owns the HTTP adapter and transient Game Session
identity, while low-level Provider injection remains available to tests and
advanced hosts. The browser Engine sends only the authorised material for each
Dialogue Turn, so the Dialogue Server never loads a Game Project or game files.
