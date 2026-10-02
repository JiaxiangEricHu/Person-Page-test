export const wrap = (value, count) => ((value % count) + count) % count;
export const nearestOccurrence = (value, center, period) => value + Math.floor((center-value+period/2)/period)*period;
/** O(1) lookups; content length is independent from the number of rendered rows. */
export function createTopology(records, groups) {
  const lanes = groups.map(g => records.flatMap((r,i) => r.group === g.id ? [i] : []));
  const stride = Math.max(32, ...lanes.map(files=>files.length+12));
  const locations = [];
  lanes.forEach((files,lane)=>files.forEach((index,i)=>{locations[index]={lane,row:12+i,slot:lane*stride+12+i};}));
  return {
    stride,
    columnFiles: lane => lanes[lane] || [],
    fileLocation: index => locations[index],
    fileAtSlot: slot => {
      const files=lanes[Math.max(0,Math.min(lanes.length-1,Math.floor(slot/stride)))];
      return files?.[Math.max(0,Math.min(files.length-1,slot%stride-12))];
    },
    fileAtCell: ({lane,row}, origin=0) => {
      const files=lanes[wrap(lane,lanes.length)];
      return files?.[wrap(row+origin-12,files.length)];
    },
  };
}
export function rowWindow(center, count) {
  const start=Math.round(center)-Math.floor((count-1)/2);
  return {start,end:start+count-1};
}
