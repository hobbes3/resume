// --- 1. Progressive Resume Image Swap (Immediate Execution) ---
function initResumeProgressiveLoad() {
  const highResUrl = "/resumes/hobbes3_resume_latest.webp";
  const resumeImg = document.getElementById("resume");

  if (!resumeImg) return;

  const bgLoader = new Image();
  bgLoader.src = highResUrl;

  bgLoader.onload = () => {
    // Swap to high-res resume immediately when ready
    resumeImg.src = highResUrl;

    // Once the resume is swapped, queue background loading safely
    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadBackgroundImages);
    } else {
      setTimeout(loadBackgroundImages, 200);
    }
  };
}

if (document.readyState === "complete") {
  initResumeProgressiveLoad();
} else {
  window.addEventListener("load", initResumeProgressiveLoad);
}

// --- 2. Silent Background Image Loader (Deferred) ---
const totalPhotos = 96;
const totalConfPhotos = 6;
const galleryContainer = document.getElementById("my-pics");
const confContainer = document.getElementById("conf-pics");

function loadBackgroundImages() {
  // Inject Conference Images
  if (confContainer && !confContainer.hasChildNodes()) {
    let confHTML = "";
    for (let i = 1; i <= totalConfPhotos; i++) {
      confHTML += `<img src="images/conf${i}.webp" width="500" height="500" alt="Conference image #${i}">`;
    }
    confContainer.innerHTML = confHTML;
  }

  // Inject Gallery Images in smooth chunks via requestAnimationFrame
  if (galleryContainer && !galleryContainer.hasChildNodes()) {
    let index = 1;
    const batchSize = 16;

    function loadNextBatch() {
      if (index > totalPhotos) return;

      requestAnimationFrame(() => {
        const endIndex = Math.min(index + batchSize - 1, totalPhotos);
        let batchHTML = "";

        for (let i = index; i <= endIndex; i++) {
          batchHTML += `<img src="images/gallery/${i}.webp" width="500" height="500" alt="Gallery image #${i}">`;
        }

        galleryContainer.insertAdjacentHTML("beforeend", batchHTML);

        index = endIndex + 1;
        if (index <= totalPhotos) {
          setTimeout(loadNextBatch, 30);
        }
      });
    }

    loadNextBatch();
  }
}

// --- 3. Copy Email Icon Animation ---
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
