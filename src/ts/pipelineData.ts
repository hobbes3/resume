export interface JobInfo {
  description: string;
  url: string;
}

export interface PipelineGroup {
  left: number;
  width: number;
  height: number;
  topInitial: number;
  topIncrement: number;
  jobs: string[];
}

export const PIPELINE_JOB_INFO = new Map<string, JobInfo>([
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
    "actionlint",
    {
      description:
        "Validates GitHub Actions workflow YAML files against static analysis rules and schemas.",
      url: "https://rhysd.github.io/actionlint/",
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
      url: "https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities/",
    },
  ],
  [
    "build",
    {
      description:
        "Compiles production static site assets using Vite, runs automated Node.js build scripts, and packages the dist/ artifact.",
      url: "https://vite.dev/",
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
      url: "https://anchore.com/opensource/",
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

export const PIPELINE_GROUPS: PipelineGroup[] = [
  {
    left: 0.5,
    width: 18,
    height: 10.5,
    topInitial: 7,
    topIncrement: 10.8,
    jobs: [
      "misspell",
      "prettier",
      "stylelint",
      "eslint",
      "actionlint",
      "betterleaks",
      "npm-audit",
    ],
  },
  {
    left: 22,
    width: 16.5,
    height: 10.5,
    topInitial: 7,
    topIncrement: 0,
    jobs: ["build"],
  },
  {
    left: 42,
    width: 18,
    height: 10.5,
    topInitial: 7,
    topIncrement: 10.8,
    jobs: ["html5validator", "codeql", "syft-grype", "lighthouse"],
  },
  {
    left: 43,
    width: 16,
    height: 10.5,
    topInitial: 68,
    topIncrement: 10,
    jobs: ["lychee"],
  },
  {
    left: 63.5,
    width: 16,
    height: 10.5,
    topInitial: 7,
    topIncrement: 0,
    jobs: ["deploy"],
  },
  {
    left: 83.5,
    width: 16,
    height: 10.5,
    topInitial: 7,
    topIncrement: 0,
    jobs: ["stackhawk"],
  },
];
