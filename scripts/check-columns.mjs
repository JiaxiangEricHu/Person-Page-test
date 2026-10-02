import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createTopology,nearestOccurrence,rowWindow} from '../shared/topology.mjs';
import {normalizeGroups} from '../shared/groups.mjs';
import {shouldPublish} from './publication.mjs';

test('independent loops for 1, 3, 7 and 41 projects in four columns, including negative rows and rebasing',()=>{
 const groups=normalizeGroups(['One','Three','Seven','Forty one']);
 const counts=[1,3,7,41],records=groups.flatMap((g,lane)=>Array.from({length:counts[lane]},()=>({group:g.id})));
 const topology=createTopology(records,groups),slots=new Set();
 records.forEach((_,i)=>{const loc=topology.fileLocation(i);slots.add(loc.slot);assert.equal(topology.fileAtSlot(loc.slot),i);assert.equal(topology.fileAtCell(loc),i);});
 assert.equal(slots.size,records.length);
 counts.forEach((count,lane)=>{
  for(const row of [-701,-1,12,19,2049,10004]){
   const expected=topology.columnFiles(lane)[((row-12)%count+count)%count];
   assert.equal(topology.fileAtCell({lane,row}),expected);
   const origin=2037,rebased=row-origin;
   assert.equal(topology.fileAtCell({lane,row:rebased},origin),expected);
   const index=topology.columnFiles(lane).at(-1),canonical=topology.fileLocation(index).row;
   const target=nearestOccurrence(canonical-origin,rebased,count);
   assert.equal(topology.fileAtCell({lane,row:target},origin),index);
  }
 });
});
test('row windows match exact user budgets and a single project can repeat through any window',()=>{
 const groups=normalizeGroups(['Solo']),t=createTopology([{group:groups[0].id}],groups);
 for(const count of [1,2,9,20,48])for(const center of [-2100,12,13.7,3300]){
  const {start,end}=rowWindow(center,count);assert.equal(end-start+1,count);
  for(let row=start;row<=end;row++)assert.equal(t.fileAtCell({lane:0,row}),0);
 }
});
test('stable IDs survive reordering; invalid row budgets and duplicate IDs fail',()=>{
 const groups=normalizeGroups(['A','B','C','D','E','F']),records=groups.map(g=>({group:g.id}));
 const reordered=createTopology(records,[...groups].reverse());
 assert.equal(reordered.fileLocation(0).lane,5);assert.equal(reordered.fileLocation(5).lane,0);
 assert.throws(()=>normalizeGroups([{...groups[0],visibleRows:1.5}]),/整数/);
 assert.throws(()=>normalizeGroups([groups[0],groups[0]]),/唯一/);
});
test('paused automatic publication builds only; explicit manual publish remains available on main',()=>{
 assert.equal(shouldPublish('push','refs/heads/main','',false),false);
 assert.equal(shouldPublish('push','refs/heads/main','',true),true);
 assert.equal(shouldPublish('workflow_dispatch','refs/heads/main','false',true),false);
 assert.equal(shouldPublish('workflow_dispatch','refs/heads/main','true',false),true);
 assert.equal(shouldPublish('pull_request','refs/heads/main','true',true),false);
 assert.equal(shouldPublish('workflow_dispatch','refs/heads/preview','true',true),false);
});
