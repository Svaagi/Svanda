// The part of the Umami tracker API the site uses: `track` given a function receives the
// tracker's default payload and sends whatever the function returns.
export type UmamiPayload = Record<string, unknown>;

export type UmamiTracker = {
  track: (buildPayload: (payload: UmamiPayload) => UmamiPayload) => unknown;
};

declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}

export type UmamiConfig = {
  src: string;
  websiteId: string;
};

type UmamiEnv = {
  isProduction: boolean;
  websiteId?: string;
  src?: string;
};

// The tracker runs only in a production build with a website id; dev servers and tests never
// load it.
export function resolveUmamiConfig(
  { isProduction, websiteId, src }: UmamiEnv,
  defaultSrc: string,
): UmamiConfig | null {
  if (!isProduction || !websiteId) return null;

  return { websiteId, src: src || defaultSrc };
}

const findTrackerScript = (websiteId: string) =>
  Array.from(document.scripts).find(
    (script) => script.dataset.websiteId === websiteId,
  );

// Adds the tracker script (once, however often it is asked for) and reports the tracker when
// it has loaded. Automatic page view tracking stays off: every call goes through `track`, so
// consent gates all of them.
export function loadUmamiScript(
  { src, websiteId }: UmamiConfig,
  onReady: (tracker: UmamiTracker) => void,
) {
  if (window.umami) {
    onReady(window.umami);
    return;
  }

  let script = findTrackerScript(websiteId);
  if (!script) {
    script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.dataset.websiteId = websiteId;
    script.dataset.autoTrack = 'false';
    script.dataset.doNotTrack = 'true';
    document.head.append(script);
  }
  script.addEventListener('load', () => {
    if (window.umami) onReady(window.umami);
  });
}
