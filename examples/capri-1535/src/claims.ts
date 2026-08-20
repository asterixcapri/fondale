import { type ClaimDefinition } from "fondale";

export const claims = ({
  "friars-stole-the-handle": {
    proposition:
      "I frati hanno rubato la manovella dell'argano e l'hanno portata al pozzo del chiostro.",
  },
} satisfies Readonly<Record<string, ClaimDefinition>>);
