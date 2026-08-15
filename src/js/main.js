/**
 * Main Application Initializer
 */
document.addEventListener("DOMContentLoaded", () => {
  initAnchorLinks();
  initDynamicImages();
  initPipelineHotspots();
  initModalListeners();
  initClipboardTooltips();
});

function initAnchorLinks() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    // 1. Set target to _self (overriding <base target="_blank">)
    link.setAttribute("target", "_self");

    // 2. Add the Pico CSS 'contrast' class without overwriting existing classes
    link.classList.add("contrast");

    // 3. Set Pico CSS tooltip text dynamically based on the link's visible text
    const linkText = link.textContent.trim() || "section";
    link.setAttribute("data-tooltip", `Jump to ${linkText}`);
  });
}

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

const PIPELINE_JOB_INFO = new Map([
  [
    "misspell",
    {
      description:
        "Scans repository files for common English spelling mistakes and typos in source code and documentation.",
      url: "https://github.com/golangci/misspell",
    },
  ],
  [
    "prettier",
    {
      description:
        "Verifies that source files adhere to code formatting and style guidelines across the project.",
      url: "https://prettier.io",
    },
  ],
  [
    "stylelint",
    {
      description:
        "Lints CSS and stylesheet files to enforce consistent conventions and catch syntax errors.",
      url: "https://stylelint.io",
    },
  ],
  [
    "eslint",
    {
      description:
        "Analyzes JavaScript files to enforce coding standards, best practices, and potential runtime bugs.",
      url: "https://eslint.org",
    },
  ],
  [
    "markdownlint",
    {
      description:
        "Checks Markdown documentation for structure, formatting rules, and syntax correctness.",
      url: "https://github.com/DavidAnson/markdownlint",
    },
  ],
  [
    "actionlint",
    {
      description:
        "Validates GitHub Actions workflow YAML files against static analysis rules and schemas.",
      url: "https://rhysd.github.io/actionlint",
    },
  ],
  [
    "betterleaks",
    {
      description:
        "Scans repository history and commits for accidentally exposed secrets, API keys, and sensitive tokens.",
      url: "https://betterleaks.com",
    },
  ],
  [
    "html5validator",
    {
      description:
        "Validates rendered or static HTML markup against W3C HTML5 specification standards.",
      url: "https://html-validate.org",
    },
  ],
  [
    "npm-audit",
    {
      description:
        "Runs npm audit on package-lock.json to detect known security vulnerabilities in Node.js dependencies.",
      url: "https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities",
    },
  ],
  [
    "build",
    {
      description:
        "Prepares static site assets, runs automated Node.js build scripts, and packages the dist/ artifact.",
      url: "https://nodejs.org",
    },
  ],
  [
    "codeql",
    {
      description:
        "Performs semantic code analysis to discover security vulnerabilities and structural flaws across source code.",
      url: "https://codeql.github.com",
    },
  ],
  [
    "syft-grype",
    {
      description:
        "Generates a CycloneDX Software Bill of Materials (SBOM) with Syft and scans it with Grype for security vulnerabilities.",
      url: "https://anchore.com/opensource",
    },
  ],
  [
    "lychee",
    {
      description:
        "Crawls built web pages to verify that hyperlink references are valid.",
      url: "https://lychee.cli.rs",
    },
  ],
  [
    "lighthouse",
    {
      description:
        "Executes automated Google Lighthouse audits to measure Performance, Accessibility, SEO, and Best Practices.",
      url: "https://developer.chrome.com/docs/lighthouse",
    },
  ],
  [
    "deploy",
    {
      description:
        "Publishes the verified production assets to Cloudflare Pages.",
      url: "https://pages.cloudflare.com",
    },
  ],
  [
    "stackhawk",
    {
      description:
        "Runs dynamic application security testing (DAST) to find security vulnerabilities in running web applications and APIs.",
      url: "https://stackhawk.com",
    },
  ],
]);

const PIPELINE_COLUMNS = [
  {
    left: 0.5,
    width: 18,
    height: 10,
    topInitial: 5,
    topIncrement: 10,
    jobs: [
      "misspell",
      "prettier",
      "stylelint",
      "eslint",
      "markdownlint",
      "actionlint",
      "betterleaks",
      "html5validator",
      "npm-audit",
    ],
  },
  {
    left: 22,
    width: 16.5,
    height: 10,
    topInitial: 5,
    topIncrement: 0,
    jobs: ["build"],
  },
  {
    left: 42,
    width: 18,
    height: 10,
    topInitial: 5,
    topIncrement: 10,
    jobs: ["codeql", "syft-grype", "lychee", "lighthouse"],
  },
  {
    left: 63.5,
    width: 16,
    height: 10,
    topInitial: 5,
    topIncrement: 0,
    jobs: ["deploy"],
  },
  {
    left: 83.5,
    width: 16,
    height: 10,
    topInitial: 5,
    topIncrement: 0,
    jobs: ["stackhawk"],
  },
];

function initPipelineHotspots() {
  const hotspotContainer = document.getElementById("pipeline-hotspots");
  if (!hotspotContainer) return;

  hotspotContainer.innerHTML = "";

  PIPELINE_COLUMNS.forEach(
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
  const url = button.getAttribute("data-url");
  const description = button.getAttribute("data-description");

  if (nameBox && name) nameBox.innerText = name;
  if (linkAnchor && url) {
    // Validate protocol to prevent javascript: XSS execution
    try {
      const parsedUrl = new URL(url, window.location.origin);
      if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
        linkAnchor.href = parsedUrl.href;
        linkAnchor.textContent = parsedUrl.href.replace(/^https?:\/\//, "");
      }
    } catch {
      // Ignore invalid URLs gracefully
    }
  }
  if (descBox && description) descBox.innerText = description;
  if (dialog && typeof dialog.showModal === "function") {
    document.documentElement.classList.add("modal-is-open");
    dialog.showModal();
  }
}

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
