import {
  DISPLAY_MESH_PREFIX,
  GLASS_MATERIAL,
  type JukeboxMaterialSpec,
  SHELL_MATERIAL,
} from 'constants/jukebox3d';
import {
  type Color,
  type Mesh,
  MeshPhysicalMaterial,
  type Object3D,
  type Texture,
} from 'three';

export type JukeboxMaterials = {
  shell: MeshPhysicalMaterial;
  glass: MeshPhysicalMaterial;
};

const createMaterial = (color: Color, spec: JukeboxMaterialSpec) =>
  new MeshPhysicalMaterial({ color, ...spec });

export function createJukeboxMaterials(colors: {
  shell: Color;
  glass: Color;
}): JukeboxMaterials {
  return {
    shell: createMaterial(colors.shell, SHELL_MATERIAL),
    glass: createMaterial(colors.glass, GLASS_MATERIAL),
  };
}

export function disposeJukeboxMaterials(materials: JukeboxMaterials) {
  materials.shell.dispose();
  materials.glass.dispose();
}

const isMesh = (object: Object3D): object is Mesh =>
  (object as Partial<Mesh>).isMesh === true;

export const isDisplayMeshName = (name: string) =>
  name.startsWith(DISPLAY_MESH_PREFIX);

// The model carries no materials of its own: the displays get glass, everything else the
// lacquered shell.
export function assignJukeboxMaterials(
  root: Object3D,
  materials: JukeboxMaterials,
) {
  root.traverse((object) => {
    if (!isMesh(object)) return;
    object.material = isDisplayMeshName(object.name)
      ? materials.glass
      : materials.shell;
  });
}

// three ignores `envMapIntensity` for a material lit only by `scene.environment` (that one
// uses the scene's intensity), so the baked softbox is set on each material as its own map:
// the shell and the glass reflect it at different strengths.
export function syncEnvironmentMap(
  materials: JukeboxMaterials,
  environment: Texture | null,
) {
  Object.values(materials).forEach((material) => {
    if (material.envMap === environment) return;
    material.envMap = environment;
    material.needsUpdate = true;
  });
}
