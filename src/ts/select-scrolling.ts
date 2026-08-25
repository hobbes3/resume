/** Initializes anchor-link and section-select scrolling behavior. */
export function initScrolling(): void {
  initAnchorLinks();
  initSiteSectionJump();
}

/** Adds smooth scrolling and sticky-offset handling to in-page links. */
function initAnchorLinks(): void {
  const anchorLinks =
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.setAttribute("target", "_self");
    link.classList.add("contrast");
    if (!link.hasAttribute("data-tippy-content")) {
      const linkText = link.textContent?.trim() || "section";
      link.setAttribute("data-tippy-content", `Jump to ${linkText}`);
    }

    link.addEventListener("click", (event) => {
      const target = document.querySelector<HTMLElement>(link.hash);
      const jumpSelect =
        document.querySelector<HTMLSelectElement>("#this-site-jump");
      const siteDetails = jumpSelect?.closest<HTMLDetailsElement>("details");

      if (!target || !jumpSelect || !siteDetails?.open) return;

      event.preventDefault();
      const selectTop =
        parseFloat(window.getComputedStyle(jumpSelect).top) || 0;
      const targetScrollY = Math.max(
        0,
        window.scrollY + target.getBoundingClientRect().top - selectTop,
      );
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    });
  });
}

/** Connects the section select to scrolling and scroll-position tracking. */
function initSiteSectionJump(): void {
  const jumpSelect =
    document.querySelector<HTMLSelectElement>("#this-site-jump");
  if (!jumpSelect) return;

  const sections = Array.from(jumpSelect.options, (option) =>
    option.value ? document.querySelector<HTMLElement>(option.value) : null,
  ).filter((section): section is HTMLElement => section !== null);

  if (sections.length === 0) return;

  const siteDetails = jumpSelect.closest<HTMLDetailsElement>("details");
  siteDetails?.addEventListener("toggle", () => {
    if (siteDetails.open) {
      jumpSelect.value = "";
    }
  });

  let programmaticScroll = false;
  let programmaticScrollTimeoutId = 0;

  /** Returns the current top offset of the sticky section select. */
  const getStickySelectTop = (): number => {
    const style = window.getComputedStyle(jumpSelect);
    return parseFloat(style.top) || 0;
  };

  /** Allows scroll tracking to resume after a programmatic scroll. */
  const finishProgrammaticScroll = (): void => {
    if (!programmaticScroll) return;

    programmaticScroll = false;
    window.clearTimeout(programmaticScrollTimeoutId);
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
    const targetScrollY = Math.max(
      0,
      window.scrollY +
        section.getBoundingClientRect().top -
        getStickySelectTop(),
    );
    window.scrollTo({ top: targetScrollY, behavior: "smooth" });
  });

  let animationFrameId = 0;
  /** Selects the section currently aligned with the sticky navigation. */
  const updateSelectedSection = (): void => {
    animationFrameId = 0;
    if (programmaticScroll) return;

    const threshold = getStickySelectTop();
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
