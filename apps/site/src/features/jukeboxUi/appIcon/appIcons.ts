export type AppIconShape = {
  viewBox: string;
  path: string;
};

// Pixel icons of the jukebox app, drawn on whole-unit grids in `currentColor`.
export const APP_ICONS = {
  logo: {
    viewBox: '0 0 38 48',
    path: 'M10 0h8v8h-8zM20 0h8v8h-8zM30 0h8v8h-8zM0 10h8v8H0zM10 20h8v8h-8zM20 20h8v8h-8zM30 30h8v8h-8zM0 40h8v8H0zM10 40h8v8h-8zM20 40h8v8h-8z',
  },
  queue: {
    viewBox: '0 0 14 12',
    path: 'M0 0h10v2H0zM0 3h10v2H0zM0 6h6v2H0zM10 6h2v1h1v1h1v1h-1v-1h-1v3H8v1H7v-2h1v-1h2z',
  },
  search: {
    viewBox: '0 0 14 14',
    path: 'M3 0h6v1h1v1h1v1h1v5h-1v1h-1v1H9v1h1v1h1v1h1v1h2v-1h-1v-1h-1v-1h-1v-1H9V9h1V8h1V3h-1V2H9V1H3v1H2v1H1v5h1v1h1v1h6v1H3v-1H2V9H1V8H0V3h1V2h1V1h1z',
  },
  note: {
    viewBox: '0 0 8 10',
    path: 'M3 0h3v1h1v1h1v2H7V3H6V2H5v5H4v3H1V9H0V7h1V6h2z',
  },
  star: {
    viewBox: '0 0 11 10',
    path: 'M5 0h1v3h5v1h-1v1H9v2h1v3H8V9H6V8H5v1H3v1H1V7h1V5H1V4H0V3h5z',
  },
  plus: {
    viewBox: '0 0 7 7',
    path: 'M3 0h1v3h3v1H4v3H3V4H0V3h3z',
  },
} as const satisfies Record<string, AppIconShape>;

export type AppIconName = keyof typeof APP_ICONS;
