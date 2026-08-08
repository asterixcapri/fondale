# Approdo dei pescatori di Marina Grande

Seconda prova selezionata dall'utente l'8 agosto 2026. Generata con lo strumento
`imagegen` integrato e poi processata a 426x240 con
`tools/process_background.py`.

## Riferimenti

- `marina-grande.png`: palette, atmosfera mediterranea e trattamento pittorico;
- `vicolo-capri.png`: leggibilità a bassa risoluzione e densità del dettaglio.

I riferimenti erano indicati come guida stilistica, non come immagini da
modificare o composizioni da copiare.

## Prompt

```text
Use case: historical-scene
Asset type: second composition trial for a playable 2D point-and-click game environment background
Input images: Image 1 and Image 2 are style references only for palette, painterly VGA treatment, low-resolution readability, and Mediterranean atmosphere. Do not copy their composition or edit them.
Primary request: Create a different original composition for a small fishermen's landing adjoining Marina Grande on Capri in 1535. Make it an intimate, theatrical playable room, not a panoramic vista and not a variation of the exact reference layouts.
Scene/backdrop: a sheltered working cove enclosed by warm limestone walls and simple limewashed buildings; a narrow strip of deep blue sea remains visible; weathered wooden fishing gear, ropes, nets, barrels and terracotta; golden hour.
Style/medium: hand-painted early-1990s VGA adventure-game background with original treatment; simplified readable shapes, airbrushed gradients, subtle clustered painterly dithering, warm limestone, white plaster, deep cobalt sea, violet shadows and golden Mediterranean light; designed to remain legible after reduction to 426x240; not photorealistic.
Composition/framing: fixed wide 16:9 camera, three-quarter view, slightly elevated, no lens distortion. A broad continuous walkable stone-and-pebble plane enters from the lower right, narrows strongly with depth, and climbs toward a short stone stairway and dark arched passage in the upper left. Keep clear standing space along the entire route. Place a low storehouse with a closed door in the middle distance and a clay water jar beside it as distinct possible hotspots. Frame the lower-left foreground with the stern and rigging of a wooden fishing boat, and frame the right foreground with a hanging net on a timber rack; both must be clean occluding silhouettes a character can pass behind. Three unmistakable depth planes and stronger perspective scaling than the references.
Historical constraints: plausible local Capri working landing in 1535; weathered wood and Latin-sail equipment. No modern harbor, concrete quay, engines, electric lighting, asphalt, plastic, tourist furniture, yachts, hotel architecture, fantasy, or Caribbean pirate styling.
Output intent: opaque high-resolution landscape PNG, preferably 2048x1152. No people, animals, characters, text, signs, logos, interface, cursor, decorative border, depth-of-field blur, watermark, or frame. No clutter blocking the walkable floor.
```

## Risultato

- sorgente generato: 1672x941 RGB;
- asset di gioco: 426x240 RGB, 64 colori;
- percorso principale: bordo inferiore verso scala e arco in alto a sinistra;
- hotspot candidati: porta del magazzino, giara, scala/arco;
- occlusioni candidate: barca a sinistra, rete a destra.
