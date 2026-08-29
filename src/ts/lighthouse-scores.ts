import {
  getMetricRating,
  type LighthouseMetric as MetricKey,
} from "./lighthouse-score-colors";

type LighthouseMetric = {
  score: number;
  value: number;
};

type LighthouseScores = {
  FCP?: LighthouseMetric;
  LCP?: LighthouseMetric;
  TBT?: LighthouseMetric;
  CLS?: LighthouseMetric;
  SI?: LighthouseMetric;
};

const metricConfig = [
  { label: "FCP", id: "lighthouse-fcp", max: 10 },
  { label: "LCP", id: "lighthouse-lcp", max: 25 },
  { label: "TBT", id: "lighthouse-tbt", max: 30 },
  { label: "CLS", id: "lighthouse-cls", max: 25 },
  { label: "SI", id: "lighthouse-si", max: 10 },
] as const;

export function initLighthouseScores(): void {
  const rawJsonPath = "/reports/lhr-scores.json";

  fetch(rawJsonPath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to fetch Lighthouse scores: ${response.status}`,
        );
      }
      return response.json() as Promise<
        LighthouseScores & { datetime?: string }
      >;
    })
    .then((scores) => {
      const datetimeElement = document.getElementById("lighthouse-datetime");
      if (datetimeElement && typeof scores.datetime === "string") {
        datetimeElement.textContent = scores.datetime;
      }

      metricConfig.forEach(({ label, id, max }) => {
        const element = document.getElementById(id);
        if (!element) return;

        let metric: LighthouseMetric | undefined;
        switch (label) {
          case "FCP":
            metric = scores.FCP;
            break;
          case "LCP":
            metric = scores.LCP;
            break;
          case "TBT":
            metric = scores.TBT;
            break;
          case "CLS":
            metric = scores.CLS;
            break;
          case "SI":
            metric = scores.SI;
            break;
          default:
            metric = undefined;
        }

        const score = metric?.score;
        if (typeof score === "number") {
          const normalizedValue = Number.isInteger(score)
            ? score
            : Number(score.toFixed(2));
          element.textContent = String(normalizedValue);
        }

        if (metric && typeof metric.value === "number") {
          const rating = getMetricRating(label as MetricKey, metric.value);
          element.style.color = rating.color;
        }

        const suffix = element.nextSibling;
        if (suffix && suffix.nodeType === Node.TEXT_NODE) {
          suffix.textContent = `/${max}`;
        }
      });
    })
    .catch((error) => {
      console.error("Unable to load Lighthouse scores", error);
    });
}
