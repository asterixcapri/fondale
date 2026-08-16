import type {
  DialogueInterpretationRequest,
  DialogueVerbalizationRequest,
  ReflectionRequest,
} from "../capabilities/dialogue";

export type DialogueHttpRequest = {
  readonly sessionId: string;
} & (
  | {
    readonly operation: "interpret";
    readonly turnId: string;
    readonly request: DialogueInterpretationRequest;
  }
  | {
    readonly operation: "verbalize";
    readonly turnId: string;
    readonly request: DialogueVerbalizationRequest;
  }
  | {
    readonly operation: "reflect";
    readonly turnId: string;
    readonly request: ReflectionRequest;
  }
  | { readonly operation: "cancel"; readonly turnId: string }
  | { readonly operation: "reset" }
);

export type DialogueHttpResponse =
  | { readonly ok: true; readonly value?: unknown }
  | { readonly ok: false; readonly error: string };
