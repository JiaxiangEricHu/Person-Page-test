import {scene as settings} from "./config";
// Preserve the original cover's width and top edge; extend its body downward.
export const CARD_WIDTH = 5;
export const ORIGINAL_CARD_HEIGHT = 3.7;
export const CARD_HEIGHT = CARD_WIDTH * settings.cardAspect;
export const CARD_TOP = ORIGINAL_CARD_HEIGHT;
export const CARD_BOTTOM = CARD_TOP - CARD_HEIGHT;
export const CARD_CENTER = (CARD_TOP + CARD_BOTTOM) / 2;
export const CARD_HEIGHT_SCALE = CARD_HEIGHT / ORIGINAL_CARD_HEIGHT;
export const PREVIEW_EXPOSURE = CARD_HEIGHT * settings.exposedFraction;
export const PREVIEW_LABEL_WIDTH = 4.55;
export const PREVIEW_LABEL_HEIGHT = PREVIEW_EXPOSURE - 0.3;
export const PREVIEW_LABEL_CENTER = CARD_TOP - PREVIEW_EXPOSURE / 2;
export const DETAIL_LIFT = CARD_HEIGHT + 0.5;
export const DETAIL_VIEW_SPAN = CARD_HEIGHT + 1.6;
