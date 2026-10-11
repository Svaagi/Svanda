export interface QueuedToast {
  id: number;
  message: string;
}

export function enqueueToast(
  queue: readonly QueuedToast[],
  toast: QueuedToast,
): QueuedToast[] {
  return [...queue, toast];
}

export function dismissToast(
  queue: readonly QueuedToast[],
  id: number,
): QueuedToast[] {
  return queue.filter((toast) => toast.id !== id);
}
