import tippy, { type Instance } from "tippy.js";
import { initModal } from "./modal";
import { initStickyAccordions } from "./accordion-scrolling";
import { initScrolling } from "./select-scrolling";
import { initLighthouseScores } from "./lighthouse-scores";
import { PIPELINE_JOB_INFO, PIPELINE_GROUPS } from "./pipeline-job-data";

import "../scss/main.scss";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import "@picocss/pico/css/pico.min.css";
import "@fontsource/carlito/latin-400.css";
import "@fontsource/carlito/latin-700.css";
import "@fontsource/carlito/latin-400-italic.css";

interface TippyElement extends HTMLElement {
  _tippy?: Instance;
}

let appInitialized = false;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
} else {
  initializeApp();
}

/** Initializes the application's interactive features after the document is ready. */
function initializeApp(): void {
  if (appInitialized) return;
  appInitialized = true;

  initScrolling();
  initDynamicImages();
  initLighthouseScores();

  // 1. Generate hotspot buttons first
  initPipelineHotspots();

  // 2. Bind modal listeners to the generated hotspot buttons
  initModal({
    dialogSelector: "dialog#job-dialog",
    triggerSelector: "button.hotspot",
    onOpen: updateJobInfo,
  });

  initClipboardTooltips();
  initTippy();

  initStickyAccordions();
}

/** Generates the conference and gallery image elements. */
function initDynamicImages(): void {
  const confContainer = document.getElementById("conf-pics");
  if (confContainer) {
    const fragment = document.createDocumentFragment();
    for (let i = 1; i <= 6; i++) {
      const img = document.createElement("img");
      img.src = `images/gallery/conf${i}.webp`;
      img.alt = "Splunk .conf";
      img.height = 200;
      img.fetchPriority = "high";
      fragment.appendChild(img);
    }
    confContainer.appendChild(fragment);
  }

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

/** Creates clickable hotspot buttons for each pipeline job. */
function initPipelineHotspots(): void {
  const hotspotContainer = document.getElementById("pipeline-hotspots");
  if (!hotspotContainer) return;

  hotspotContainer.innerHTML = "";

  PIPELINE_GROUPS.forEach(
    ({ left, width, height, topInitial, topIncrement, jobs }) => {
      jobs.forEach((jobKey, index) => {
        const jobInfo = PIPELINE_JOB_INFO.get(jobKey);
        if (!jobInfo) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "hotspot";
        button.style.left = `${left}%`;
        button.style.top = `${topInitial + index * topIncrement}%`;
        button.style.width = `${width}%`;
        button.style.height = `${height}%`;
        button.setAttribute("data-description", jobInfo.description);
        button.setAttribute("data-url", jobInfo.url);
        button.setAttribute("aria-label", jobKey);
        hotspotContainer.appendChild(button);
      });
    },
  );
}

/** Updates the job details modal from a clicked pipeline hotspot. */
function updateJobInfo(button: HTMLButtonElement): void {
  const nameBox = document.getElementById("job-name");
  const linkAnchor = document.getElementById(
    "job-link",
  ) as HTMLAnchorElement | null;
  const descBox = document.getElementById("job-description");

  const name = button.getAttribute("aria-label");
  const url = button.getAttribute("data-url");
  const description = button.getAttribute("data-description");

  if (nameBox) nameBox.innerText = name ?? "";
  if (descBox) descBox.innerText = description ?? "";

  if (linkAnchor) {
    // Clear and hide state upfront
    linkAnchor.removeAttribute("href");
    linkAnchor.textContent = "";
    linkAnchor.style.display = "none";

    if (url) {
      try {
        const parsedUrl = new URL(url, window.location.origin);
        if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
          linkAnchor.href = parsedUrl.href;
          linkAnchor.textContent = parsedUrl.href
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .replace(/\/$/, "");
          linkAnchor.style.display = "inline";
        }
      } catch {
        // Handled by upfront reset
      }
    }
  }
}

/** Adds clipboard behavior to the email tooltip control. */
function initClipboardTooltips(): void {
  const wrapper = document.querySelector<TippyElement>(".tooltip-wrapper");
  if (!wrapper) return;

  wrapper.addEventListener("click", async (e: MouseEvent) => {
    e.preventDefault();

    try {
      await navigator.clipboard.writeText("satoshi@hobbes3.com");

      const copyIcon = wrapper.querySelector<HTMLElement>(
        '.copy-btn, [data-icon="copy"]',
      );
      const checkIcon = wrapper.querySelector<HTMLElement>(
        '.check-btn, [data-icon="check"]',
      );

      wrapper._tippy?.setContent("Copied!");
      if (copyIcon) copyIcon.style.display = "none";
      if (checkIcon) checkIcon.style.display = "inline-block";

      setTimeout(() => {
        wrapper._tippy?.setContent("Copy email");
        if (copyIcon) copyIcon.style.display = "inline-block";
        if (checkIcon) checkIcon.style.display = "none";
      }, 1500);
    } catch (err) {
      console.error("Failed to copy email to clipboard:", err);
    }
  });
}

/** Initializes Tippy tooltips for annotated page elements. */
function initTippy(): void {
  const targets = document.querySelectorAll<HTMLElement>(
    "[data-tippy-content]",
  );

  tippy(targets, {
    placement: "top",
    theme: "custom-large",
    animation: "scale",
    inertia: true,
    allowHTML: false,
  });
}
