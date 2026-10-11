import { APP_ICONS, type AppIconName } from './appIcons';

export type AppIconProps = {
  name: AppIconName;
  className?: string;
};

// Decorative: the app preview as a whole carries the accessible name.
export function AppIcon({ name, className }: AppIconProps) {
  const { viewBox, path } = APP_ICONS[name];

  return (
    <svg
      className={className}
      viewBox={viewBox}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      data-icon={name}
    >
      <path fill="currentColor" d={path} />
    </svg>
  );
}
