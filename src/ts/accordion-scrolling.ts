interface PendingClose {
  cancel: () => void;
}

let accordionInitialized = false;
const pendingCloses = new WeakMap<HTMLDetailsElement, PendingClose>();

/** Initializes scroll-aware behavior for closing sticky accordions. */
export function initStickyAccordions(): void {
  if (accordionInitialized) return;
  accordionInitialized = true;

  document.addEventListener("click", (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const summary = target.closest("summary");
    const details = summary?.closest<HTMLDetailsElement>("details");
    if (!summary || !details || !details.open) return;

    pendingCloses.get(details)?.cancel();
    pendingCloses.delete(details);

    const originalHeaderY =
      window.scrollY + details.getBoundingClientRect().top;
    if (originalHeaderY >= window.scrollY) return;

    event.preventDefault();

    const stickyTop = parseFloat(window.getComputedStyle(summary).top) || 0;
    const targetScrollY = Math.max(0, Math.round(originalHeaderY - stickyTop));

    let animationFrameId = 0;
    let settledFrames = 0;
    let cancelled = false;

    /** Cancels the pending accordion close without changing its open state. */
    const cancelPendingClose = (): void => {
      if (cancelled) return;
      cancelled = true;
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
      pendingCloses.delete(details);
    };

    /** Closes the accordion after its header has returned to the sticky position. */
    const finish = (): void => {
      if (cancelled) return;
      cancelled = true;
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
      pendingCloses.delete(details);
      details.open = false;
    };

    /** Watches the smooth scroll until it settles or is cancelled. */
    const waitForScrollToFinish = (): void => {
      if (cancelled) return;

      if (Math.abs(window.scrollY - targetScrollY) <= 1) {
        settledFrames += 1;
        if (settledFrames >= 2) {
          finish();
          return;
        }
      } else {
        settledFrames = 0;
      }

      animationFrameId = requestAnimationFrame(waitForScrollToFinish);
    };

    const timeoutId = window.setTimeout(cancelPendingClose, 2000);

    const pendingClose: PendingClose = { cancel: cancelPendingClose };
    pendingCloses.set(details, pendingClose);

    window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    animationFrameId = requestAnimationFrame(waitForScrollToFinish);
  });
}
