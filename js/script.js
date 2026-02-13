document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initLanguage(); // New i18n init
  initMobileMenu();
  initActiveLink();
  
  // Page specific inits
  if (document.querySelector(".slider-section") || document.querySelector(".slider")) initSlider();
  if (document.querySelector(".filters")) initFilters();
  if (document.getElementById("contact-form")) initForm();
});

/* --- 0. Language i18n --- */
function initLanguage() {
  const toggleBtn = document.getElementById("lang-toggle");
  
  // 1. Get saved language or default to 'en'
  let currentLang = localStorage.getItem("lang") || "en";
  updateContent(currentLang);
  updateToggleButton(currentLang);

  // 2. Toggle Event Listener
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      // Switch en <-> jp
      currentLang = currentLang === "en" ? "jp" : "en";
      
      // Save and Update
      localStorage.setItem("lang", currentLang);
      updateContent(currentLang);
      updateToggleButton(currentLang);
    });
  }

  function updateToggleButton(lang) {
    if(!toggleBtn) return;
    // If current is 'en', button should show 'JP' to switch, and vice versa.
    // Or just show current language. The request said "Language Toggle button".
    // Using the translations object to set the button text based on current lang
    // e.g., if Lang is EN, button says "JP" (from translations.en.nav.toggle)
    const key = "nav.toggle";
    try {
      const text = key.split('.').reduce((obj, k) => obj && obj[k], translations[lang]);
      if(text) toggleBtn.textContent = text;
    } catch(e) {
      console.warn("Missing toggle translation");
    }
  }
}

// Global function to update all text
function updateContent(lang) {
  // Select all elements with data-i18n
  const elements = document.querySelectorAll("[data-i18n]");
  
  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    // Split key e.g "hero.title" -> ["hero", "title"]
    const keys = key.split(".");
    
    // Traverse translations object safely
    let text = null;
    try {
      text = keys.reduce((obj, k) => obj[k], translations[lang]);
    } catch (e) {
      // Key not found or intermediate value is not an object
      text = null;
    }

    // Update text if found
    if (text) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else if (el.tagName === 'IMG') {
        el.alt = text;
      } else if (el.tagName === 'TITLE') {
        el.textContent = text;
      } else {
        el.innerHTML = text; // Support HTML tags like <strong>
      }
    } else {
      console.warn(`Missing translation for key: ${key}`);
    }
  });

  // Update html lang attribute
  document.documentElement.lang = lang;
}

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

/* --- 8. Event Manager (New) --- */
/* --- 8. Event Manager (New) --- */
class EventManager {
  constructor() {
    this.storageKey = 'community_events';
    this.defaultEvents = [
      {
        id: 'ev-1',
        title: 'Advanced JS Patterns',
        date: '2026-10-20',
        cat: 'workshop',
        status: 'In-Person',
        statusKey: 'events.cards.js.status',
        catKey: 'events.cards.js.cat',
        titleKey: 'events.cards.js.title',
        descKey: 'events.cards.js.desc',
        desc: 'Deep dive into ES6+, Async/Await, and closure patterns for production code.',
        btnKey: 'events.cards.js.btn'
      },
      {
        id: 'ev-2',
        title: 'Tech Industry Leads',
        date: '2026-11-20',
        cat: 'meetup',
        status: 'Networking',
        statusKey: 'events.cards.leads.status',
        catKey: 'events.cards.leads.cat',
        titleKey: 'events.cards.leads.title',
        descKey: 'events.cards.leads.desc',
        desc: 'Lightning talks and networking with engineers from top local tech firms.',
        btnKey: 'events.cards.leads.btn'
      },
      {
        id: 'ev-3',
        title: 'Scalable Design Systems',
        date: '2026-12-20',
        cat: 'webinar',
        status: 'Live Stream',
        statusKey: 'events.cards.design.status',
        catKey: 'events.cards.design.cat',
        titleKey: 'events.cards.design.title',
        descKey: 'events.cards.design.desc',
        desc: 'Building atomic design components using React.',
        btnKey: 'events.cards.design.btn',
        extraClass: 'status-live'
      },
      {
        id: 'ev-4',
        title: 'React Ecosystem',
        date: '2027-01-20',
        cat: 'workshop',
        status: 'In-Person',
        statusKey: 'events.cards.react.status',
        catKey: 'events.cards.react.cat',
        titleKey: 'events.cards.react.title',
        descKey: 'events.cards.react.desc',
        desc: 'From Hooks to State Management. Building your first scalable Web App.',
        btnKey: 'events.cards.react.btn'
      },
      {
        id: 'ev-5',
        title: 'Winter Code Fest',
        date: '2027-02-20',
        cat: 'hackathon',
        status: 'Flagship',
        statusKey: 'events.cards.hackathon.status',
        catKey: 'events.cards.hackathon.cat',
        titleKey: 'events.cards.hackathon.title',
        descKey: 'events.cards.hackathon.desc',
        desc: '24-hour coding sprint. Build, ship, and win industry recognition.',
        btnKey: 'events.cards.hackathon.btn',
        extraClass: 'status-hot'
      }
    ];
    
    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.renderEvents();
  }

