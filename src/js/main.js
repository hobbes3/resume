// Gallery Lazy Loading State
const totalPhotos = 96;
const chunkSize = 6;
let currentIndex = 1;

const galleryContainer = document.getElementById("my-pics");

function loadMorePhotos() {
  if (currentIndex > totalPhotos) return;

  const endIndex = Math.min(currentIndex + chunkSize - 1, totalPhotos);
  let imagesHTML = "";

  // Keep chunk execution extremely lightweight to avoid blocking the main thread
  for (let i = currentIndex; i <= endIndex; i++) {
    imagesHTML += `
      <img
        src="images/gallery/${i}.webp"
        width="500"
        height="500"
        alt="Gallery image #${i}"
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

// Initialize the first chunk non-blockingly
requestAnimationFrame(() => {
  loadMorePhotos();
});

// Copy email icon
const wrapper = document.querySelector(".tooltip-wrapper");
if (wrapper) {
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

// Preload high-res resume image after page load and silently swap the low-res version out
function initPreloadAndSwap() {
  const highResUrl = "/resumes/hobbes3_resume_latest.webp";
  const resumeImg = document.getElementById("resume");

  // 1. Silently preload in the background via <link> header tag
  const preloadLink = document.createElement("link");
  preloadLink.rel = "preload";
  preloadLink.as = "image";
  preloadLink.href = highResUrl;
  document.head.appendChild(preloadLink);

  // 2. Once the image is cached, swap the <img> src attribute
  if (resumeImg) {
    const bgLoader = new Image();
    bgLoader.src = highResUrl;
    bgLoader.onload = () => {
      resumeImg.src = highResUrl;
    };
  }
}

if (document.readyState === "complete") {
  // A tight 150ms buffer is plenty for post-load settling
  setTimeout(initPreloadAndSwap, 100);
} else {
  window.addEventListener("load", () => {
    setTimeout(initPreloadAndSwap, 100);
  });
}
