import { GLASS_MATERIAL, SHELL_MATERIAL } from 'constants/jukebox3d';
import { BufferGeometry, Color, Group, Mesh, Object3D, Texture } from 'three';
import { describe, expect, it, vi } from 'vitest';

import {
  assignJukeboxMaterials,
  createJukeboxMaterials,
  disposeJukeboxMaterials,
  isDisplayMeshName,
  syncEnvironmentMap,
} from './jukeboxMaterials';

const COLORS = { shell: new Color(0.01, 0, 0), glass: new Color(0, 0.01, 0) };

const namedMesh = (name: string) => {
  const mesh = new Mesh(new BufferGeometry());
  mesh.name = name;
  return mesh;
};

// The GLB as loaded: a scene of nodes named after the OBJ objects.
function createModel() {
  const root = new Group();
  const case_ = namedMesh('Jukebox_Case');
  const display = namedMesh('Display_Main');
  const chin = namedMesh('Display_Chin');
  const nested = new Object3D();
  nested.add(chin);
  root.add(case_, display, nested);
  return { root, case_, display, chin };
}

describe('isDisplayMeshName', () => {
  it('matches the display meshes only', () => {
    expect(isDisplayMeshName('Display_Main')).toBe(true);
    expect(isDisplayMeshName('Display_Chin')).toBe(true);
    expect(isDisplayMeshName('Jukebox_Case')).toBe(false);
  });
});

describe('createJukeboxMaterials', () => {
  it('builds the clearcoated shell and glass from the specs', () => {
    const { shell, glass } = createJukeboxMaterials(COLORS);

    expect(shell.color.equals(COLORS.shell)).toBe(true);
    expect(shell.roughness).toBe(SHELL_MATERIAL.roughness);
    expect(shell.clearcoat).toBe(SHELL_MATERIAL.clearcoat);
    expect(shell.envMapIntensity).toBe(SHELL_MATERIAL.envMapIntensity);
    expect(glass.color.equals(COLORS.glass)).toBe(true);
    expect(glass.metalness).toBe(GLASS_MATERIAL.metalness);
    expect(glass.envMapIntensity).toBe(GLASS_MATERIAL.envMapIntensity);
  });
});

describe('assignJukeboxMaterials', () => {
  it('gives the displays glass and every other mesh the shell, at any depth', () => {
    const materials = createJukeboxMaterials(COLORS);
    const { root, case_, display, chin } = createModel();

    assignJukeboxMaterials(root, materials);

    expect(case_.material).toBe(materials.shell);
    expect(display.material).toBe(materials.glass);
    expect(chin.material).toBe(materials.glass);
  });
});

describe('disposeJukeboxMaterials', () => {
  it('disposes both materials', () => {
    const materials = createJukeboxMaterials(COLORS);
    const disposeShell = vi.spyOn(materials.shell, 'dispose');
    const disposeGlass = vi.spyOn(materials.glass, 'dispose');

    disposeJukeboxMaterials(materials);

    expect(disposeShell).toHaveBeenCalledOnce();
    expect(disposeGlass).toHaveBeenCalledOnce();
  });
});

describe('syncEnvironmentMap', () => {
  it('gives both materials the environment once, so their own intensities apply', () => {
    const materials = createJukeboxMaterials(COLORS);
    const environment = new Texture();

    syncEnvironmentMap(materials, environment);
    const shellVersion = materials.shell.version;
    syncEnvironmentMap(materials, environment);

    expect(materials.shell.envMap).toBe(environment);
    expect(materials.glass.envMap).toBe(environment);
    expect(materials.shell.version).toBe(shellVersion);
  });

  it('clears the map when the environment goes away', () => {
    const materials = createJukeboxMaterials(COLORS);
    syncEnvironmentMap(materials, new Texture());

    syncEnvironmentMap(materials, null);

    expect(materials.shell.envMap).toBeNull();
    expect(materials.glass.envMap).toBeNull();
  });
});
