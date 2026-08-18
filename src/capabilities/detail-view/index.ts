import type { AuthoringDiagnostic, LogicalResolution } from "../game-project";
import type { InteractionCondition, NounDefinition } from "../interaction";
import { isInside, validatePolygonGeometry, type Point } from "../world";

/**
 * One interactive region of a presented Detail View image. It carries an
 * ordinary Noun Definition and deliberately has no Approach Point: nothing
 * walks inside a Detail View, so there is nothing to approach.
 */
export interface DetailViewHotspotDefinition {
  readonly area: readonly Point[];
  readonly noun: NounDefinition;
  readonly when?: InteractionCondition;
}

/** Declarative Detail View data accepted by Game Project authoring. */
export interface DetailViewDefinition {
  readonly image: URL | string;
  readonly hotspots?: readonly DetailViewHotspotDefinition[];
}

/** @internal The Detail View definitions needed to present and examine one image. */
export interface DetailViewProjectView {
  readonly detailViews: Readonly<Record<string, DetailViewDefinition>>;
}

/** @internal One available Hotspot of the presented Detail View. */
export interface PresentedDetailViewHotspot {
  readonly index: number;
  readonly definition: DetailViewHotspotDefinition;
}

/** @internal One Hotspot of the presented Detail View, addressed by the HUD. */
export interface DetailViewTarget {
  readonly kind: "detail-hotspot";
  readonly index: number;
}

/** @internal The image facts a browser adapter needs to replace the world. */
export interface DetailViewPresentation {
  readonly detailView: string;
  readonly image: URL | string;
}

/** @internal Reports whether one authored condition holds in committed Game State. */
export type DetailViewConditionMatches = (condition: InteractionCondition | undefined) => boolean;

/** @internal Detail View policy over one narrow Game Project view. */
export interface DetailViews {
  has(detailView: string): boolean;
  presentation(detailView: string): DetailViewPresentation | undefined;
  hotspots(
    detailView: string,
    matches: DetailViewConditionMatches,
  ): readonly PresentedDetailViewHotspot[];
  hitTest(
    detailView: string,
    point: Point,
    matches: DetailViewConditionMatches,
  ): number | undefined;
}

/** Reports every local Detail View Authoring Diagnostic without a Game Project. */
export function validateDetailViewDefinition(
  input: DetailViewDefinition,
  path = "",
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  const image = input.image instanceof URL ? input.image.href : input.image;
  if (!image.trim()) {
    diagnostics.push({
      code: "definition.detail-view.image",
      family: "definition", owner: "detail-view",
      path: childPath(path, "image"),
      message: "A Detail View requires an image.",
    });
  }
  input.hotspots?.forEach((hotspot, index) => {
    diagnostics.push(...validatePolygonGeometry(
      hotspot.area,
      childPath(path, `hotspots[${index}].area`),
      "detail-view",
      "Logical Resolution",
    ));
  });
  return diagnostics;
}

/** Validates the Detail View invariants that need the composed Game Project. */
export function validateDetailViewProject(
  view: DetailViewProjectView & { readonly logicalResolution: LogicalResolution },
): readonly AuthoringDiagnostic[] {
  const diagnostics: AuthoringDiagnostic[] = [];
  for (const [detailViewId, detailView] of Object.entries(view.detailViews)) {
    detailView.hotspots?.forEach((hotspot, index) => {
      const path = `detailViews.${detailViewId}.hotspots[${index}].area`;
      hotspot.area.forEach((point, pointIndex) => {
        if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
        if (point.x >= 0 && point.y >= 0 &&
            point.x <= view.logicalResolution.width &&
            point.y <= view.logicalResolution.height) return;
        diagnostics.push({
          code: "definition.detail-view.bounds",
          family: "definition", owner: "detail-view",
          path: `${path}[${pointIndex}]`,
          message: "Detail View geometry must remain inside the Logical Resolution.",
        });
      });
    });
  }
  return diagnostics;
}

/** Creates the Detail View module over only the definitions it owns. */
export function createDetailViews(view: DetailViewProjectView): DetailViews {
  const availableHotspots = (
    detailView: string,
    matches: DetailViewConditionMatches,
  ): readonly PresentedDetailViewHotspot[] =>
    (view.detailViews[detailView]?.hotspots ?? []).flatMap((definition, index) =>
      matches(definition.when) ? [{ index, definition }] : [],
    );

  const detailViews: DetailViews = {
    has(detailView) {
      return detailView in view.detailViews;
    },
    presentation(detailView) {
      const definition = view.detailViews[detailView];
      return definition ? { detailView, image: definition.image } : undefined;
    },
    hotspots: availableHotspots,
    hitTest(detailView, point, matches) {
      return [...availableHotspots(detailView, matches)]
        .reverse()
        .find(({ definition }) => isInside(definition.area, point))
        ?.index;
    },
  };
  return Object.freeze(detailViews);
}

function childPath(path: string, child: string): string {
  return path ? `${path}.${child}` : child;
}
