type Cell={lane:number;row:number};
export function wrap(value:number,count:number):number;
export function nearestOccurrence(value:number,center:number,period:number):number;
export function rowWindow(center:number,count:number):{start:number;end:number};
export function createTopology(records:{group:string}[],groups:{id:string}[]):{
 stride:number;columnFiles:(lane:number)=>number[];fileLocation:(index:number)=>Cell&{slot:number};fileAtSlot:(slot:number)=>number;fileAtCell:(cell:Cell,origin?:number)=>number;
};
