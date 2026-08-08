// Gallery
const gallery_pics = 96;
const resumeImg = document.getElementById("resume");

function renderGallery() {
  let imagesHTML = "";
  for (let i = 1; i <= gallery_pics; i++) {
    imagesHTML +=
      '\n<img src="images/gallery/' +
      i +
      '.webp" alt="Gallery image #' +
      i +
      '" fetchpriority="low" />';
  }
  document.getElementById("my-pics").innerHTML = imagesHTML;
}

// If the resume image is already loaded, render the gallery immediately
if (resumeImg && resumeImg.complete) {
  renderGallery();
} else if (resumeImg) {
  // Otherwise, wait until it fires the 'load' event
  resumeImg.addEventListener("load", renderGallery);

  // Optional fallback: load gallery anyway if resume image fails to load
  resumeImg.addEventListener("error", renderGallery);
} else {
  // Fallback in case resume image element isn't found
  renderGallery();
}

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
