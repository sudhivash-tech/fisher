/* =========================================================
   Novigo — script.js
   Shared behaviour that runs on every page. Each block checks
   whether its element actually exists before doing anything —
   that's why one file can safely be linked from all 10 pages
   without throwing errors on pages that don't have, say, a
   FAQ accordion.
   ========================================================= */

/* ---------------------------------------------------------
   1. DARK MODE TOGGLE
   We store the choice in localStorage so it survives page
   navigation and repeat visits — not just this one page load.
   --------------------------------------------------------- */
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// On every page load, check if the user previously chose a theme.
const savedTheme = localStorage.getItem('novigo-theme');
if (savedTheme) {
  applyTheme(savedTheme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('novigo-theme', next);
  });
}

/* ---------------------------------------------------------
   2. MOBILE MENU TOGGLE
   Opens/closes the nav-links dropdown on small screens.
   --------------------------------------------------------- */
const menuToggle = document.getElementById('mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen);
  });
}

/* ---------------------------------------------------------
   3. WELCOME POPUP (homepage only)
   Uses sessionStorage (not localStorage) on purpose — this
   resets every new browser session instead of being
   permanently dismissed forever after one click.
   --------------------------------------------------------- */
const welcomePopup = document.getElementById('welcome-popup');

if (welcomePopup) {
  const alreadySeen = sessionStorage.getItem('novigo-welcome-seen');

  if (!alreadySeen) {
    welcomePopup.classList.remove('hidden');
  }

  const closePopup = () => {
    welcomePopup.classList.add('hidden');
    sessionStorage.setItem('novigo-welcome-seen', 'true');
  };

  const popupCloseBtn = document.getElementById('popup-close');
  if (popupCloseBtn) {
    popupCloseBtn.addEventListener('click', closePopup);
  }

  // Also close if the user clicks the dark overlay outside the card
  welcomePopup.addEventListener('click', (event) => {
    if (event.target === welcomePopup) {
      closePopup();
    }
  });

  // Also close on Escape key, for keyboard users
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !welcomePopup.classList.contains('hidden')) {
      closePopup();
    }
  });
}

/* ---------------------------------------------------------
   4. FAQ ACCORDION
   Clicking a question toggles its own answer open/closed.
   Only one answer stays open at a time, which keeps a long
   FAQ list from turning into a wall of expanded text.
   --------------------------------------------------------- */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item) => {
  const question = item.querySelector('.faq-question');

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close every item first...
    faqItems.forEach((otherItem) => otherItem.classList.remove('open'));

    // ...then reopen this one, unless it was the one already open
    // (that's what makes clicking an open question close it again).
    if (!isOpen) {
      item.classList.add('open');
    }
  });
});

/* ---------------------------------------------------------
   5. SEARCH BAR FILTERING (Future Jobs + Nearby Academies)
   Simple substring match against each card's visible text.
   --------------------------------------------------------- */
function wireUpSearch(inputId, cardSelector) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    // Queried fresh on every keystroke — the jobs page renders its
    // cards from a fetched JSON file, so a snapshot taken at page
    // load would miss cards that hadn't arrived yet.
    const cards = document.querySelectorAll(cardSelector);

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(query) ? '' : 'none';
    });
  });
}

wireUpSearch('job-search', '.job-card');
wireUpSearch('academy-search', '.academy-card');

/* ---------------------------------------------------------
   6. SCROLL REVEAL
   IntersectionObserver watches every .reveal element and adds
   .in-view the moment it scrolls into the viewport — the
   fade/slide itself is defined in animations.css.
   --------------------------------------------------------- */
const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length > 0 && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // only needs to happen once per element
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach((el) => observer.observe(el));
} else {
  // No IntersectionObserver support (or nothing to reveal) — just show everything
  revealElements.forEach((el) => el.classList.add('in-view'));
}

/* ---------------------------------------------------------
   7. ANIMATED PROGRESS BARS
   Any .progress-bar with a data-target="NN" attribute fills
   from 0% to NN% shortly after the page loads, instead of
   just appearing already full.
   --------------------------------------------------------- */
const animatedBars = document.querySelectorAll('.progress-bar[data-target]');

if (animatedBars.length > 0) {
  window.addEventListener('load', () => {
    animatedBars.forEach((bar) => {
      const target = bar.getAttribute('data-target');
      // Small delay so the fill transition is visible rather than instant
      setTimeout(() => {
        bar.style.width = target + '%';
      }, 200);
    });
  });
}

/* ---------------------------------------------------------
   8. PROFILE FORM
   Saves the profile to localStorage (this is a prototype —
   no real backend) and moves the user on to the quiz, matching
   the planned flow: Profile → Quiz.
   --------------------------------------------------------- */
const profileForm = document.getElementById('profile-form');

if (profileForm) {
  profileForm.addEventListener('submit', (event) => {
    event.preventDefault(); // stop the browser's default page-reload submit

    const formData = new FormData(profileForm);
    const profile = Object.fromEntries(formData.entries());

    localStorage.setItem('novigo-profile', JSON.stringify(profile));

    window.location.href = 'quiz.html';
  });
}
