import {
  type GlassUiConfig,
  JUKEBOX_UI_HEIGHT_PX,
  JUKEBOX_UI_WIDTH_PX,
  type JukeboxUiDesign,
  type LavaLampConfig,
  type PixelUiConfig,
} from 'constants/jukeboxUi';
import {
  LAVA_GLASS_COLUMNS,
  LAVA_GLASS_FPS,
  LAVA_GLASS_ROWS,
  LAVA_PIXEL_FPS,
  LAVA_PIXEL_MIN_COLUMNS,
} from 'constants/lavaLamp';

// Everything one lamp needs, whichever design it sits behind. Colours are still CSS values
// (tokens are resolved against the canvas when it draws).
export type LavaLampSettings = {
  design: JukeboxUiDesign;
  lamp: LavaLampConfig;
  columns: number;
  rows: number;
  fps: number;
  // Strip colour of the glitch tearing; null when the design does not tear.
  glitchColor: string | null;
  hasScanlines: boolean;
  // CSS blur in design pixels; 0 for none.
  blur: number;
};

const lampOf = ({
  base,
  blob1,
  blob2,
  blob3,
  blobAlpha,
  animate,
  speed,
}: LavaLampConfig): LavaLampConfig => ({
  base,
  blob1,
  blob2,
  blob3,
  blobAlpha,
  animate,
  speed,
});

// One background block per `pixel` design pixels across, the screen's aspect kept.
export function pixelLavaSettings(config: PixelUiConfig): LavaLampSettings {
  const columns = Math.max(
    LAVA_PIXEL_MIN_COLUMNS,
    Math.round(JUKEBOX_UI_WIDTH_PX / config.pixel),
  );
  return {
    design: 'pixel',
    lamp: lampOf(config),
    columns,
    rows: Math.round((columns * JUKEBOX_UI_HEIGHT_PX) / JUKEBOX_UI_WIDTH_PX),
    fps: LAVA_PIXEL_FPS,
    glitchColor: config.glitch ? config.now : null,
    hasScanlines: config.scan,
    blur: 0,
  };
}

export function glassLavaSettings(config: GlassUiConfig): LavaLampSettings {
  return {
    design: 'glass',
    lamp: lampOf(config),
    columns: LAVA_GLASS_COLUMNS,
    rows: LAVA_GLASS_ROWS,
    fps: LAVA_GLASS_FPS,
    glitchColor: null,
    hasScanlines: false,
    blur: config.blur,
  };
}
