document.addEventListener("DOMContentLoaded", () => {
  // Load the 6 conference pictures first with high priority
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

  // Load the 96 gallery pictures with low priority and async/lazy loading
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

// CI check dropdown description
function updateJobInfo(button) {
  const nameBox = document.getElementById("job-name");
  const descBox = document.getElementById("job-description");
  const linkBox = document.getElementById("job-link");
  const name = button.getAttribute("aria-label");
  const description = button.dataset.description;
  const url = button.dataset.url;

  if (description) {
    nameBox.innerHTML = `<code>${name}</code>`;
    descBox.innerHTML = `${description}`;
  }
  if (url) {
    linkBox.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  } else {
    linkBox.innerHTML = `N/A`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const hotspots = document.querySelectorAll("button.hotspot");

  // Attach click listener to all buttons
  hotspots.forEach((button) => {
    button.addEventListener("click", () => updateJobInfo(button));
  });

  // Set default initial state using the first button (misspell)
  if (hotspots.length > 0) {
    updateJobInfo(hotspots[0]);
  }
});

// Copy email icon animation
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
