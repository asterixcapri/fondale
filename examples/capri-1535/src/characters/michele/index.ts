import { type CharacterDefinition, uniformGrid } from "@asterixcapri/fondale";

import idleBackUrl from "./v3-workwear-idle-back.png";
import idleFrontUrl from "./v3-workwear-idle-front.png";
import idleLeftUrl from "./v3-workwear-idle-left.png";
import idleRightUrl from "./v3-workwear-idle-right.png";
import speakingBackUrl from "./v3-workwear-speaking-back.png";
import speakingFrontUrl from "./v3-workwear-speaking-front.png";
import speakingLeftUrl from "./v3-workwear-speaking-left.png";
import speakingRightUrl from "./v3-workwear-speaking-right.png";
import walkingBackUrl from "./v3-workwear-walking-back.png";
import walkingFrontUrl from "./v3-workwear-walking-front.png";
import walkingLeftUrl from "./v3-workwear-walking-left.png";
import walkingRightUrl from "./v3-workwear-walking-right.png";

const frames = uniformGrid({
  frameWidth: 256,
  frameHeight: 256,
  columns: 16,
  count: 16,
});

export const michele = ({
  initialScene: "harbour",
  initialGroundPoint: { x: 330, y: 625 },
  initialFacing: "right",
  initialAppearance: "workwear",
  appearances: {
    workwear: {
      animations: {
        idle: { sheets: { left: { image: idleLeftUrl, frames }, right: { image: idleRightUrl, frames }, front: { image: idleFrontUrl, frames }, back: { image: idleBackUrl, frames } }, timing: { framesPerSecond: 8, loop: true } },
        walking: { sheets: { left: { image: walkingLeftUrl, frames }, right: { image: walkingRightUrl, frames }, front: { image: walkingFrontUrl, frames }, back: { image: walkingBackUrl, frames } }, timing: { framesPerSecond: 16, loop: true } },
        speaking: { sheets: { left: { image: speakingLeftUrl, frames }, right: { image: speakingRightUrl, frames }, front: { image: speakingFrontUrl, frames }, back: { image: speakingBackUrl, frames } }, timing: { framesPerSecond: 8, loop: true } },
      },
      roles: { default: "idle", walking: "walking", speaking: "speaking" },
      visualAnchor: { x: 128, y: 252 },
    },
  },
  movementSpeed: 80,
  dialogue: {
    biography:
      "Michele è un giovane caprese che conosce sentieri, cale e approdi dell'isola. Vive di "
      + "commissioni e lavori a giornata per pescatori, mercanti e frati, risparmiando per comprare "
      + "una barca propria. È pratico, curioso e abbastanza ambizioso da seguire un'occasione prima "
      + "di comprenderne il pericolo.",
    personality: {
      talkativeness: "medium",
      honesty: "medium",
      discretion: "medium",
      suspiciousness: "medium",
    },
    voice: { verbosity: "short", tone: "dry", vocabulary: "ordinary" },
    knowledge: [{
      factId: "michele-arrived-in-capri",
      disclosure: { level: "open" },
    }],
  },
} satisfies CharacterDefinition);
