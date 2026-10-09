// The jukebox model, converted from the design OBJ by `pnpm --filter site model:convert`.
export const JUKEBOX_MODEL_URL = '/models/jukebox.glb';
// Rendered once from the real scene by `pnpm --filter site model:poster`.
export const JUKEBOX_POSTER_URL = '/models/jukebox-poster.webp';
export const JUKEBOX_POSTER_WIDTH_PX = 1620;
export const JUKEBOX_POSTER_HEIGHT_PX = 900;

// Mesh names from the OBJ objects: every `Display*` mesh is glass, the rest is the shell.
export const DISPLAY_MESH_PREFIX = 'Display';

// Renderer.
export const SCENE_DPR_RANGE: [number, number] = [1, 1.5];
export const SCENE_EXPOSURE = 1.15;

// Camera: a long lens far away, so the model reads almost flat.
export const CAMERA_FOV_DEG = 28;
export const CAMERA_NEAR = 50;
export const CAMERA_FAR = 8000;
export const CAMERA_HEIGHT = 40;
export const CAMERA_MIN_DISTANCE = 1560;
// The camera backs off until this many world units fit across the stage width.
export const CAMERA_FIT_WIDTH_LANDSCAPE = 700;
export const CAMERA_FIT_WIDTH_PORTRAIT = 300;

// Hero rest pose until the choreography drives the model: centred below the header, turned
// a little towards the visitor.
export const HERO_SCALE_LANDSCAPE = 1.3;
export const HERO_SCALE_PORTRAIT = 1.35;
export const HERO_OFFSET_Y_PX = 32;
export const HERO_ROTATION: [number, number, number] = [0.12, -0.45, 0.03];

export type JukeboxMaterialSpec = {
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  envMapIntensity: number;
};

export const SHELL_MATERIAL: JukeboxMaterialSpec = {
  metalness: 0.25,
  roughness: 0.45,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
  envMapIntensity: 0.55,
};

export const GLASS_MATERIAL: JukeboxMaterialSpec = {
  metalness: 0.7,
  roughness: 0.12,
  clearcoat: 1,
  clearcoatRoughness: 0,
  envMapIntensity: 1.2,
};

// Colour tokens the scene reads (theme.css). Their hex values are taken as linear values,
// like the prototype's pre colour management three.js did.
export const JUKEBOX_COLOR_VARS = {
  shell: '--color-jukebox-shell',
  glass: '--color-jukebox-glass',
  softboxBackground: '--color-jukebox-softbox-bg',
  softbox: '--color-jukebox-softbox',
  softboxLeft: '--color-jukebox-softbox-left',
  softboxRight: '--color-jukebox-softbox-right',
  sky: '--color-jukebox-sky',
  ground: '--color-jukebox-ground',
  key: '--color-jukebox-key',
  rimLeft: '--color-jukebox-rim-left',
  rimRight: '--color-jukebox-rim-right',
  fill: '--color-jukebox-fill',
} as const;

export type JukeboxColorName = keyof typeof JUKEBOX_COLOR_VARS;

// The prototype's light intensities were legacy (non physical) units; physically based
// lights need them times pi for the same irradiance.
const LEGACY_TO_PHYSICAL = Math.PI;

export const HEMISPHERE_INTENSITY = 0.15 * LEGACY_TO_PHYSICAL;

export type DirectionalLightSpec = {
  color: JukeboxColorName;
  intensity: number;
  position: [number, number, number];
};

export const DIRECTIONAL_LIGHTS: Record<string, DirectionalLightSpec> = {
  key: {
    color: 'key',
    intensity: 0.55 * LEGACY_TO_PHYSICAL,
    position: [400, 700, 600],
  },
  rimLeft: {
    color: 'rimLeft',
    intensity: 0.7 * LEGACY_TO_PHYSICAL,
    position: [-700, 250, -200],
  },
  rimRight: {
    color: 'rimRight',
    intensity: 0.5 * LEGACY_TO_PHYSICAL,
    position: [700, -150, -300],
  },
  fill: {
    color: 'fill',
    intensity: 0.12 * LEGACY_TO_PHYSICAL,
    position: [-300, -400, 500],
  },
};

// The softbox environment: emissive panels around the model, baked once into an env map.
export type SoftboxPanelSpec = {
  id: string;
  color: JukeboxColorName;
  intensity: number;
  scale: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
};

const QUARTER_TURN = Math.PI / 2;
const FLOOR_PANEL_TILT = -Math.PI / 2.4;

export const SOFTBOX_PANELS: readonly SoftboxPanelSpec[] = [
  {
    id: 'overhead',
    color: 'softbox',
    intensity: 3.2,
    scale: [30, 12, 1],
    position: [0, 14, 4],
    rotation: [QUARTER_TURN, 0, 0],
  },
  {
    id: 'left',
    color: 'softboxLeft',
    intensity: 1.1,
    scale: [10, 24, 1],
    position: [-16, 2, 0],
    rotation: [0, QUARTER_TURN, 0],
  },
  {
    id: 'right',
    color: 'softboxRight',
    intensity: 0.9,
    scale: [10, 24, 1],
    position: [16, 2, 0],
    rotation: [0, -QUARTER_TURN, 0],
  },
  {
    id: 'floor',
    color: 'softbox',
    intensity: 0.8,
    scale: [40, 6, 1],
    position: [0, -10, 10],
    rotation: [FLOOR_PANEL_TILT, 0, 0],
  },
  {
    id: 'back',
    color: 'softbox',
    intensity: 2.2,
    scale: [14, 8, 1],
    position: [0, 6, -18],
    rotation: [0, 0, 0],
  },
];
export const SOFTBOX_RESOLUTION = 256;
