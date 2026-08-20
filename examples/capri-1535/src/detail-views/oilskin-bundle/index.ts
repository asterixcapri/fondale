import { type DetailViewDefinition, type NounDefinition } from "fondale";

import { rectangle } from "../../geometry";
import closeUpUrl from "./close-up.png";
import closingUrl from "./closing.png";

/**
 * The opened bundle, seen close while Michele kneels over it.
 *
 * The prologue's discovery is two objects read separately and in either order:
 * the broken seal names his father's ship, the registry fragment dates her
 * eight months after the wreck. Neither reading carries the contradiction; the
 * Sequences commit it once the second one lands.
 */
export const openedBundle = ({
  image: closeUpUrl,
  hotspots: [{
    area: rectangle(325, 255, 560, 450),
    noun: ({
      labels: [{ text: "Sigillo spezzato" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        when: { variable: "sealRead", equals: false },
        sequence: "readBrokenSeal",
      }, {
        verb: "look-at",
        response: { text: "La ceralacca resta spezzata in due, e l'impronta resta quella." },
      }],
    } satisfies NounDefinition),
  }, {
    area: rectangle(595, 150, 910, 540),
    noun: ({
      labels: [{ text: "Frammento di registro" }],
      preferredVerbs: [{ verb: "look-at" }],
      cases: [{
        verb: "look-at",
        when: { variable: "registryRead", equals: false },
        sequence: "readRegistryFragment",
      }, {
        verb: "look-at",
        response: { text: "La riga e la data non cambiano per quanto le rilegga." },
      }],
    } satisfies NounDefinition),
  }],
} satisfies DetailViewDefinition);

/** The last image of the prologue: the same find, with the dusk gone out of it. */
export const prologueEnding = ({
  image: closingUrl,
} satisfies DetailViewDefinition);
