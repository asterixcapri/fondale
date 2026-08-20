# Declarative authoring with scripted behaviors

A Fondale project describes rooms, actors, hotspots, dialogue and inventory as
validatable data, and uses TypeScript functions only for the specific behaviors
data does not express well. We rejected both inheritance from the Engine's
internal classes, which would couple every game to the implementation, and
visual editors and no-code authoring, which do not belong to the product's
direction: Fondale's Author is a TypeScript developer, and the declarative
format remains their interface in future versions too.
