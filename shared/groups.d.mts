export interface ArchiveGroup {id:string; name:string; keywords:string[]; logo:string; color:string; visibleRows:number; enabled:boolean}
export function normalizeGroups(input:unknown):ArchiveGroup[];
export function groupFor(groups:ArchiveGroup[],value:string|number):ArchiveGroup|undefined;
