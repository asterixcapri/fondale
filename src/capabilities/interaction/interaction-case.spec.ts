import { expect, test } from "@playwright/test";

import type { AuthoringDiagnostic } from "../game-project";
import {
  validateConditionalFallbackOrder,
  validateConditionalFallbackTail,
  validateInteractionCaseOutcome,
  validateUnconditionalVariantExists,
  validateUnconditionalVariantLast,
  type InteractionCase,
} from "./index";

function outcomeDiagnostics(candidate: InteractionCase): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  validateInteractionCaseOutcome(candidate, "cases[0]", diagnostics);
  return diagnostics;
}

function orderDiagnostics(
  values: readonly { readonly when?: InteractionCase["when"] }[],
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  validateConditionalFallbackOrder(values, "labels", "Noun Label", diagnostics);
  return diagnostics;
}

test("an Interaction Case declaring one outcome beside Game Operations is accepted", () => {
  expect(outcomeDiagnostics({
    when: { variable: "opened", equals: true },
    response: { text: "It is already open." },
    operations: [{ type: "set-variable", variable: "seen", value: true }],
  })).toEqual([]);
  expect(outcomeDiagnostics({
    operations: [{ type: "set-variable", variable: "seen", value: true }],
  })).toEqual([]);
});

test("an Interaction Case declaring two outcomes is refused", () => {
  expect(outcomeDiagnostics({
    line: { character: "diver", text: "Locked." },
    response: { text: "It is locked." },
  })).toEqual([
    expect.objectContaining({
      code: "definition.command-case.textual-outcome",
      owner: "interaction",
      path: "cases[0]",
    }),
  ]);
});

test("a start-sequence Game Operation counts as a Sequence outcome", () => {
  expect(outcomeDiagnostics({
    line: { character: "diver", text: "Locked." },
    operations: [{ type: "start-sequence", sequence: "opening" }],
  })).toEqual([
    expect.objectContaining({ code: "definition.command-case.textual-outcome" }),
  ]);
  expect(outcomeDiagnostics({
    sequence: "opening",
    operations: [{ type: "start-sequence", sequence: "opening" }],
  })).toEqual([
    expect.objectContaining({ code: "definition.command-case.textual-outcome" }),
  ]);
  expect(outcomeDiagnostics({
    operations: [{ type: "start-sequence", sequence: "opening" }],
  })).toEqual([]);
});

test("an Interaction Case declaring no outcome at all is refused", () => {
  expect(outcomeDiagnostics({ when: { hasObject: "key" } })).toEqual([
    expect.objectContaining({
      code: "definition.command-case.empty",
      owner: "interaction",
      path: "cases[0]",
    }),
  ]);
});

test("exactly one unconditional entry in the final position is required", () => {
  expect(orderDiagnostics([
    { when: { variable: "opened", equals: true } },
    {},
  ])).toEqual([]);
  expect(orderDiagnostics([
    {},
    { when: { variable: "opened", equals: true } },
  ])).toEqual([
    expect.objectContaining({
      code: "definition.conditional-fallback",
      owner: "interaction",
      path: "labels",
      message: "Noun Label variants allow at most one unconditional variant, and it must come last.",
    }),
  ]);
  expect(orderDiagnostics([{ when: { variable: "opened", equals: true } }])).toEqual([
    expect.objectContaining({ code: "definition.conditional-fallback" }),
  ]);
  expect(orderDiagnostics([{}, {}])).toEqual([
    expect.objectContaining({ code: "definition.conditional-fallback" }),
  ]);
});

test("a list offered all at once requires its unconditional entries last", () => {
  const tailDiagnostics = (
    values: readonly { readonly when?: InteractionCase["when"] }[],
  ): readonly AuthoringDiagnostic[] => {
    const diagnostics: AuthoringDiagnostic[] = [];
    validateConditionalFallbackTail(values, "alternatives", "Choice alternative", diagnostics);
    return diagnostics;
  };

  expect(tailDiagnostics([{ when: { variable: "opened", equals: true } }, {}])).toEqual([]);
  expect(tailDiagnostics([{}, {}])).toEqual([]);
  expect(tailDiagnostics([
    {},
    { when: { variable: "opened", equals: true } },
  ])).toEqual([
    expect.objectContaining({
      code: "definition.conditional-fallback",
      owner: "interaction",
      path: "alternatives",
      message:
        "Choice alternative variants require an unconditional variant in the final position, after every conditional one.",
    }),
  ]);
  expect(tailDiagnostics([{ when: { variable: "opened", equals: true } }])).toEqual([
    expect.objectContaining({ code: "definition.conditional-fallback" }),
  ]);
  expect(tailDiagnostics([])).toEqual([
    expect.objectContaining({ code: "definition.conditional-fallback" }),
  ]);
});

test("the ordering rule stands alone, and requires no default", () => {
  const lastDiagnostics = (
    values: readonly { readonly when?: InteractionCase["when"] }[],
  ): readonly AuthoringDiagnostic[] => {
    const diagnostics: AuthoringDiagnostic[] = [];
    validateUnconditionalVariantLast(values, "cases", "Scene Opening", diagnostics);
    return diagnostics;
  };

  // A container that need not react at all: wholly conditional is legitimate,
  // and an empty list even more so.
  expect(lastDiagnostics([{ when: { variable: "opened", equals: true } }])).toEqual([]);
  expect(lastDiagnostics([])).toEqual([]);
  expect(lastDiagnostics([{ when: { variable: "opened", equals: true } }, {}])).toEqual([]);

  // What is never legitimate: an entry below one that always applies.
  expect(lastDiagnostics([{}, { when: { variable: "opened", equals: true } }])).toEqual([
    expect.objectContaining({
      code: "definition.conditional-fallback",
      path: "cases",
      message: "Scene Opening variants allow at most one unconditional variant, and it must come last.",
    }),
  ]);
  expect(lastDiagnostics([{}, {}])).toEqual([
    expect.objectContaining({ code: "definition.conditional-fallback" }),
  ]);
});

test("the coverage rule stands alone, and says nothing about position", () => {
  const existsDiagnostics = (
    values: readonly { readonly when?: InteractionCase["when"] }[],
  ): readonly AuthoringDiagnostic[] => {
    const diagnostics: AuthoringDiagnostic[] = [];
    validateUnconditionalVariantExists(values, "labels", "Noun Label", diagnostics);
    return diagnostics;
  };

  expect(existsDiagnostics([{}, { when: { variable: "opened", equals: true } }])).toEqual([]);
  expect(existsDiagnostics([{ when: { variable: "opened", equals: true } }])).toEqual([
    expect.objectContaining({
      code: "definition.conditional-fallback",
      path: "labels",
      message: "Noun Label variants require one unconditional variant, which answers whatever the state.",
    }),
  ]);
});
