// --- 1. Gallery Lazy Loading (Optimized for TBT) ---
const totalPhotos = 96;
const chunkSize = 6;
let currentIndex = 1;

const galleryContainer = document.getElementById("my-pics");

function loadMorePhotos() {
  if (!galleryContainer || currentIndex > totalPhotos) return;

  const endIndex = Math.min(currentIndex + chunkSize - 1, totalPhotos);
  let imagesHTML = "";

  // Keep chunk execution lightweight to avoid blocking the main thread
  for (let i = currentIndex; i <= endIndex; i++) {
    imagesHTML += `
      <img
        src="images/gallery/${i}.webp"
        width="500"
        height="500"
        alt="Gallery image #${i}"
        loading="lazy"
      />
    `;
  }

  // Use requestAnimationFrame to ensure DOM insertion happens during a safe paint window
  requestAnimationFrame(() => {
    galleryContainer.insertAdjacentHTML("beforeend", imagesHTML);
    currentIndex = endIndex + 1;

    if (currentIndex <= totalPhotos && galleryContainer.lastElementChild) {
      observer.observe(galleryContainer.lastElementChild);
    }
  });
}

// Set up Intersection Observer for subsequent batches on scroll
const observerOptions = {
  root: null,
  rootMargin: "200px",
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      loadMorePhotos();
    }
  });
}, observerOptions);

// Initialize the first gallery chunk non-blockingly
requestAnimationFrame(() => {
  loadMorePhotos();
});

// --- 2. Progressive Resume Image Swap (LQIP Strategy) ---
function initResumeProgressiveLoad() {
  const highResUrl = "/resumes/hobbes3_resume_latest.webp";
  const resumeImg = document.getElementById("resume");

  if (!resumeImg) return;

  // Silently preload in the background via a <link> header tag for network priority
  const preloadLink = document.createElement("link");
  preloadLink.rel = "preload";
  preloadLink.as = "image";
  preloadLink.href = highResUrl;
  document.head.appendChild(preloadLink);

  // Once cached in the background, swap the low-res mobile src with the high-res asset
  const bgLoader = new Image();
  bgLoader.src = highResUrl;
  bgLoader.onload = () => {
    resumeImg.src = highResUrl;
  };
}

// Trigger the high-res preload and swap shortly after the full DOM/assets load
if (document.readyState === "complete") {
  setTimeout(initResumeProgressiveLoad, 150);
} else {
  window.addEventListener("load", () => {
    setTimeout(initResumeProgressiveLoad, 150);
  });
}
