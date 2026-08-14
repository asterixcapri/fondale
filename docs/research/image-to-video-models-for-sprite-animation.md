# Image-to-video models for sprite animation

Research date: 14 August 2026  
Question: which currently available image-to-video model is the best fit for
generating Michele v3's four eye-level walking animations from prepared images,
through an API callable by a coding agent?

## Result in brief

There is no defensible universal “best” model in first-party documentation:
vendors publish capabilities and their own quality claims, not a shared,
independently controlled benchmark for illustrated sprite animation. For this
specific task, the best first test is **Luma Ray 3.2**, because it is the only
candidate found that exposes a documented **seamless-loop switch**, accepts
start/end frames, and can alternatively pin up to 64 guide images to arbitrary
frames. It is directly callable through Luma's public REST API and costs $0.30
for a five-second 720p generation. Luma describes the API as public and
versioned, although its video prices remain subject to change before general
availability
([models](https://docs.agents.lumalabs.ai/guides/model/),
[pricing](https://docs.agents.lumalabs.ai/guides/pricing/),
[versioning](https://docs.agents.lumalabs.ai/guides/faq/)).

The recommended first experiment is therefore:

- `model: "ray-3.2"`, `type: "video"`;
- the already prepared right-facing image as `video.start_frame`;
- `video.loop: true`, 5 seconds, 720p and `1:1`;
- a locked-camera, elevation-zero, walking-in-place prompt;
- no intermediate pose constraints on the first attempt, because Ray 3.2 makes
  `video.loop` mutually exclusive with its multi-keyframe mode.

This does not guarantee a usable animation. “Seamless” constrains the video
boundary, not gait quality, foot contact, stable scale or constant screen
position. The result still needs frame-by-frame inspection before extraction.

If Ray 3.2 fails, the second test should be **Veo 3.1 Fast** with the same
prepared image supplied as both first and last frame. This creates a hard
endpoint constraint but is only an inferred looping technique: Google calls it
first/last-frame interpolation, not seamless looping
([Veo guide](https://ai.google.dev/gemini-api/docs/veo)).

## Comparison

| Model and access | Identity and visual control | Endpoint, reference and loop controls | Output | Status and documented cost | Fit for Michele |
|---|---|---|---|---|---|
| **Luma Ray 3.2**, direct Luma Agents REST API | Start/end anchors; up to 64 images pinned to arbitrary output frames; video editing also exposes face, pose, depth and surface-normal conditioning | Native `video.loop`; start and end frames; multi-keyframes are available but mutually exclusive with `loop` | 5 or 10 s; 360p draft, 540p, 720p, 1080p; six ratios including `1:1`; MP4 | Public model on versioned API; pricing noted as pre-GA/changeable. 5 s SDR: $0.06 at 360p, $0.15 at 540p, $0.30 at 720p, $1.20 at 1080p | **Best task-specific first choice**: the only documented native loop and cheapest controlled 720p test |
| **Google Veo 3.1 Fast**, direct Gemini API or Runway API | Supports an initial-image workflow and, separately, up to three subject/style reference images; Standard is the higher-cost fallback if Fast loses detail | Explicit `lastFrame`; no native loop claim. Reusing the prepared pose at both ends is an interpolation strategy, not a guarantee of a clean gait cycle | 4, 6 or 8 s; 720p, 1080p, 4K; 16:9 or 9:16; 24 fps; Google generates audio | Preview, paid tier. Direct Google: $0.10/s at 720p, $0.12/s at 1080p, $0.30/s at 4K. Runway exposes a no-audio route at $0.10/s | **Best second test** when exact endpoint equality matters; less convenient framing because there is no square output |
| **Google Veo 3.1**, direct Gemini API or Runway API | Same controls as Fast; use only if Fast's identity or detail is insufficient | First and last frames, up to three references; no documented seamless-loop flag | Same durations, ratios and resolutions as Fast | Preview. Direct Google: $0.40/s at 720p or 1080p and $0.60/s at 4K; Runway no-audio: $0.20/s | Quality escalation after Fast, not the economical first probe |
| **Gemini Omni Flash**, direct Gemini Interactions API or Runway API | Google recommends it as the default video model and claims superior coherence and character consistency; it accepts multiple subject images and supports conversational refinement of generated videos | Image-to-video and reference-to-video, but only a first frame in Runway's current schema; no last-frame interpolation, extension or loop control | 16:9 or 9:16; Runway documents 720p and 3–10 s | `gemini-omni-flash-preview`, paid preview. About $0.10/output second; Runway adds one credit ($0.01) for the first image | Strong identity/coherence fallback, but weaker than Ray/Veo for a closed cycle |
| **Runway Gen-4.5**, Runway REST API | Runway's current high-quality first-party model; one initial image, with additional input types still described as coming later | First frame only; no documented last frame or loop | 2–10 s; 720p; 24/25 fps; six ratios including `1:1` | Current API model; 12 credits/s = $0.12/s | Credible motion-quality comparison, but cannot force a cycle boundary |
| **Runway Gen-4 Turbo**, Runway REST API | Economical image-to-video from one first frame | First frame only; no documented last frame or loop | 2–10 s; 720p-class fixed dimensions, including square | Current API model; 5 credits/s = $0.05/s | Useful for cheap prompt scouting, not final loop control |
| **Kling Video 3.0**, direct Kling Open Platform | Kling documents Element binding from multiple images/video to lock a subject, plus enhanced character consistency | Start and end frames are supported; no documented seamless-loop control | Flexible 3–15 s; the official model guide prices 720p and 1080p modes | Current Video 3.0/Open Platform offering. Official guide gives credits rather than USD: no-audio costs 6 credits/s at 720p or 8 credits/s at 1080p | Promising for identity, but the API documentation is less transparent and its loop controls are weaker than Ray 3.2's |
| **Seedance 2 / 2 Fast**, through Runway's official REST API | Keyframe mode accepts first/last images; reference-image mode accepts unpositioned images. The two modes cannot be mixed | First/last or references; no native loop flag | 4–15 s; many ratios including square; 480p/720p on Fast, up to 4K on Standard | Current Runway endpoints. Standard: $0.36/s at 480p/720p, $0.40/s at 1080p, $1.50/s at 4K; Fast: $0.29/s at 480p/720p | More controllable than the older Seedance 1.5 trial, but relatively expensive and still lacks a native loop |
| **OpenAI Sora 2 / Pro** | Accepted a reference image, but this is no longer a viable new workflow | One reference asset; the old API did not expose the controls that distinguish Ray 3.2 for this task | Legacy API offered 4, 8 or 12 s and portrait/landscape resolutions | Deprecated. Sora web/app ended 26 April 2026 and the API is scheduled to end 24 September 2026 | **Exclude**: unavailable to this account and unsuitable for a new integration |

## Evidence by provider

### Luma Ray 3.2

The current Luma Agents API lists `ray-3.2` as its public video model. It
supports image-to-video with `video.start_frame` and `video.end_frame`, up to 64
arbitrarily positioned guide frames, and `video.loop` for video creation. The
multi-keyframe surface is mutually exclusive with start/end frames and loop
([model capabilities](https://docs.agents.lumalabs.ai/guides/model/),
[API schema](https://docs.agents.lumalabs.ai/api/resources/generations)). The
API has official Python, TypeScript, Go and CLI SDKs, uses an asynchronous
submit/poll/download flow, and reports an API version with a documented
deprecation window for breaking changes
([quickstart](https://docs.agents.lumalabs.ai/),
[FAQ](https://docs.agents.lumalabs.ai/guides/faq/)).

Ray 3.2 has two useful but distinct paths:

1. **Prepared image + native loop**, the smallest experiment matching the
   user's current input.
2. **Authored gait poses + multi-keyframes**, if a single image still produces
   poor footwork. This gives much stronger temporal control but requires us to
   prepare the poses and cannot use the native loop flag in the same request.

The second path is important because it offers a principled escalation without
moving to 3D: we can author contact and passing poses as images and tell the
model exactly where they belong in the clip.

### Google Gemini Omni Flash and Veo 3.1

Google explicitly recommends Gemini Omni Flash as its default video model for
coherence, character consistency, multimodal reasoning and conversational
editing. The same overview recommends Veo 3.1 when last-frame control or
extension is needed
([Google video overview](https://ai.google.dev/gemini-api/docs/video)). Omni's
direct model ID is `gemini-omni-flash-preview`; it accepts image plus text for
image-to-video, multiple subject images for reference-to-video, and follow-up
edits to a generated video
([Omni guide](https://ai.google.dev/gemini-api/docs/omni)). Its preview status
and lack of endpoint control make it less suitable for the first walking-loop
test even though Google presents it as the best general default.

Veo 3.1 and Veo 3.1 Fast accept an initial image, a final frame and up to three
reference images. The direct Gemini model IDs are
`veo-3.1-generate-preview` and `veo-3.1-fast-generate-preview`. Both are preview
models. A reference-image request is eight seconds; normal generation supports
four, six or eight seconds. Google documents 720p, 1080p and 4K, with 1080p/4K
restricted to eight-second output
([Veo guide](https://ai.google.dev/gemini-api/docs/veo),
[Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing)).

### Runway

Runway's current `POST /v1/image_to_video` API exposes its own `gen4.5` and
`gen4_turbo` models as well as Veo, Seedance and Gemini Omni Flash through one
authenticated surface
([API reference](https://docs.dev.runwayml.com/api/),
[model catalogue](https://docs.dev.runwayml.com/guides/models/)). This is a
practical integration advantage for comparative tests: the coding agent can
switch models without maintaining several SDKs. Runway also supports returning
a PNG frame sequence directly for Gen-4.5, though non-MP4 output adds five
credits per output second; for a small trial, MP4 plus local extraction remains
cheaper
([API reference](https://docs.dev.runwayml.com/api/)).

Runway credits cost $0.01 each. Its official pricing page documents the rates
used in the comparison table
([Runway API pricing](https://docs.dev.runwayml.com/guides/pricing/)).

### Kling Video 3.0

Kling's official Video 3.0 guide documents image-to-video, start/end-frame
generation, 3–15 second output, and Element references intended to hold a
character or object stable across motion. It also documents 720p/1080p credit
rates
([Video 3.0 guide](https://home.kling.ai/quickstart/klingai-video-3-model-user-guide)).
The current Open Platform publishes dedicated Image-to-Video endpoints
([Kling API](https://kling.ai/document-api/apiReference/model/imageToVideo)).
These features make Kling a credible identity test, but no official seamless
loop parameter was found.

### Seedance 2

Runway added Seedance 2 in May 2026 and documents image-to-video,
text-to-video and video-to-video, 4–15 second output, keyframes, reference
images/video and generated audio
([Runway changelog](https://docs.dev.runwayml.com/api-details/api_changelog/)).
Its current image-to-video schema distinguishes two incompatible modes:
positioned `first`/`last` images for keyframe interpolation, or unpositioned
reference images. Standard supports output through 4K; Fast is limited to
480p/720p
([API reference](https://docs.dev.runwayml.com/api/)). For a silent, small
character sprite, the audio and high-resolution strengths do not compensate
for its substantially higher price compared with Ray 3.2.

### OpenAI Sora

OpenAI now marks Sora 2 as Legacy/Deprecated
([model page](https://developers.openai.com/api/docs/models/sora-2)). The Sora
web and app experiences ended on 26 April 2026, and OpenAI says the API will be
discontinued on 24 September 2026
([discontinuation notice](https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation)).
It should not be selected for a new coding-agent workflow even if an older API
project still has temporary access.

## Recommended test order

1. **Ray 3.2, 720p, 5 s, square, native loop**, from the prepared right-facing
   image. This is the highest-information single test for the current problem.
2. If the loop closes but the gait is wrong, remain on **Ray 3.2** and prepare
   contact/passing pose images for multi-keyframe generation.
3. If Ray changes Michele's identity, test **Veo 3.1 Fast** with identical
   first and last images, then **Veo 3.1 Standard** only if Fast loses detail.
4. Test **Gemini Omni Flash** only as the identity/coherence branch; accept that
   the loop will need selection or repair after generation.
5. Use Runway's unified API for Gen-4.5 or Seedance comparisons only if the
   first three paths fail. Do not build a Sora integration.

The recommendation is deliberately based on controllability and documented API
surface rather than vendor superlatives. For a sprite, a beautiful clip that
turns the camera, drifts the body or cannot close cleanly is worse than a less
cinematic video with stable endpoints and a usable gait.
