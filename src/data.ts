import {createTopology} from '../shared/topology.mjs';
import content from "../content/archives.json" with { type: "json" };

export interface ArchiveRecord {
  group: string;
  slug?: string;
  cover?: string;
  id: string;
  title: string;
  en: string;
  department: string;
  category: string;
  date: string;
  lead: string;
  clearance: string;
  abstract: string;
  findings: string[];
  source: string;
}

export const records: ArchiveRecord[] = content.records;
export const categories = ["全部档案", ...content.categories];
export const archiveColumns = content.columns;

// Shared topology is independent of Three.js and covered by navigation tests.
export const archiveGroups = content.groups;
const topology = createTopology(records, archiveGroups);
export const {columnFiles,fileLocation,fileAtSlot} = topology;
export const SLOT_STRIDE = topology.stride;
export const cellFile = topology.fileAtCell;
