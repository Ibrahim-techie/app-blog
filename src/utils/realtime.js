/**
 * Cleanup for an Appwrite realtime subscription.
 *
 * `Realtime.subscribe()` resolves to the subscription rather than returning it,
 * so `subscription.unsubscribe()` on the raw return value silently does nothing
 * — a promise has no such method — and the subscription is never removed. Each
 * remount then adds another live handler.
 *
 * Pass the promise straight from an effect:
 *
 *   useEffect(() => subscribeWithCleanup(service.subscribeToX(handler)), [deps]);
 *
 * Unsubscribing before the promise resolves is handled too: the subscription is
 * torn down as soon as it arrives.
 */
export function subscribeWithCleanup(subscribePromise) {
  let cancelled = false;
  let released = false;

  // On an early unmount both the resolve handler and the cleanup would fire,
  // so guard against unsubscribing the same subscription twice.
  const release = (subscription) => {
    if (released || !subscription) return;
    released = true;
    subscription.unsubscribe?.();
  };

  const pending = Promise.resolve(subscribePromise)
    .then((subscription) => {
      if (cancelled) release(subscription);
      return subscription;
    })
    .catch((error) => {
      console.error("Realtime subscribe failed:", error);
      return null;
    });

  return () => {
    cancelled = true;
    pending.then(release);
  };
}
