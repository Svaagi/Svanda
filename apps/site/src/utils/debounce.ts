type Debounced<Args extends unknown[]> = {
  (...args: Args): void;
  flush: () => void;
  cancel: () => void;
};

export function debounce<Args extends unknown[]>(
  run: (...args: Args) => void,
  waitMs: number,
): Debounced<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pendingArgs: Args | null = null;

  const cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    pendingArgs = null;
  };

  const flush = () => {
    const args = pendingArgs;
    cancel();
    if (args) run(...args);
  };

  const debounced = (...args: Args) => {
    pendingArgs = args;
    clearTimeout(timer);
    timer = setTimeout(flush, waitMs);
  };

  return Object.assign(debounced, { flush, cancel });
}
