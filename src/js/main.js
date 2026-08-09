// --- Progressive Resume Image Swap (Non-Blocking) ---
function initResumeProgressiveLoad() {
  const highResUrl = "/resumes/hobbes3_resume_latest.webp";
  const resumeImg = document.getElementById("resume");

  if (!resumeImg) return;

  const bgLoader = new Image();
  bgLoader.src = highResUrl;

  bgLoader.onload = () => {
    resumeImg.src = highResUrl;
  };
}

if (document.readyState === "complete") {
  initResumeProgressiveLoad();
} else {
  window.addEventListener("load", initResumeProgressiveLoad);
}

// --- 2. Decoupled Static Markup Generator for 102 Lazy-Loaded Images ---
//document.addEventListener("DOMContentLoaded", () => {
//  const confContainer = document.getElementById("conf-pics");
//  const galleryContainer = document.getElementById("my-pics");
//
//  if (confContainer && !confContainer.hasChildNodes()) {
//    let confHTML = "";
//    for (let i = 1; i <= 6; i++) {
//      confHTML += `<img src="images/conf${i}.webp" width="500" height="500" alt="Conference image #${i}" loading="lazy">`;
//    }
//    confContainer.innerHTML = confHTML;
//  }
//
//  if (galleryContainer && !galleryContainer.hasChildNodes()) {
//    let galleryHTML = "";
//    for (let i = 1; i <= 96; i++) {
//      galleryHTML += `<img src="images/gallery/${i}.webp" width="500" height="500" alt="Gallery image #${i}" loading="lazy">`;
//    }
//    galleryContainer.innerHTML = galleryHTML;
//  }
//});

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
