document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMobileMenu();
  initActiveLink();
  
  // Page specific inits
  if (document.querySelector(".slider-container")) initSlider();
  if (document.querySelector(".filters")) initFilters();
  if (document.getElementById("contact-form")) initForm();
});

/* --- 1. Theme Manager --- */
function initTheme() {
  const toggleBtn = document.getElementById("dm-toggle");
  const body = document.body;
  
  // Check localStorage or System Pref
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    body.classList.add("dark-mode");
    updateIcon(true);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      const isDark = body.classList.contains("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      updateIcon(isDark);
    });
  }

  function updateIcon(isDark) {
    if (!toggleBtn) return;
    const icon = toggleBtn.querySelector("i");
    icon.className = isDark ? "ri-moon-fill" : "ri-sun-fill";
  }
}

/* --- 2. Mobile Menu --- */
function initMobileMenu() {
  const toggle = document.querySelector(".mobile-toggle");
  const nav = document.querySelector(".main-nav");
  const icon = toggle?.querySelector("i");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    const isOpen = nav.classList.contains("active");
    icon.className = isOpen ? "ri-close-line" : "ri-menu-3-line";
  });

  // Close when clicking a link
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
      icon.className = "ri-menu-3-line";
    });
  });
}

/* --- 3. Active Link Highlighter --- */
function initActiveLink() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(link => {
    // Exact match or root for index
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });
}

/* --- 4. Gallery Slider --- */
function initSlider() {
  const slides = document.querySelectorAll(".slide");
  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".prev");
  let current = 0;
  let timer;

  function showSlide(index) {
    slides.forEach(s => s.classList.remove("active"));
    
    // Loop logic
    if (index >= slides.length) current = 0;
    else if (index < 0) current = slides.length - 1;
    else current = index;

    slides[current].classList.add("active");
  }

  function next() {
    showSlide(current + 1);
    resetTimer();
  }

  function prev() {
    showSlide(current - 1);
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(next, 5000);
  }

  // Event Listeners
  if (nextBtn) nextBtn.addEventListener("click", next);
  if (prevBtn) prevBtn.addEventListener("click", prev);

  // Auto Start
  resetTimer();
}

/* --- 5. Event Filtering --- */
function initFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".event-item");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Visual State
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.dataset.cat;

      cards.forEach(card => {
        const cardCat = card.dataset.cat;
        if (category === "all" || category === cardCat) {
          card.style.display = "block";
          setTimeout(() => card.style.opacity = "1", 10);
        } else {
          card.style.opacity = "0";
          setTimeout(() => card.style.display = "none", 300);
        }
      });
    });
  });
}

/* --- 6. Form Handling & Toasts --- */
function initForm() {
  const form = document.getElementById("contact-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector("button");
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = `<i class="ri-loader-4-line"></i> Sending...`;

    // Simulate API
    setTimeout(() => {
      showToast("Message sent successfully!", "success");
      form.reset();
      btn.disabled = false;
      btn.innerHTML = originalText;
    }, 1500);
  });
}

function showToast(msg, type) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    background: var(--bg-surface);
    color: var(--text-main);
    padding: 1rem;
    margin-top: 1rem;
    border-radius: 8px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    border-left: 4px solid ${type === 'success' ? '#10b981' : '#ef4444'};
    display: flex; align-items: center; gap: 10px;
    animation: slideIn 0.3s ease;
  `;
  
  toast.innerHTML = `
    <i class="${type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}"></i>
    <span>${msg}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}