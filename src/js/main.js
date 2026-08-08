// Swapping placeholder gallery images
const totalPhotos = 96;
const galleryContainer = document.getElementById("my-pics");
const galleryDetails = document.getElementById("gallery-details");

let isGalleryLoaded = false;

// 1. Populate initial 96 blank placeholder divs on startup
function initPlaceholders() {
  if (!galleryContainer) return;
  let placeholdersHTML = "";
  for (let i = 1; i <= totalPhotos; i++) {
    placeholdersHTML += `<div class="gallery-placeholder" id="placeholder-${i}"></div>`;
  }
  galleryContainer.innerHTML = placeholdersHTML;
}

// 2. Sequentially swap placeholders with real images when opened
function loadGalleryImages() {
  if (isGalleryLoaded || !galleryContainer) return;
  isGalleryLoaded = true;

  let index = 1;
  const batchSize = 12; // Load in smooth chunks to keep main thread light

  function loadNextBatch() {
    if (index > totalPhotos) return;

    requestAnimationFrame(() => {
      const endIndex = Math.min(index + batchSize - 1, totalPhotos);

      for (let i = index; i <= endIndex; i++) {
        const placeholder = document.getElementById(`placeholder-${i}`);
        if (placeholder) {
          const img = document.createElement("img");
          img.src = `images/gallery/${i}.webp`;
          img.width = 500;
          img.height = 500;
          img.alt = `Gallery image #${i}`;
          img.loading = "lazy";

          placeholder.replaceWith(img);
        }
      }

      index = endIndex + 1;
      if (index <= totalPhotos) {
        setTimeout(loadNextBatch, 50); // Small yield interval between batches
      }
    });
  }

  loadNextBatch();
}

// Initialize placeholders immediately on page load
initPlaceholders();

// Listen for the user opening the <details> accordion
if (galleryDetails) {
  galleryDetails.addEventListener("toggle", () => {
    if (galleryDetails.open) {
      loadGalleryImages();
    }
  });
}

// Progressive resume image swap (LQIP strategy)
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
