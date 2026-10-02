import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Shared low-poly surfaces in the same coordinates as the optional GLB. */
export function createLightweightArchive() {
  const group = new THREE.Group();
  const add = (name:string, width:number, height:number, depth:number, y:number, z=0) => {
    const material = new THREE.MeshPhysicalMaterial({roughness:.55});
    material.name = name;
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(width,height,depth,1,.045),material);
    mesh.position.set(0,y,z);
    group.add(mesh);
  };
  add('Frosted_Polymer',5,3.7,.44,1.85);
  add('Optical_Diffuser',4.7,3.4,.08,1.85,.24);
  add('Index_Inlay',1.05,.055,.035,3.55,.28);
  return group;
}
