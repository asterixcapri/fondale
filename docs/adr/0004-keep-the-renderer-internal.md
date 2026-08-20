# Keep the renderer internal to the Engine

Fondale may go on using PixiJS for rendering, but Game Projects do not
manipulate its objects directly. Exposing only Fondale's own concepts keeps
authoring coherent, makes the public contract testable, and allows the renderer
to be replaced or upgraded without rewriting games.
