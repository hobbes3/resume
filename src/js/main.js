document.addEventListener("DOMContentLoaded", () => {
  // 1. Load the 6 conference pictures first with high priority
  const confContainer = document.getElementById("conf-pics");
  if (confContainer) {
    for (let i = 1; i <= 6; i++) {
      const img = document.createElement("img");
      img.src = `images/conf${i}.webp`;
      img.alt = "Splunk .conf";
      img.width = 200;
      img.height = 200;
      img.fetchPriority = "high";
      confContainer.appendChild(img);
    }
  }

  // 2. Load the 96 gallery pictures with low priority and async/lazy loading
  const galleryContainer = document.getElementById("my-pics");
  if (galleryContainer) {
    for (let i = 1; i <= 96; i++) {
      const img = document.createElement("img");
      img.src = `images/gallery/${i}.webp`; // Adjust path/naming convention to match your files
      img.alt = `Gallery picture ${i}`;
      img.width = 200;
      img.height = 200;
      img.fetchPriority = "low";
      img.decoding = "async";
      galleryContainer.appendChild(img);
    }
  }
});

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
