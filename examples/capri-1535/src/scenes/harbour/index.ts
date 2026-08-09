import { defineScene } from "@asterixcapri/fondale";

import harbourBackgroundUrl from "./background.png";
import { rectangle } from "../../geometry";

export const harbour = defineScene({
  background: harbourBackgroundUrl,
  walkableRegion: rectangle(20, 145, 406, 239),
  entrances: { fromAlley: { groundPoint: { x: 215, y: 185 }, facing: "front" } },
});
