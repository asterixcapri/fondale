# Select authored Character artwork by Facing

Fondale requires every Character Animation to provide synchronized left, right,
front, and back presentations, and the renderer selects the presentation that
matches the Character's Facing without mirroring or otherwise transforming
another one. This deliberately increases authoring cost so asymmetry, action,
lighting, and Visual Anchors remain under Author control; the alpha-phase
`side` interface is removed without backward compatibility.
