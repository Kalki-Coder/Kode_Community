document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
       1. DARK MODE TOGGLE
       ========================================= */
  const toggle = document.getElementById("dm-toggle");
  const body = document.body;

  // Helper function to apply theme
  const applyTheme = (isDark) => {
    // MATCHING CSS: Uses 'dark-mode' class to match your style.css
    body.classList.toggle("dark-mode", isDark);

    // Save to browser storage
    localStorage.setItem("site-dark", isDark ? "1" : "0");

    // Update button icon
    if (toggle) toggle.textContent = isDark ? "🌙" : "☀️";
  };

  // Load saved preference
  const savedTheme = localStorage.getItem("site-dark") === "1";
  applyTheme(savedTheme);

  if (toggle) {
    toggle.addEventListener("click", () => {
      const isDarkNow = body.classList.contains("dark-mode");
      applyTheme(!isDarkNow);
    });
  }

  /* =========================================
       2. IMAGE SLIDER (With Timer Reset)
       ========================================= */
  const slider = document.querySelector(".slider");
  if (slider) {
    const slides = slider.querySelectorAll(".slide");
    const prev = slider.querySelector(".prev");
    const next = slider.querySelector(".next");
    let idx = 0;
    let slideInterval;

    const showSlide = (i) => {
      // Ensure index wraps around correctly
      if (i >= slides.length) idx = 0;
      else if (i < 0) idx = slides.length - 1;
      else idx = i;

      slides.forEach((s, si) => s.classList.toggle("active", si === idx));
    };

    const nextSlide = () => showSlide(idx + 1);
    const prevSlide = () => showSlide(idx - 1);

    // Start Auto-play
    const startTimer = () => {
      slideInterval = setInterval(nextSlide, 4000);
    };

    // Reset Auto-play (prevents jumping if user clicks button)
    const resetTimer = () => {
      clearInterval(slideInterval);
      startTimer();
    };

    // Initialize
    showSlide(idx);
    startTimer();

    if (prev) {
      prev.addEventListener("click", () => {
        prevSlide();
        resetTimer();
      });
    }
    if (next) {
      next.addEventListener("click", () => {
        nextSlide();
        resetTimer();
      });
    }
  }

  /* =========================================
       3. EVENTS FILTER
       ========================================= */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const eventItems = document.querySelectorAll(".event-item"); // Assuming card class is event-item

  if (filterBtns.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove active class from all buttons
        filterBtns.forEach((b) => b.classList.remove("active"));
        // Add active to clicked button
        btn.classList.add("active");

        const category = btn.dataset.cat;

        eventItems.forEach((item) => {
          // Check if item matches category or if category is 'all'
          // Note: Your HTML items need data-cat="technical" etc.
          if (category === "all" || item.dataset.cat === category) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        });
      });
    });
  }

  /* =========================================
       4. CONTACT FORM VALIDATION
       ========================================= */
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Get fields safely
      const nameInput = form.querySelector('[name="name"]');
      const emailInput = form.querySelector('[name="email"]');
      const msgInput = form.querySelector('[name="message"]');
      const errorDiv = document.getElementById("form-errors");
      const successDiv = document.getElementById("form-success");

      // Reset messages
      if (errorDiv) {
        errorDiv.style.display = "none";
        errorDiv.textContent = "";
      }
      if (successDiv) {
        successDiv.style.display = "none";
        successDiv.textContent = "";
      }

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const msg = msgInput ? msgInput.value.trim() : "";

      // Validation Logic
      if (
        name.length < 2 ||
        !/^[^@]+@[^@]+\.[^@]+$/.test(email) ||
        msg.length < 10
      ) {
        if (errorDiv) {
          errorDiv.textContent =
            "Please fill all fields correctly. (Name > 2 chars, valid email, Msg > 10 chars)";
          errorDiv.style.display = "block";
        } else {
          alert("Please check your inputs.");
        }
        return;
      }

      // Success (Simulation)
      if (successDiv) {
        successDiv.textContent = "Message sent successfully!";
        successDiv.style.display = "block";
      } else {
        alert("Message sent!");
      }
      form.reset();
    });
  }

  /* =========================================
       5. SCROLL REVEAL (Intersection Observer)
       ========================================= */
  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active"); // Matches CSS .reveal.active
          observer.unobserve(entry.target); // Stop watching once revealed
        }
      });
    },
    {
      root: null,
      threshold: 0.15, // Trigger when 15% of element is visible
      rootMargin: "0px",
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
});
