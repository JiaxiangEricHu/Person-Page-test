import { CARD_HEIGHT, DETAIL_VIEW_SPAN } from "./archive-dimensions.ts";
/** Reference coordinates remain exact during the film and at 1920 × 1080. */
export function openingLayout(width: number, height: number) {
  width = Math.max(1, width); height = Math.max(1, height);
  const scale = Math.min(height / 1080, width / 1280);
  return { width: width / scale, height: height / scale, scale, kind: "opening" as const };
}
export function viewportLayout(width: number, height: number, coarse: boolean, cinematic = false) {
  width = Math.max(1, width);
  height = Math.max(1, height);
  if (cinematic) return {
    width: 1920, height: 1080, scale: Math.min(width / 1920, height / 1080),
    kind: "cinematic" as const,
  };
  const portrait = width / height < 1.05;
  const compact = portrait || width < 1100 || (coarse && height < 600);
  const scale = compact ? 1 : height / 1080;
  return { width: width / scale, height: height / scale, scale,
    kind: portrait ? "portrait" as const : compact ? "compact" as const : "desktop" as const };
}

/** Preserve the long-lens perspective. Reframe only the camera, never the card. */
export function archiveFraming(width: number, height: number, span: number, detail: number, compact: boolean) {
  const aspect = width / height;
  const portrait = aspect < 1.05;
  const baseSpan = span + (DETAIL_VIEW_SPAN - span) * detail;
  const portraitDetailSpan = Math.max(6.3 / aspect, CARD_HEIGHT * height / Math.max(100, 0.48 * height - 120));
  const previewSpan = (width <= 700 ? 6.6 : 8.4) / aspect;
  const viewSpan = portrait
    ? Math.max(baseSpan, previewSpan + (portraitDetailSpan - previewSpan) * detail)
    : Math.max(baseSpan, baseSpan * (16 / 9) / aspect);
  return {
    span: viewSpan,
    portrait,
    // Portrait selection is deliberately above its title and navigation.
    previewY: portrait ? (width <= 700 ? 0.375 : 0.425) : 0.5,
    detailX: portrait ? 0.5 : compact ? 0.27 : 550 / 1920,
    detailY: portrait ? 0.27 + 18 / height : compact ? 0.49 : 560 / 1080,
  };
}
