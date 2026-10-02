import {scene as settings} from './config';
import {ARCHIVE_CENTER_ROW,ROW_SPACING} from './archive-loop';

/** Shared, stationary box bounds for geometry, repeated rows and fling limits. */
export function categoryBoxLayout(rows:number){
  const halfRows=Math.ceil(rows/2)*ROW_SPACING;
  const z=(ARCHIVE_CENTER_ROW-15.5)*ROW_SPACING+halfRows+settings.categoryBoxGap+settings.categoryBoxDepth/2;
  const depth=2*halfRows+settings.categoryBoxGap+settings.categoryBoxDepth+settings.categoryBoxRearExtension;
  const front=z+settings.categoryBoxDepth/2,back=front-depth;
  return {z,depth,front,back,
    archiveFront:z-settings.categoryBoxDepth/2-.35,
    archiveBack:back+.6};
}
