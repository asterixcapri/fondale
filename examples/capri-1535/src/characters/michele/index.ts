import { type CharacterDefinition, uniformGrid } from "fondale";

import idleBackUrl from "./runtime-workwear-idle-back.png";
import idleFrontUrl from "./runtime-workwear-idle-front.png";
import idleLeftUrl from "./runtime-workwear-idle-left.png";
import idleRightUrl from "./runtime-workwear-idle-right.png";
import mechanismUseBackUrl from "./runtime-workwear-mechanism-use-back.png";
import mechanismUseFrontUrl from "./runtime-workwear-mechanism-use-front.png";
import mechanismUseLeftUrl from "./runtime-workwear-mechanism-use-left.png";
import mechanismUseRightUrl from "./runtime-workwear-mechanism-use-right.png";
import pickUpBackUrl from "./runtime-workwear-pick-up-back.png";
import pickUpFrontUrl from "./runtime-workwear-pick-up-front.png";
import pickUpLeftUrl from "./runtime-workwear-pick-up-left.png";
import pickUpRightUrl from "./runtime-workwear-pick-up-right.png";
import speakingBackUrl from "./runtime-workwear-speaking-back.png";
import speakingFrontUrl from "./runtime-workwear-speaking-front.png";
import speakingLeftUrl from "./runtime-workwear-speaking-left.png";
import speakingRightUrl from "./runtime-workwear-speaking-right.png";
import walkingBackUrl from "./runtime-workwear-walking-back.png";
import walkingFrontUrl from "./runtime-workwear-walking-front.png";
import walkingLeftUrl from "./runtime-workwear-walking-left.png";
import walkingRightUrl from "./runtime-workwear-walking-right.png";

const frames = uniformGrid({
  frameWidth: 256,
  frameHeight: 292,
  columns: 16,
  count: 16,
});

const pickUpFrames = uniformGrid({
  frameWidth: 256,
  frameHeight: 292,
  columns: 25,
  count: 25,
});

const mechanismUseFrames = uniformGrid({
  frameWidth: 256,
  frameHeight: 292,
  columns: 8,
  count: 8,
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
        "mechanism-use": {
          sheets: {
            left: { image: mechanismUseLeftUrl, frames: mechanismUseFrames },
            right: { image: mechanismUseRightUrl, frames: mechanismUseFrames },
            front: { image: mechanismUseFrontUrl, frames: mechanismUseFrames },
            back: { image: mechanismUseBackUrl, frames: mechanismUseFrames },
          },
          timing: { framesPerSecond: 8, cues: { contact: 0.5 } },
        },
        "pick-up": {
          sheets: {
            left: { image: pickUpLeftUrl, frames: pickUpFrames },
            right: { image: pickUpRightUrl, frames: pickUpFrames },
            front: { image: pickUpFrontUrl, frames: pickUpFrames },
            back: { image: pickUpBackUrl, frames: pickUpFrames },
          },
          timing: { framesPerSecond: 25, cues: { contact: 0.48 } },
        },
      },
      roles: { default: "idle", walking: "walking", speaking: "speaking" },
      visualAnchor: { x: 128, y: 288 },
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
