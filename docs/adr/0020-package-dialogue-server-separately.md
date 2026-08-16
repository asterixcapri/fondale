# Package the Dialogue Provider server separately

Fondale keeps the Node.js Dialogue Provider server in the same repository but
publishes it as `@asterixcapri/fondale-dialogue-server`, separate from the
browser-first `@asterixcapri/fondale` package. This keeps Mastra, PostgreSQL and
HTTP-server dependencies out of browser-only installations while the shared
Dialogue Provider contract continues to define the seam between the two
packages.
