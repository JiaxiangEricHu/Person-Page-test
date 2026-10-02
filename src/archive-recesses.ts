import {archiveGroups} from './data';
import * as THREE from 'three';
import { COLUMN_SPACING, ROW_SPACING } from './archive-loop';

/** Empty cassette wells share the array's tracks, but cannot be selected. */
export class ArchiveRecesses {
  private readonly lanes = [-1, archiveGroups.length];
  private readonly rows = Math.max(8,...archiveGroups.map(g=>g.visibleRows))+8;
  private readonly track = { value: new THREE.Vector2() };
  private readonly transform = new THREE.Object3D();
  private readonly wells: THREE.InstancedMesh;
  constructor(scene: THREE.Scene, floor: THREE.MeshStandardMaterial) {
    // Open the actual floor at each well; its bevel and base sit below it.
    floor.onBeforeCompile = shader => {
      shader.uniforms.recessTrack = this.track;
      shader.vertexShader = 'varying vec3 recessPosition;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\nrecessPosition = (modelMatrix * vec4(position, 1.0)).xyz;');
      shader.fragmentShader = 'varying vec3 recessPosition; uniform vec2 recessTrack;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>', `
        #include <clipping_planes_fragment>
        float lane = floor((recessPosition.x + recessTrack.x) / ${COLUMN_SPACING.toFixed(2)} + 2.5);
        float dx = abs(recessPosition.x + recessTrack.x - (lane - 2.0) * ${COLUMN_SPACING.toFixed(2)});
        float rz = recessPosition.z - recessTrack.y;
        float dz = abs(mod(rz + 15.5 * ${ROW_SPACING.toFixed(2)} + ${(.5 * ROW_SPACING).toFixed(2)}, ${ROW_SPACING.toFixed(2)}) - ${(.5 * ROW_SPACING).toFixed(2)});
        if ((lane == -1.0 || lane == ${archiveGroups.length.toFixed(1)}) && dx < 2.36 && dz < 0.22) discard;
      `);
    };
    floor.customProgramCacheKey = () => 'archive-recess-floor-v1';
    const vertices: number[] = [], colors: number[] = [];
    const edge = new THREE.Color('#343c42'), inner = new THREE.Color('#10161b'), bottom = new THREE.Color('#030507');
    const outer = [[-2.36, 0, -.22], [2.36, 0, -.22], [2.36, 0, .22], [-2.36, 0, .22]];
    const inset = [[-2.24, -.19, -.12], [2.24, -.19, -.12], [2.24, -.19, .12], [-2.24, -.19, .12]];
    const triangle = (a: number[], b: number[], c: number[], ca: THREE.Color, cb: THREE.Color, cc: THREE.Color) => {
      vertices.push(...a, ...b, ...c); colors.push(...ca.toArray(), ...cb.toArray(), ...cc.toArray());
    };
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      triangle(outer[i], inset[i], outer[j], edge, inner, edge);
      triangle(outer[j], inset[i], inset[j], edge, inner, inner);
    }
    triangle(inset[0], inset[3], inset[1], bottom, bottom, bottom);
    triangle(inset[1], inset[3], inset[2], bottom, bottom, bottom);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    this.wells = new THREE.InstancedMesh(geometry, new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: .6, metalness: .3, side: THREE.DoubleSide,
    }), this.lanes.length * this.rows);
    this.wells.name = 'empty-edge-wells';
    this.wells.frustumCulled = false;
    this.wells.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(this.wells);
  }
  update(trackX: number, trackZ: number) {
    if (this.track.value.x === trackX && this.track.value.y === trackZ && this.wells.instanceMatrix.version) return;
    this.track.value.set(trackX, trackZ);
    let index = 0;
    const firstRow = Math.round(15.5 - trackZ / ROW_SPACING) - Math.floor(this.rows / 2);
    for (const lane of this.lanes) for (let row = firstRow; row < firstRow + this.rows; row++) {
      this.transform.position.set((lane - 2) * COLUMN_SPACING - trackX, -4.629, (row - 15.5) * ROW_SPACING + trackZ);
      this.transform.updateMatrix();
      this.wells.setMatrixAt(index++, this.transform.matrix);
    }
    this.wells.instanceMatrix.needsUpdate = true;
  }
}
