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
  const linkAnchor = document.getElementById("job-link");
  const descBox = document.getElementById("job-description");
  const name = button.getAttribute("aria-label");
  const url = button.dataset.url;
  const description = button.dataset.description;

  if (name) {
    nameBox.innerText = name;
  }
  if (url) {
    const displayUrl = url.replace(/^https?:\/\//, "");
    linkAnchor.href = url;
    linkAnchor.textContent = displayUrl;
  }
  if (description) {
    descBox.innerText = description;
  }

  // Open Pico CSS modal and add html class
  const dialog = document.querySelector("dialog");
  if (dialog && typeof dialog.showModal === "function") {
    document.documentElement.classList.add("modal-is-open");
    dialog.showModal();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const hotspots = document.querySelectorAll("button.hotspot");
  const dialog = document.querySelector("dialog");

  // Attach click listener to all hotspot buttons
  hotspots.forEach((button) => {
    button.addEventListener("click", () => updateJobInfo(button));
  });

  if (dialog) {
    // Helper function to handle closing cleanup
    const closeModal = () => {
      document.documentElement.classList.remove("modal-is-open");
      dialog.close();
    };

    // Close button (X) listener
    const closeBtn = dialog.querySelector("button[aria-label='Close']");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    // Close when clicking on the backdrop outside the modal article
    dialog.addEventListener("click", (event) => {
      const rect = dialog.querySelector("article").getBoundingClientRect();
      const isInDialog =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;

      if (!isInDialog) {
        closeModal();
      }
    });

    // Handle ESC key press (native dialog close event)
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("modal-is-open");
    });
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
