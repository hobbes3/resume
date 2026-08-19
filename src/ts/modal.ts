// Based off https://codesandbox.io/embed/4mrnhq?view=Editor+%2B+Preview&module=%2Fjs%2Fmodal.js

// Config
const isOpenClass = "modal-is-open";
const openingClass = "modal-is-opening";
const closingClass = "modal-is-closing";
const scrollbarWidthCssVar = "--pico-scrollbar-width";
const animationDuration = 400; // ms
let visibleModal: HTMLDialogElement | null = null;

// Helper: Get scrollbar width to prevent page jump on open
const getScrollbarWidth = (): number => {
  return window.innerWidth - document.documentElement.clientWidth;
};

// Open modal with animation and body scroll-lock
export const openModal = (modal: HTMLDialogElement): void => {
  const { documentElement: html } = document;
  const scrollbarWidth = getScrollbarWidth();

  if (scrollbarWidth > 0) {
    html.style.setProperty(scrollbarWidthCssVar, `${scrollbarWidth}px`);
  }

  html.classList.add(isOpenClass, openingClass);

  setTimeout(() => {
    visibleModal = modal;
    html.classList.remove(openingClass);
  }, animationDuration);

  modal.showModal();
};

// Close modal with exit animation and cleanup
export const closeModal = (modal: HTMLDialogElement): void => {
  visibleModal = null;
  const { documentElement: html } = document;

  html.classList.add(closingClass);

  setTimeout(() => {
    html.classList.remove(closingClass, isOpenClass);
    html.style.removeProperty(scrollbarWidthCssVar);
    modal.close();
  }, animationDuration);
};

// Toggle modal state
export const toggleModal = (modal: HTMLDialogElement): void => {
  if (modal.open) {
    closeModal(modal);
  } else {
    openModal(modal);
  }
};

export interface ModalOptions {
  /** Selector for trigger buttons (default: "[data-target]") */
  triggerSelector?: string;
  /** Selector for dialog element (default: "dialog") */
  dialogSelector?: string;
  /** Optional callback function called before the modal opens */
  onOpen?: (button: HTMLButtonElement, dialog: HTMLDialogElement) => void;
}

/**
 * Initializes listeners for modal triggers, close buttons, outside clicks, and ESC keys.
 */
export function initModal(options?: ModalOptions): void {
  const {
    triggerSelector = "[data-target]",
    dialogSelector = "dialog",
    onOpen,
  } = options || {};

  const dialog = document.querySelector<HTMLDialogElement>(dialogSelector);
  const triggers =
    document.querySelectorAll<HTMLButtonElement>(triggerSelector);

  if (!dialog) return;

  // Bind trigger buttons
  triggers.forEach((button) => {
    button.addEventListener("click", (event: MouseEvent) => {
      event.preventDefault();

      const targetId = button.dataset.target;
      const targetModal = targetId
        ? (document.getElementById(targetId) as HTMLDialogElement | null)
        : dialog;

      if (!targetModal) return;

      if (onOpen) {
        onOpen(button, targetModal);
      }

      openModal(targetModal);
    });
  });

  // Bind close buttons inside dialog (<button class="close"> or <button aria-label="Close">)
  dialog
    .querySelectorAll<HTMLButtonElement>(
      "button.close, button[aria-label='Close']",
    )
    .forEach((closeBtn) => {
      closeBtn.addEventListener("click", (event: MouseEvent) => {
        event.preventDefault();
        closeModal(dialog);
      });
    });

  // Close with a click outside (<article> boundary check)
  document.addEventListener("click", (event: MouseEvent) => {
    if (visibleModal === null) return;
    const modalContent = visibleModal.querySelector<HTMLElement>("article");
    if (!modalContent) return;

    const isClickInside = modalContent.contains(event.target as Node);
    if (!isClickInside) {
      closeModal(visibleModal);
    }
  });

  // Intercept Esc key press to trigger exit animation
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape" && visibleModal) {
      event.preventDefault(); // Prevent instant browser default close
      closeModal(visibleModal);
    }
  });
}