  cacheDOM() {
    this.grid = document.getElementById('events-grid');
    this.addBtn = document.getElementById('add-event-btn');
    this.modal = document.getElementById('event-modal');
    this.closeBtn = this.modal?.querySelector('.close-modal');
    this.form = document.getElementById('event-form');
  }

  bindEvents() {
    if(!this.grid) return;

    // Modal Triggers
    if(this.addBtn) this.addBtn.addEventListener('click', () => this.openModal());
    if(this.closeBtn) this.closeBtn.addEventListener('click', () => this.closeModal());
    
    // Close on outside click
    if(this.modal) {
      this.modal.addEventListener('click', (e) => {
        if(e.target === this.modal) this.closeModal();
      });
    }

    // Form Submit
    if(this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    // Grid Delegate for Actions
    this.grid.addEventListener('click', (e) => {
      // Toggle Menu
      if(e.target.closest('.menu-trigger')) {
        e.stopPropagation();
        const trigger = e.target.closest('.menu-trigger');
        const menu = trigger.nextElementSibling;
        
        // Close others
        document.querySelectorAll('.action-menu.active').forEach(m => {
          if(m !== menu) m.classList.remove('active');
        });
        
        menu.classList.toggle('active');
      } 
      // Handle Edit/Delete
      else if(e.target.closest('.btn-delete')) {
        const id = e.target.closest('.btn-delete').dataset.id;
        this.deleteEvent(id);
      }
      else if(e.target.closest('.btn-edit')) {
        const id = e.target.closest('.btn-edit').dataset.id;
        this.editEvent(id);
      }
      else {
        // Close menus if clicking elsewhere
        document.querySelectorAll('.action-menu.active').forEach(m => m.classList.remove('active'));
      }
    });

    // Global click to close menus
    document.addEventListener('click', (e) => {
      if(!e.target.closest('.menu-trigger')) {
        document.querySelectorAll('.action-menu.active').forEach(m => m.classList.remove('active'));
      }
    });
  }

  openModal(isEdit = false) {
    this.modal.classList.add('active');
    const h2 = this.modal.querySelector('h2');
    const btn = this.form.querySelector('button span');
    
    // Update labels based on mode
    const keyTitle = isEdit ? 'events.modal.title_edit' : 'events.modal.title';
    const keyBtn = isEdit ? 'events.modal.update' : 'events.modal.submit';
    
    h2.setAttribute('data-i18n', keyTitle);
    btn.setAttribute('data-i18n', keyBtn);
    
    // Refresh texts immediately
    const lang = localStorage.getItem('lang') || 'en';
    if(window.updateContent) window.updateContent(lang);
  }

  closeModal() {
    this.modal.classList.remove('active');
    this.form.reset();
    delete this.form.dataset.editId; // Clear edit ID
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('ev-title').value.trim();
    const dateVal = document.getElementById('ev-date').value;
    const desc = document.getElementById('ev-desc').value.trim();
    const img = document.getElementById('ev-img').value.trim();

    // Validation
    if(!title || !dateVal || !desc) return;
    
    // Word Count Validation (8-15 words)
    const wordCount = desc.split(/\s+/).filter(word => word.length > 0).length;
    if(wordCount < 8 || wordCount > 15) {
      // Get error message from translations if possible, else fallback
      const lang = localStorage.getItem('lang') || 'en';
      let errorMsg = "Description must be between 8 and 15 words.";
      try {
         errorMsg = translations[lang].events.validation.desc_short; 
      } catch(e) {}
      
      showToast(errorMsg, "error");
      return;
    }

    const isEdit = !!this.form.dataset.editId;
    
    const eventData = {
      id: isEdit ? this.form.dataset.editId : Date.now().toString(),
      title,
      date: dateVal,
      cat: 'community',
      status: 'Community',
      desc,
      img,
      isUserGenerated: true
    };

    if (isEdit) {
      this.updateEvent(eventData);
      showToast("Event updated successfully!", "success");
    } else {
      this.saveEvent(eventData);
      showToast("Event published successfully!", "success");
    }

    this.renderEvents();
    this.closeModal();
    
    // Re-init filters
    if(window.initFilters) window.initFilters();
  }

  saveEvent(event) {
    const existing = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    existing.push(event);
    localStorage.setItem(this.storageKey, JSON.stringify(existing));
  }

  updateEvent(updatedEvent) {
    const existing = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const index = existing.findIndex(e => e.id === updatedEvent.id);
    if(index !== -1) {
      existing[index] = updatedEvent;
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
    }
  }

  deleteEvent(id) {
    if(!confirm('Are you sure you want to delete this event?')) return;
    
    const existing = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const filtered = existing.filter(e => e.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    
    this.renderEvents();
    showToast("Event deleted.", "success");
    if(window.initFilters) window.initFilters();
  }

  editEvent(id) {
    const existing = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const event = existing.find(e => e.id === id);
    if(!event) return;

    // Populate Form
    document.getElementById('ev-title').value = event.title;
    document.getElementById('ev-date').value = event.date;
    document.getElementById('ev-desc').value = event.desc;
    document.getElementById('ev-img').value = event.img || '';
    
    // Set Edit Mode
    this.form.dataset.editId = id;
    this.openModal(true);
  }

  getAllEvents() {
    const local = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    return [...this.defaultEvents, ...local];
  }

  renderEvents() {
    if(!this.grid) return;
    
    const events = this.getAllEvents();
    this.grid.innerHTML = events.map(ev => this.createCardHTML(ev)).join('');
    
    // Re-apply translations for dynamic content
    const currentLang = localStorage.getItem('lang') || 'en';
    if(window.updateContent) window.updateContent(currentLang);
  }

  createCardHTML(ev) {
    // Parse Date
    const dateObj = new Date(ev.date);
    const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = dateObj.getDate();

    // Determine attributes for i18n or raw text
    const titleAttr = ev.titleKey ? `data-i18n="${ev.titleKey}"` : '';
    const descAttr = ev.descKey ? `data-i18n="${ev.descKey}"` : '';
    const statusAttr = ev.statusKey ? `data-i18n="${ev.statusKey}"` : '';
    const catAttr = ev.catKey ? `data-i18n="${ev.catKey}"` : '';
    const btnAttr = ev.btnKey ? `data-i18n="${ev.btnKey}"` : '';
    
    const titleTxt = ev.title;
    const descTxt = ev.desc;
    const statusTxt = ev.status;
    const catTxt = ev.cat.charAt(0).toUpperCase() + ev.cat.slice(1); // Capitalize
    const btnTxt = "View Details"; 

    // Custom class for status
    const statusClass = ev.extraClass || '';

    // Action Menu for User Generated Events
    let actionMenu = '';
    if(ev.isUserGenerated) {
      actionMenu = `
        <div class="card-menu-container title-menu">
          <button class="menu-trigger" aria-label="Options">
            <i class="ri-more-2-fill"></i>
          </button>
          <div class="action-menu">
            <button class="menu-item btn-edit" data-id="${ev.id}">
              <i class="ri-edit-2-line"></i> <span data-i18n="events.actions.edit">Edit</span>
            </button>
            <button class="menu-item btn-delete" data-id="${ev.id}">
              <i class="ri-delete-bin-line"></i> <span data-i18n="events.actions.delete">Delete</span>
            </button>
          </div>
        </div>
      `;
    }

    return `
      <article class="card event-item" data-cat="${ev.cat}">
        <div class="card-header">
          <div class="date-badge">
            <span class="month">${month}</span>
            <span class="day">${day}</span>
          </div>
          <span class="status-tag ${statusClass}" ${statusAttr}>${statusTxt}</span>
        </div>
        <div class="card-body">
          <span class="category-label" ${catAttr}>${catTxt}</span>
          <div class="card-title-row">
            <h3 ${titleAttr}>${titleTxt}</h3>
            ${actionMenu}
          </div>
          <p ${descAttr}>${descTxt}</p>
          <div class="card-footer">
            <a href="#" class="event-link">
              <span ${btnAttr}>${ev.btnKey ? 'Secure Seat' : btnTxt}</span> 
              <i class="ri-arrow-right-line"></i>
            </a>
          </div>
        </div>
      </article>
    `;
  }
}

// Auto-init on page load if on events page
if(document.getElementById('events-grid')) {
  new EventManager();
}

/* --- 9. Gallery Manager (New) --- */
class GalleryManager {
  constructor() {
    this.storageKey = 'gallery_images';
    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.renderGallery();
  }

  cacheDOM() {
    this.grid = document.querySelector('.masonry-grid');
    this.addBtn = document.getElementById('add-photo-btn');
    this.modal = document.getElementById('gallery-modal');
    this.closeBtn = this.modal?.querySelector('.close-modal');
    this.form = document.getElementById('gallery-form');
  }

  bindEvents() {
    if(!this.grid) return;

    // Modal Triggers
    if(this.addBtn) this.addBtn.addEventListener('click', () => this.openModal());
    if(this.closeBtn) this.closeBtn.addEventListener('click', () => this.closeModal());
    
    // Close on outside click
    if(this.modal) {
      this.modal.addEventListener('click', (e) => {
        if(e.target === this.modal) this.closeModal();
      });
    }

    // Form Submit
    if(this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  openModal() {
    if(this.modal) this.modal.classList.add('active');
  }

  closeModal() {
    if(this.modal) this.modal.classList.remove('active');
    if(this.form) this.form.reset();
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const urlInput = document.getElementById('img-url');
    const captionInput = document.getElementById('img-caption');
    const catInput = document.getElementById('img-category');

    const url = urlInput.value.trim();
    const caption = captionInput.value.trim();
    const category = catInput.value;

    if(!this.validateImage(url)) {
      alert("Please enter a valid image URL (ending in .jpg, .png, .webp, etc.)");
      return;
    }

    const newImage = {
      id: Date.now().toString(),
      url,
      caption,
      category
    };

    this.saveImage(newImage);
    this.appendImage(newImage);
    this.closeModal();
    
    // Show Toast (reusing existing function)
    if(window.showToast) showToast("Photo added successfully!", "success");
  }

  validateImage(url) {
    return /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(url) || url.startsWith('data:image');
  }

  saveImage(image) {
    const existing = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    existing.push(image);
    localStorage.setItem(this.storageKey, JSON.stringify(existing));
  }

  getImages() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  renderGallery() {
    if(!this.grid) return;
    
    // Load stored images and append them
    const images = this.getImages();
    images.forEach(img => this.appendImage(img));
  }

  appendImage(imgData) {
    const div = document.createElement('div');
    // Using same classes as hardcoded items for consistency and masonry layout
    div.className = 'masonry-item fade-in-up'; 
    div.style.animationDelay = '0.1s'; // Default delay for new items

    // Capitalize category for display
    const catDisplay = imgData.category.charAt(0).toUpperCase() + imgData.category.slice(1);
    
    // Translation key for category if it matches standard ones
    const catKey = `gallery.cat_${imgData.category}`; 
    const catAttr = `data-i18n="${catKey}"`;

    div.innerHTML = `
      <div class="gallery-card" onclick="openLightbox(this)">
        <img src="${imgData.url}" alt="${imgData.caption}" loading="lazy" />
        <div class="card-overlay">
          <span class="category-pill" ${catAttr}>${catDisplay}</span>
          <h3>${imgData.caption}</h3>
          <i class="ri-fullscreen-line expand-icon"></i>
        </div>
      </div>
    `;

    this.grid.appendChild(div);
    
    // Re-run i18n to translate the new category label if needed
    const currentLang = localStorage.getItem('lang') || 'en';
    if(window.updateContent) window.updateContent(currentLang);
  }
}

// Auto-init for Gallery
if(document.querySelector('.masonry-grid')) {
  new GalleryManager();
}