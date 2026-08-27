// Config
const isOpenClass = "modal-is-open";
const openingClass = "modal-is-opening";
const closingClass = "modal-is-closing";
const scrollbarWidthCssVar = "--pico-scrollbar-width";
const animationDuration = 400; // ms

let visibleModal: HTMLDialogElement | null = null;
let openingTimer: ReturnType<typeof setTimeout> | null = null;

export interface ModalOptions {
  triggerSelector?: string;
  dialogSelector?: string;
  onOpen?: (button: HTMLButtonElement, dialog: HTMLDialogElement) => void;
}

// Helper: Get scrollbar width to prevent page jump on open
/** Calculates the scrollbar width so modal opening does not shift the page. */
const getScrollbarWidth = (): number => {
  return window.innerWidth - document.documentElement.clientWidth;
};

// Open modal
/** Opens a modal dialog and starts its opening transition. */
export const openModal = (modal: HTMLDialogElement): void => {
  const { documentElement: html } = document;
  const scrollbarWidth = getScrollbarWidth();

  if (scrollbarWidth > 0) {
    html.style.setProperty(scrollbarWidthCssVar, `${scrollbarWidth}px`);
  }

  // Set logical state immediately
  visibleModal = modal;

  html.classList.add(isOpenClass, openingClass);

  // Clear any pending opening timer before starting a new transition
  if (openingTimer) {
    clearTimeout(openingTimer);
    openingTimer = null;
  }

  openingTimer = setTimeout(() => {
    html.classList.remove(openingClass);
    openingTimer = null;
  }, animationDuration);

  modal.showModal();
};

// Close modal
/** Closes a modal dialog after its closing transition completes. */
export const closeModal = (modal: HTMLDialogElement): void => {
  // Clear opening animation timer if closed before completion
  if (openingTimer) {
    clearTimeout(openingTimer);
    openingTimer = null;
  }

  // Clear logical state immediately
  visibleModal = null;

  const { documentElement: html } = document;

  html.classList.add(closingClass);

  setTimeout(() => {
    html.classList.remove(closingClass, isOpenClass, openingClass);
    html.style.removeProperty(scrollbarWidthCssVar);
    modal.close();
  }, animationDuration);
};

// Return active modal instance if needed
/** Returns the dialog currently tracked as visible, if any. */
export const getVisibleModal = (): HTMLDialogElement | null => visibleModal;

// Initialize modal triggers and listeners
/** Binds trigger, close-control, backdrop, and Escape-key handlers to dialogs. */
export function initModal(options: ModalOptions = {}): void {
  const {
    triggerSelector = "button.hotspot",
    dialogSelector = "dialog#job-dialog",
    onOpen,
  } = options;

  const triggers =
    document.querySelectorAll<HTMLButtonElement>(triggerSelector);

  triggers.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      // Resolve target dialog from button data-target or default selector
      const targetId = button.dataset.target;
      const targetModal = targetId
        ? (document.getElementById(targetId) as HTMLDialogElement | null)
        : document.querySelector<HTMLDialogElement>(dialogSelector);

      if (!targetModal) return;

      if (onOpen) {
        onOpen(button, targetModal);
      }

      openModal(targetModal);
    });
  });

  // Bind close controls to ALL dialog elements on the page
  const dialogs = document.querySelectorAll<HTMLDialogElement>("dialog");

  dialogs.forEach((dialog) => {
    const closeButtons = dialog.querySelectorAll<HTMLElement>(
      "button.close, button[aria-label='Close'], .close, [data-close]",
    );

    closeButtons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        closeModal(dialog);
      });
    });

    // Close on backdrop click
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        closeModal(dialog);
      }
    });

    // Handle native cancel event (e.g., Escape key)
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeModal(dialog);
    });
  });
}
