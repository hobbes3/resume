// Gallery Lazy Loading State
const totalPhotos = 96;
const chunkSize = 6;
let currentIndex = 1;

const galleryContainer = document.getElementById("my-pics");

function loadMorePhotos() {
  if (currentIndex > totalPhotos) return;

  const endIndex = Math.min(currentIndex + chunkSize - 1, totalPhotos);
  let imagesHTML = "";

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

  galleryContainer.insertAdjacentHTML("beforeend", imagesHTML);
  currentIndex = endIndex + 1;

  if (currentIndex <= totalPhotos) {
    observer.observe(galleryContainer.lastElementChild);
  }
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

// Force-load the first 6 photos immediately on script execution
loadMorePhotos();

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
