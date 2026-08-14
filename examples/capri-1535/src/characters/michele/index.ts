import { type CharacterDefinition, uniformGrid } from "@asterixcapri/fondale";

import idleBackUrl from "./workwear-idle-back.png";
import idleFrontUrl from "./workwear-idle-front.png";
import idleLeftUrl from "./workwear-idle-left.png";
import idleRightUrl from "./workwear-idle-right.png";
import pickUpBackUrl from "./workwear-pick-up-back.png";
import pickUpFrontUrl from "./workwear-pick-up-front.png";
import pickUpLeftUrl from "./workwear-pick-up-left.png";
import pickUpRightUrl from "./workwear-pick-up-right.png";
import resolveBackUrl from "./workwear-resolve-back.png";
import resolveFrontUrl from "./workwear-resolve-front.png";
import resolveLeftUrl from "./workwear-resolve-left.png";
import resolveRightUrl from "./workwear-resolve-right.png";
import speakingBackUrl from "./workwear-speaking-back.png";
import speakingFrontUrl from "./workwear-speaking-front.png";
import speakingLeftUrl from "./workwear-speaking-left.png";
import speakingRightUrl from "./workwear-speaking-right.png";
import useWinchBackUrl from "./workwear-use-winch-back.png";
import useWinchFrontUrl from "./workwear-use-winch-front.png";
import useWinchLeftUrl from "./workwear-use-winch-left.png";
import useWinchRightUrl from "./workwear-use-winch-right.png";
import walkingBackUrl from "./workwear-walking-back.png";
import walkingFrontUrl from "./workwear-walking-front.png";
import walkingLeftUrl from "./workwear-walking-left.png";
import walkingRightUrl from "./workwear-walking-right.png";

export const michele = ({
  initialScene: "harbour",
  initialGroundPoint: { x: 330, y: 625 },
  initialFacing: "right",
  initialAppearance: "workwear",
  appearances: {
    workwear: {
      animations: {
        idle: { sheets: { left: { image: idleLeftUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 6, count: 6 }) }, right: { image: idleRightUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 6, count: 6 }) }, front: { image: idleFrontUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 6, count: 6 }) }, back: { image: idleBackUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 6, count: 6 }) } }, timing: { framesPerSecond: 4, loop: true } },
        walking: { sheets: { left: { image: walkingLeftUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) }, right: { image: walkingRightUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) }, front: { image: walkingFrontUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) }, back: { image: walkingBackUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) } }, timing: { framesPerSecond: 10, loop: true } },
        speaking: { sheets: { left: { image: speakingLeftUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) }, right: { image: speakingRightUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) }, front: { image: speakingFrontUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) }, back: { image: speakingBackUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) } }, timing: { framesPerSecond: 8, loop: true } },
        resolve: { sheets: { left: { image: resolveLeftUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 6, count: 6 }) }, right: { image: resolveRightUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 6, count: 6 }) }, front: { image: resolveFrontUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 6, count: 6 }) }, back: { image: resolveBackUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 6, count: 6 }) } }, timing: { framesPerSecond: 8 } },
        "use-winch": { sheets: { left: { image: useWinchLeftUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) }, right: { image: useWinchRightUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) }, front: { image: useWinchFrontUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) }, back: { image: useWinchBackUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) } }, timing: { framesPerSecond: 10, cues: { contact: 0.3 } } },
        "pick-up": { sheets: { left: { image: pickUpLeftUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) }, right: { image: pickUpRightUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) }, front: { image: pickUpFrontUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) }, back: { image: pickUpBackUrl, frames: uniformGrid({ frameWidth: 192, frameHeight: 288, columns: 8, count: 8 }) } }, timing: { framesPerSecond: 10, cues: { contact: 0.3 } } },
      },
      roles: { default: "idle", walking: "walking", speaking: "speaking" },
      visualAnchor: { x: 96, y: 288 },
    },
  },
  movementSpeed: 150,
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
