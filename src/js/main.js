/**
 * Main Application Initializer
 */
document.addEventListener("DOMContentLoaded", () => {
  initAccordionBehavior();
  initDynamicImages();
  initModalListeners();
  initClipboardTooltips();
});

/* ==========================================================================
   1. Accordion & Resume Header Logic
   ========================================================================== */
function initAccordionBehavior() {
  const allDetails = Array.from(document.querySelectorAll("details"));
  const resumeDetails =
    document.querySelector("#resume-details") ||
    allDetails.find((el) =>
      el.querySelector("summary")?.textContent.toLowerCase().includes("resume"),
    );

  if (!resumeDetails) return;

  const resumeSummary = resumeDetails.querySelector("summary");

  // Prevent closing the resume header if it's already open
  resumeSummary?.addEventListener("click", (e) => {
    if (resumeDetails.open) {
      e.preventDefault();
    }
  });

  // Re-open resume section if all sections get closed
  allDetails.forEach((details) => {
    details.addEventListener("toggle", () => {
      if (!details.open) {
        const isAnyOpen = allDetails.some((d) => d.open);
        if (!isAnyOpen) {
          resumeDetails.open = true;
        }
      }
    });
  });
}

/* ==========================================================================
   2. Dynamic Image Loaders
   ========================================================================== */
function initDynamicImages() {
  // Load 6 high-priority conference pictures
  const confContainer = document.getElementById("conf-pics");
  if (confContainer) {
    const fragment = document.createDocumentFragment();
    for (let i = 1; i <= 6; i++) {
      const img = document.createElement("img");
      img.src = `images/conf${i}.webp`;
      img.alt = "Splunk .conf";
      img.width = 200;
      img.height = 200;
      img.fetchPriority = "high";
      fragment.appendChild(img);
    }
    confContainer.appendChild(fragment);
  }

  // Load 96 gallery pictures with low priority & lazy loading
  const galleryContainer = document.getElementById("my-pics");
  if (galleryContainer) {
    const fragment = document.createDocumentFragment();
    for (let i = 1; i <= 96; i++) {
      const img = document.createElement("img");
      img.src = `images/gallery/${i}.webp`;
      img.alt = `Gallery picture ${i}`;
      img.width = 200;
      img.height = 200;
      img.loading = "lazy";
      img.fetchPriority = "low";
      img.decoding = "async";
      fragment.appendChild(img);
    }
    galleryContainer.appendChild(fragment);
  }
}

/* ==========================================================================
   3. Modal & CI Hotspot Handlers
   ========================================================================== */
function initModalListeners() {
  const dialog = document.querySelector("dialog");
  const hotspots = document.querySelectorAll("button.hotspot");

  hotspots.forEach((button) => {
    button.addEventListener("click", () => updateJobInfo(button, dialog));
  });

  if (!dialog) return;

  const closeModal = () => {
    document.documentElement.classList.remove("modal-is-open");
    dialog.close();
  };

  // Close button (X) listener
  dialog
    .querySelector("button[aria-label='Close']")
    ?.addEventListener("click", closeModal);

  // Close on backdrop click
  dialog.addEventListener("click", (event) => {
    const article = dialog.querySelector("article");
    if (!article) return;

    const rect = article.getBoundingClientRect();
    const isInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;

    if (!isInDialog) {
      closeModal();
    }
  });

  // Handle ESC key press (native dialog close event)
  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("modal-is-open");
  });
}

function updateJobInfo(button, dialog) {
  const nameBox = document.getElementById("job-name");
  const linkAnchor = document.getElementById("job-link");
  const descBox = document.getElementById("job-description");

  const name = button.getAttribute("aria-label");
  const url = button.dataset.url;
  const description = button.dataset.description;

  if (nameBox && name) nameBox.innerText = name;
  if (linkAnchor && url) {
    linkAnchor.href = url;
    linkAnchor.textContent = url.replace(/^https?:\/\//, "");
  }
  if (descBox && description) descBox.innerText = description;

  if (dialog && typeof dialog.showModal === "function") {
    document.documentElement.classList.add("modal-is-open");
    dialog.showModal();
  }
}

/* ==========================================================================
   4. Email Clipboard Tooltip
   ========================================================================== */
function initClipboardTooltips() {
  const wrapper = document.querySelector(".tooltip-wrapper");
  if (!wrapper) return;

  wrapper.addEventListener("click", (e) => {
    e.preventDefault();
    navigator.clipboard.writeText("satoshi@hobbes3.com");

    const copyIcon = wrapper.querySelector('.copy-btn, [data-icon="copy"]');
    const checkIcon = wrapper.querySelector('.check-btn, [data-icon="check"]');

    wrapper.setAttribute("data-tooltip", "Copied!");
    if (copyIcon) copyIcon.style.display = "none";
    if (checkIcon) checkIcon.style.display = "inline-block";

    setTimeout(() => {
      wrapper.setAttribute("data-tooltip", "Copy email");
      if (copyIcon) copyIcon.style.display = "inline-block";
      if (checkIcon) checkIcon.style.display = "none";
    }, 1500);
  });
}
