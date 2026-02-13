document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMobileMenu();
  initActiveLink();
  
  // Page specific inits
  if (document.querySelector(".slider-section") || document.querySelector(".slider")) initSlider();
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

/* --- 5. Event Filtering (FLIP Animation) --- */
function initFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = Array.from(document.querySelectorAll(".event-item"));

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Visual State for buttons
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.dataset.cat;
      filterCards(cards, category);
    });
  });
}

function filterCards(cards, category) {
  // 1. First: Record start positions of currently visible items
  const startPositions = new Map();
  cards.forEach(card => {
    if (card.style.display !== 'none') {
      const rect = card.getBoundingClientRect();
      startPositions.set(card, { top: rect.top, left: rect.left });
    }
  });

  // 2. Last: Apply layout changes (Toggle display)
  cards.forEach(card => {
    const cardCat = card.dataset.cat;
    const shouldShow = (category === "all" || category === cardCat);
    
    // Clear any previous transition styles to avoid unexpected behavior
    card.style.transition = 'none'; 
    card.style.opacity = shouldShow ? '1' : '0';
    card.style.display = shouldShow ? 'block' : 'none';
    card.style.transform = '';
  });

  // Force reflow to ensure display:none takes effect in layout
  document.body.offsetHeight;

  // 3. Invert & Play: Animate items to new positions
  cards.forEach(card => {
    // If card is visible now...
    if (card.style.display !== 'none') {
      const rect = card.getBoundingClientRect(); // New position
      
      // Case A: Card was visible before (Move)
      if (startPositions.has(card)) {
        const start = startPositions.get(card);
        const deltaX = start.left - rect.left;
        const deltaY = start.top - rect.top;

        // Apply Inverted Transform (visually put it back to old spot)
        if (deltaX !== 0 || deltaY !== 0) {
          card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
          
          // Play Animation to 0,0
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition = 'transform 0.4s cubic-bezier(0.2, 0, 0.2, 1)';
              card.style.transform = '';
            });
          });
        }
      } 
      // Case B: Card is new (Enter)
      else {
        // Start state for entry
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            card.style.transition = 'all 0.4s ease'; // Animate opacity and scale
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        });
      }
    }
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

/* --- 7. Gallery Lightbox --- */
// Exposed globally for HTML onclick attributes
window.openLightbox = function(element) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  
  // Get image source from the clicked card's image
  const img = element.querySelector('img');
  const title = element.querySelector('h3').textContent;
  
  if (img && lightbox && lightboxImg) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    if (caption) caption.textContent = title;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
};

window.closeLightbox = function() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }
};

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.closeLightbox();
});

// Close on clicking outside image
document.addEventListener('click', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (e.target === lightbox) window.closeLightbox();
});