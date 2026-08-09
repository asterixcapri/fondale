# Art masters

This directory contains only source masters and their generation notes. It is
organized by the Game Definition that owns the artwork:

- `scenes/<scene>/` for Background and Scenery masters;
- `characters/<character>/` for Character masters;
- `objects/<object>/` for Object masters.

The game never imports from this directory. Every processed PNG loaded at
runtime lives beside its owning module under `src/`. Generated variants,
previews, and other reproducible intermediates are not committed here.
