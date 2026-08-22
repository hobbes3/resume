import tippy, { type Instance } from "tippy.js";
import { PIPELINE_JOB_INFO, PIPELINE_GROUPS } from "./pipelineData";
import { initModal } from "./modal";
import { initStickyAccordions } from "./accordion";

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

function initializeApp(): void {
  if (appInitialized) return;
  appInitialized = true;

  initAnchorLinks();
  initDynamicImages();

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
  initSiteSectionJump();
}

function initAnchorLinks(): void {
  const anchorLinks =
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.setAttribute("target", "_self");
    link.classList.add("contrast");
    const linkText = link.textContent?.trim() || "section";
    link.setAttribute("data-tippy-content", `Jump to ${linkText}`);
  });
}

function initSiteSectionJump(): void {
  const jumpSelect =
    document.querySelector<HTMLSelectElement>("#this-site-jump");
  if (!jumpSelect) return;

  const sections = Array.from(jumpSelect.options, (option) =>
    option.value ? document.querySelector<HTMLElement>(option.value) : null,
  ).filter((section): section is HTMLElement => section !== null);

  if (sections.length === 0) return;

  let programmaticScroll = false;
  let programmaticScrollTimeoutId = 0;

  const finishProgrammaticScroll = (): void => {
    if (!programmaticScroll) return;

    programmaticScroll = false;
    window.clearTimeout(programmaticScrollTimeoutId);
    updateSelectedSection();
  };

  jumpSelect.addEventListener("change", () => {
    const section = document.querySelector<HTMLElement>(jumpSelect.value);
    if (!section) return;

    jumpSelect.value = `#${section.id}`;
    programmaticScroll = true;
    window.clearTimeout(programmaticScrollTimeoutId);
    programmaticScrollTimeoutId = window.setTimeout(() => {
      finishProgrammaticScroll();
    }, 2000);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  let animationFrameId = 0;
  const updateSelectedSection = (): void => {
    animationFrameId = 0;
    if (programmaticScroll) return;

    const stickyNavigation = document.getElementById("this-site-jump");
    const stickyNavigationBounds = stickyNavigation?.getBoundingClientRect();
    const threshold = (stickyNavigationBounds?.bottom ?? 0) + 80;
    let currentSection = "";

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= threshold) {
        currentSection = `#${section.id}`;
      }
    });

    const isAtDocumentBottom =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 1;
    if (isAtDocumentBottom) {
      const visibleSection = sections.findLast(
        (section) => section.getBoundingClientRect().top <= window.innerHeight,
      );
      currentSection = `#${(visibleSection ?? sections[sections.length - 1]).id}`;
    }

    if (jumpSelect.value !== currentSection) {
      jumpSelect.value = currentSection;
    }
  };

  window.addEventListener(
    "scroll",
    () => {
      if (animationFrameId === 0) {
        animationFrameId = requestAnimationFrame(updateSelectedSection);
      }
    },
    { passive: true },
  );
  window.addEventListener("scrollend", finishProgrammaticScroll);
  window.addEventListener("resize", updateSelectedSection);
  updateSelectedSection();
}

function initDynamicImages(): void {
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
