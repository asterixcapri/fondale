import { expect, test } from "@playwright/test";

import {
  createDetailViews,
  validateDetailViewDefinition,
  validateDetailViewProject,
  type DetailViewConditionMatches,
  type DetailViewDefinition,
} from "./index";
import type { NounDefinition } from "../interaction";
import { validateTestDefinition } from "../../../test/definition-support";

const noun = {
  labels: [{ text: "Seal" }],
  preferredVerbs: [{ verb: "look-at" }],
  cases: [{ verb: "look-at", response: { text: "A broken seal." } }],
} satisfies NounDefinition;

const seal = validateTestDefinition({
  image: "seal.png",
  hotspots: [
    {
      area: [{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 40 }, { x: 0, y: 40 }],
      noun,
    },
    {
      area: [{ x: 20, y: 20 }, { x: 60, y: 20 }, { x: 60, y: 60 }, { x: 20, y: 60 }],
      noun,
      when: { variable: "sealRead", equals: true },
    },
  ],
} satisfies DetailViewDefinition, (value) => validateDetailViewDefinition(value, "detailViews.seal"));

const logicalResolution = { width: 100, height: 100 };

test("a Detail View reports every malformed part at its own authored path", () => {
  const diagnostics = validateDetailViewDefinition({
    image: "  ",
    hotspots: [
      { area: [{ x: 0, y: 0 }, { x: 10, y: 0 }], noun },
      { area: [{ x: 0, y: 0 }, { x: Number.NaN, y: 0 }, { x: 5, y: 5 }], noun },
    ],
  }, "detailViews.seal");

  expect(diagnostics).toEqual(expect.arrayContaining([
    expect.objectContaining({
      code: "definition.detail-view.image",
      owner: "detail-view",
      path: "detailViews.seal.image",
    }),
    expect.objectContaining({
      code: "definition.polygon.vertices",
      owner: "detail-view",
      path: "detailViews.seal.hotspots[0].area",
    }),
    expect.objectContaining({
      code: "definition.point.finite",
      owner: "detail-view",
      path: "detailViews.seal.hotspots[1].area[1]",
    }),
  ]));
});

test("a Detail View rejects Hotspot geometry outside the Logical Resolution", () => {
  expect(validateDetailViewProject({
    detailViews: {
      seal: {
        image: "seal.png",
        hotspots: [{
          area: [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 40 }, { x: 0, y: 40 }],
          noun,
        }],
      },
    },
    logicalResolution,
  })).toEqual([
    expect.objectContaining({
      code: "definition.detail-view.bounds",
      owner: "detail-view",
      path: "detailViews.seal.hotspots[0].area[1]",
    }),
    expect.objectContaining({
      code: "definition.detail-view.bounds",
      path: "detailViews.seal.hotspots[0].area[2]",
    }),
  ]);
});

/** Matches exactly as committed Game State does: an absent condition holds. */
const sealRead = (value: boolean): DetailViewConditionMatches =>
  (condition) => condition === undefined ? true : value;

test("a presented Detail View offers only the Hotspots its condition allows", () => {
  const detailViews = createDetailViews({ detailViews: { seal } });

  expect(detailViews.has("seal")).toBe(true);
  expect(detailViews.has("missing")).toBe(false);
  expect(detailViews.presentation("seal")).toEqual({ detailView: "seal", image: "seal.png" });
  expect(detailViews.presentation("missing")).toBeUndefined();
  expect(detailViews.hotspots("seal", sealRead(false)).map(({ index }) => index)).toEqual([0]);
  expect(detailViews.hotspots("seal", sealRead(true)).map(({ index }) => index)).toEqual([0, 1]);
});

test("a Detail View hit test answers with the last available Hotspot under the point", () => {
  const detailViews = createDetailViews({ detailViews: { seal } });

  expect(detailViews.hitTest("seal", { x: 5, y: 5 }, sealRead(true))).toBe(0);
  expect(detailViews.hitTest("seal", { x: 30, y: 30 }, sealRead(true))).toBe(1);
  expect(detailViews.hitTest("seal", { x: 50, y: 50 }, sealRead(false))).toBeUndefined();
  expect(detailViews.hitTest("seal", { x: 90, y: 90 }, sealRead(true))).toBeUndefined();
  expect(detailViews.hitTest("missing", { x: 5, y: 5 }, sealRead(true))).toBeUndefined();
});
