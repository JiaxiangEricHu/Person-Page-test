import { archiveColumns, archiveGroups, columnFiles, fileLocation, cellFile } from "./data.ts";

export type ArchiveCell = { lane: number; row: number };
export type ArchiveNavigation =
  { axis: "row" | "lane"; direction: number } | { cell: ArchiveCell };

export const LOOP_COLUMNS = archiveColumns.length;
export const LOOP_ROWS = Math.max(1,...archiveGroups.map(g=>g.visibleRows));
export const COLUMN_SPACING = 5.2;
export const ROW_SPACING = 0.62;
export const ARCHIVE_CENTER_ROW = 12;
const POOL_LANES = archiveColumns.map((_,i)=>i);
export const clampLane = (lane: number) => Math.max(0, Math.min(archiveColumns.length - 1, lane));
export function resistLane(lane: number) {
  const bound = clampLane(lane), excess = lane - bound;
  return bound + excess / (1 + Math.abs(excess) / 0.28);
}

export function wrap(value: number, count: number) {
  return ((value % count) + count) % count;
}

// Choose an occurrence of an item in an unbounded sequence. Directional moves
// use adjacent cells instead, so the last-to-first transition never reverses.
export function nearestOccurrence(
  value: number,
  center: number,
  period: number,
) {
  return value + Math.floor((center - value + period / 2) / period) * period;
}

export const fileAtCell = cellFile;

export function selectionCell(
  index: number,
  current: ArchiveCell,
  navigation?: ArchiveNavigation,
  rowOrigin = 0,
): ArchiveCell {
  if (navigation && "cell" in navigation) return { ...navigation.cell, lane: clampLane(navigation.cell.lane) };
  const next = fileLocation(index);
  const row = nearestOccurrence(
    next.row - rowOrigin,
    current.row,
    columnFiles(next.lane).length,
  );
  if (navigation?.axis === "row") {
    return { lane: current.lane, row: current.row + navigation.direction };
  }
  return {
    lane:
      navigation?.axis === "lane"
        ? clampLane(current.lane + navigation.direction)
        : next.lane,
    row,
  };
}

// Configured physical lanes; each file sequence loops independently.
export function poolCell(index: number): ArchiveCell {
  return {
    lane: POOL_LANES[Math.floor(index / LOOP_ROWS)],
    row: ARCHIVE_CENTER_ROW + index % LOOP_ROWS - Math.floor((LOOP_ROWS - 1) / 2),
  };
}

export function visibleCell(index: number, center: ArchiveCell): ArchiveCell {
  return {
    lane: nearestOccurrence(
      POOL_LANES[Math.floor(index / LOOP_ROWS)],
      center.lane,
      LOOP_COLUMNS,
    ),
    row: nearestOccurrence(index % LOOP_ROWS, center.row, LOOP_ROWS),
  };
}

export function cellKey(cell: ArchiveCell) {
  return `${cell.lane}:${cell.row}`;
}

export function sameCell(a: ArchiveCell, b: ArchiveCell) {
  return a.lane === b.lane && a.row === b.row;
}
