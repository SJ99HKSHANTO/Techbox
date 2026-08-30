/**
 * ==========================================================================
 * SCRIPT.JS - Modern & Responsive Blog Post Website JavaScript
 * ==========================================================================
 */

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc 
} from "firebase/firestore";

import { uiTranslations, localizedBlogPosts } from "./translations.js";

// --------------------------------------------------------------------------
// 0. Firebase Cloud Database & Authentication Configuration
// --------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDeygxYxcj89hqJHj_BfI9NDAUA7fuJark",
  authDomain: "singular-weaver-hx4wp.firebaseapp.com",
  projectId: "singular-weaver-hx4wp",
  firestoreDatabaseId: "ai-studio-modernblogpostwe-82e57f45-b486-4075-b803-6a766bb9bdab",
  storageBucket: "singular-weaver-hx4wp.firebasestorage.app",
  messagingSenderId: "700297471520",
  appId: "1:700297471520:web:53b3bd417fcec642c5fe45"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Primary Administrator Email (Authorized for direct live publishing)
const ADMIN_EMAIL = "shantoray049@gmail.com";

// Global State
let currentUser = null;
let isAdmin = false;
let cloudPosts = [];
let isAuthInProgress = false;
let currentLanguageCode = localStorage.getItem("user_preferred_lang") || "en";

// --------------------------------------------------------------------------
// 1. Initial Blog Posts Data
// --------------------------------------------------------------------------
const blogPosts = [
  {
    id: 0,
    title: "Building Modern Web Applications with Video Embeds and Rich Layouts",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
    video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    content: `
      Writing and formatting blog posts in this platform is effortless. You can write in regular paragraphs without writing a single line of complex code.

      Whenever you write multiple paragraphs, simply press Enter to add empty space, and the system will automatically format each paragraph cleanly with generous line spacing.

      Pasting any standard YouTube link automatically embeds an interactive video player directly at the top of the article!
    `,
    category: "Tutorial",
    isPopular: true
  },
  {
    id: 1,
    title: "Web Development Trends & Modern Engineering Tools in 2026",
    category: "Web Development",
    author: {
      name: "Rakibul Hassan",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    date: "August 27, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
    excerpt: "Explore the latest breakthroughs in frontend and backend architecture, including AI-driven developer tooling, serverless compute, and modern JavaScript engines.",
    content: `
      <p>The web development landscape continues to evolve at breakneck speed. In 2026, browser rendering engines and JavaScript optimizations have reached unprecedented levels of performance and fluidity. Web applications are now more interactive and responsive than ever before.</p>
      <blockquote>"Adapting to technological shifts while mastering core foundations is the hallmark of a resilient software engineer."</blockquote>
      <p>Today, AI integrations, modern CSS features such as container queries and subgrid, and fine-grained performance budgets have become essential daily tools for frontend engineers.</p>
      <p>For beginners and seasoned developers alike, the primary advice remains timeless: build a rock-solid understanding of foundational HTML, CSS, and modern JavaScript. Frameworks come and go, but the core web primitives remain constant.</p>
    `,
    tags: ["JavaScript", "WebDev", "Frontend", "Trends"],
    isPopular: true
  },
  {
    id: 2,
    title: "Mastering Pure CSS: High-Performance UI Design Without Frameworks",
    category: "Design",
    author: {
      name: "Farhana Ahmed",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
    },
    date: "August 25, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    excerpt: "Learn how to build lightweight, fast-loading, and visually captivating web interfaces using pure CSS Grid, Flexbox, and CSS Custom Properties.",
    content: `
      <p>Modern CSS is no longer merely a styling syntax; it is a complete, powerful design system engine. With CSS Custom Properties (Variables), building dark mode toggles and dynamic theme systems is remarkably straightforward.</p>
      <p>Combining Flexbox for directional layouts with CSS Grid for two-dimensional grids allows developers to build complex, responsive layouts with minimal code and zero external dependencies.</p>
      <blockquote>"Clean, semantic CSS not only boosts page load speeds, but also makes long-term code maintenance a breeze."</blockquote>
      <p>Reducing reliance on heavy external utility bundles and investing in native CSS features pays massive dividends throughout your career.</p>
    `,
    tags: ["CSS3", "Design", "UI/UX", "Responsive"],
    isPopular: true
  },
  {
    id: 3,
    title: "The Future of Artificial Intelligence in Software Engineering",
    category: "AI & Tech",
    author: {
      name: "Tanveer Mahmud",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
    },
    date: "August 22, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    excerpt: "How generative AI and large language models are amplifying developer productivity tenfold and reshaping the nature of programming.",
    content: `
      <p>Artificial intelligence has graduated from theoretical research labs to become an indispensable daily collaborator for software engineers. From automated test generation to intelligent code refactoring and rapid prototyping, AI assistants are accelerating workflows across industries.</p>
      <blockquote>"AI will not replace software developers, but developers who leverage AI effectively will outpace those who don't."</blockquote>
      <p>System architecture design, security modeling, and creative problem-solving still fundamentally require human intuition and critical thinking. The future belongs to those who master the art of prompt engineering and automated workflows.</p>
    `,
    tags: ["AI", "FutureTech", "Productivity"],
    isPopular: true
  },
  {
    id: 4,
    title: "Deep Dive into the JavaScript Event Loop and Asynchronous Execution",
    category: "Programming",
    author: {
      name: "Sakib Al Hasan",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
    },
    date: "August 19, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    excerpt: "Understand how the Call Stack, Microtask Queue, and Event Loop operate behind the scenes with practical async/await and Promise examples.",
    content: `
      <p>JavaScript is fundamentally a single-threaded language, yet thanks to the Event Loop, it handles high-throughput non-blocking I/O operations seamlessly.</p>
      <p>When an asynchronous network request or timer is initiated, the browser Web API handles it in the background and enqueues callbacks into either the Task Queue or Microtask Queue. Once the Call Stack clears, the Event Loop schedules these tasks one by one.</p>
      <blockquote>"A deep, intuitive grasp of the Event Loop is the defining milestone that elevates junior programmers into senior engineers."</blockquote>
    `,
    tags: ["JavaScript", "Programming", "Async"],
    isPopular: false
  },
  {
    id: 5,
    title: "10 Essential Principles for User-Friendly Mobile Responsive Design",
    category: "Design",
    author: {
      name: "Nusrat Jahan",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
    },
    date: "August 16, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80",
    excerpt: "Crucial tips on touch target sizing, fluid typography scaling, and mobile viewport performance optimization for handheld screens.",
    content: `
      <p>With over 60% of all global web traffic originating from mobile devices, designing with a mobile-first mindset is no longer optional. Ensuring a minimum 44px touch target prevents frustrating misclicks for thumb-driven navigation.</p>
      <p>Employing fluid typography with the CSS clamp() function allows text to scale smoothly according to viewport dimensions without requiring cumbersome media query breakpoints.</p>
      <blockquote>"Mobile-first design is not just an aesthetic constraint; it is a discipline in clarity and user empathy."</blockquote>
    `,
    tags: ["Mobile", "UI/UX", "Design", "CSS"],
    isPopular: false
  },
  {
    id: 6,
    title: "The Complete 2026 Roadmap to Becoming a Full-Stack Frontend Engineer",
    category: "Tutorial",
    author: {
      name: "Rakibul Hassan",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    date: "August 12, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=80",
    excerpt: "From semantic HTML5 and modern CSS Grid to vanilla JavaScript, state management, and Git collaboration—a comprehensive guide to launching your engineering career.",
    content: `
      <p>Many aspiring developers jump directly into heavy frameworks and feel overwhelmed. The most sustainable learning path is built on steady progression:</p>
      <ol style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
        <li>Semantic HTML5, Web Accessibility (ARIA), and SEO basics.</li>
        <li>CSS3 Flexbox, Grid, keyframe animations, and responsive layout patterns.</li>
        <li>Vanilla JavaScript DOM manipulation, Fetch API, and modern ES6+ features.</li>
        <li>Git version control, collaborative workflows, and live deployment platforms.</li>
      </ol>
      <blockquote>"Consistency in writing code every single day transforms beginners into master craftspeople."</blockquote>
    `,
    tags: ["Career", "Roadmap", "Tutorial", "WebDev"],
    isPopular: true
  }
];

// --------------------------------------------------------------------------
// 2. DOM Elements Selection
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const blogGrid = document.getElementById("blogGrid");
  const searchInput = document.getElementById("searchInput");
  const searchClearBtn = document.getElementById("searchClearBtn");
  const heroCategoryChips = document.querySelectorAll(".hero-categories .category-chip");
  const sidebarCategories = document.querySelectorAll(".category-list .category-item");
  const popularPostsContainer = document.getElementById("popularPostsList");
  const resultsCount = document.getElementById("resultsCount");
  
  // Theme Toggle Elements
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");

  // Mobile Hamburger Menu Elements
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navMenu = document.getElementById("navMenu");

  // Article Modal Elements
  const articleModal = document.getElementById("articleModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalHeroImg = document.getElementById("modalHeroImg");
  const modalCategoryBadge = document.getElementById("modalCategoryBadge");
  const modalTitle = document.getElementById("modalTitle");
  const modalMetaAuthor = document.getElementById("modalMetaAuthor");
  const modalMetaDate = document.getElementById("modalMetaDate");
  const modalMetaRead = document.getElementById("modalMetaRead");
  const modalContentText = document.getElementById("modalContentText");
  const modalShareCopy = document.getElementById("modalShareCopy");

  // Create Post Modal Elements
  const createPostModal = document.getElementById("createPostModal");
  const btnOpenCreatePost = document.getElementById("btnOpenCreatePost");
  const btnOpenCreatePost2 = document.getElementById("btnOpenCreatePost2");
  const closeCreatePostBtn = document.getElementById("closeCreatePostBtn");
  const btnCancelCreatePost = document.getElementById("btnCancelCreatePost");
  const createPostForm = document.getElementById("createPostForm");
  const postInputTitle = document.getElementById("postInputTitle");
  const postInputCategory = document.getElementById("postInputCategory");
  const postInputAuthor = document.getElementById("postInputAuthor");
  const postInputImage = document.getElementById("postInputImage");
  const postInputVideo = document.getElementById("postInputVideo");
  const postInputExcerpt = document.getElementById("postInputExcerpt");
  const postInputContent = document.getElementById("postInputContent");
  const postInputPopular = document.getElementById("postInputPopular");
  const imagePreviewContainer = document.getElementById("imagePreviewContainer");
  const imagePreview = document.getElementById("imagePreview");
  const btnRemovePreview = document.getElementById("btnRemovePreview");
  const presetChips = document.querySelectorAll(".preset-chip");
  const toastContainer = document.getElementById("toastContainer");

  // Auth & Profile Elements
  const authWrapper = document.getElementById("authWrapper");
  const btnAuth = document.getElementById("btnAuth");
  const authBtnText = document.getElementById("authBtnText");
  const userDropdownMenu = document.getElementById("userDropdownMenu");
  const userDropdownAvatar = document.getElementById("userDropdownAvatar");
  const userDropdownName = document.getElementById("userDropdownName");
  const userDropdownEmail = document.getElementById("userDropdownEmail");
  const userRoleBadge = document.getElementById("userRoleBadge");
  const btnOpenVisitorsModal = document.getElementById("btnOpenVisitorsModal");
  const btnLogout = document.getElementById("btnLogout");

  // Visitors Modal Elements (Admin Only)
  const visitorsModal = document.getElementById("visitorsModal");
  const closeVisitorsModalBtn = document.getElementById("closeVisitorsModalBtn");
  const totalVisitorsCount = document.getElementById("totalVisitorsCount");
  const visitorsTableBody = document.getElementById("visitorsTableBody");
  const btnRefreshVisitors = document.getElementById("btnRefreshVisitors");

  // Access Denied / Info Modal Elements
  const accessDeniedModal = document.getElementById("accessDeniedModal");
  const closeAccessDeniedBtn = document.getElementById("closeAccessDeniedBtn");
  const btnOkAccessDenied = document.getElementById("btnOkAccessDenied");
  const loggedVisitorName = document.getElementById("loggedVisitorName");
  const loggedVisitorEmail = document.getElementById("loggedVisitorEmail");

  // Toolbar Formatting Buttons
  const toolBold = document.getElementById("toolBold");
  const toolItalic = document.getElementById("toolItalic");
  const toolQuote = document.getElementById("toolQuote");
  const toolHeading = document.getElementById("toolHeading");
  const toolList = document.getElementById("toolList");

  // Newsletter Elements
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterEmail = document.getElementById("newsletterEmail");
  const newsletterMsg = document.getElementById("newsletterMsg");

  // Back to Top Button
  const backToTopBtn = document.getElementById("backToTopBtn");

  // Language Switcher Elements
  const langSwitcherWrapper = document.getElementById("langSwitcherWrapper");
  const langDropdownBtn = document.getElementById("langDropdownBtn");
  const langDropdownMenu = document.getElementById("langDropdownMenu");
  const currentLangLabel = document.getElementById("currentLangLabel");
  const langSearchInput = document.getElementById("langSearchInput");
  const langOptionsList = document.getElementById("langOptionsList");
  const langDetectorBanner = document.getElementById("langDetectorBanner");
  const langDetectorText = document.getElementById("langDetectorText");
  const btnTranslateConfirm = document.getElementById("btnTranslateConfirm");
  const btnTranslateDismiss = document.getElementById("btnTranslateDismiss");

  // Current Filter & User Interaction States
  let currentCategory = "all";
  let currentSearchQuery = "";
  let likedPosts = new Set();
  let bookmarkedPosts = new Set();

  // --------------------------------------------------------------------------
  // 3. Dark Mode & Light Mode Theme Handler
  // --------------------------------------------------------------------------
  function initTheme() {
    const savedTheme = localStorage.getItem("site_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("site_theme", newTheme);
    updateThemeIcon(newTheme);
  }

  function updateThemeIcon(theme) {
    if (themeIcon && themeToggleBtn) {
      if (theme === "dark") {
        themeIcon.className = "fas fa-sun";
        themeToggleBtn.setAttribute("title", "Switch to Light Mode");
      } else {
        themeIcon.className = "fas fa-moon";
        themeToggleBtn.setAttribute("title", "Switch to Dark Mode");
      }
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }
  initTheme();

  // --------------------------------------------------------------------------
  // 4. Global Language Translation & Switcher Handler
  // --------------------------------------------------------------------------
  const languageNamesMap = {
    "en": "English",
    "bn": "বাংলা",
    "es": "Español",
    "ar": "العربية",
    "hi": "हिन्दी",
    "fr": "Français",
    "de": "Deutsch",
    "zh-CN": "中文",
    "ja": "日本語",
    "ru": "Русский",
    "pt": "Português",
    "tr": "Türkçe",
    "it": "Italiano",
    "ko": "한국어",
    "ur": "اردو",
    "id": "Bahasa Indonesia",
    "vi": "Tiếng Việt"
  };

  // Translation String Lookup Helper
  function t(key, fallback = "") {
    const langDict = uiTranslations[currentLanguageCode] || uiTranslations["en"] || {};
    if (langDict[key] !== undefined) {
      return langDict[key];
    }
    const defaultDict = uiTranslations["en"] || {};
    return defaultDict[key] !== undefined ? defaultDict[key] : fallback;
  }

  // Update all DOM elements with data-i18n attributes
  function translateInterface(langCode) {
    currentLanguageCode = langCode || "en";
    document.documentElement.lang = currentLanguageCode;
    const isRtl = (currentLanguageCode === "ar" || currentLanguageCode === "ur" || currentLanguageCode === "fa" || currentLanguageCode === "he");
    document.documentElement.dir = isRtl ? "rtl" : "ltr";

    // Update page meta title
    const metaTitle = t("meta_title", "TechBlog - Modern Tech, Design & Web Development Journal");
    if (metaTitle) {
      document.title = metaTitle;
    }

    // Direct logo branding replacement across header and footer
    const brandLogoHtml = t("brand_logo_text", "Tech<span>Blog</span>");
    const logoElements = document.querySelectorAll(".logo-text, [data-i18n='brand_logo_text']");
    logoElements.forEach(el => {
      el.innerHTML = brandLogoHtml;
    });

    // Update text content of tagged elements
    const i18nElements = document.querySelectorAll("[data-i18n]");
    i18nElements.forEach(el => {
      const key = el.getAttribute("data-i18n");
      const translation = t(key);
      if (translation) {
        el.innerHTML = translation;
      }
    });

    // Update placeholders
    const i18nPlaceholders = document.querySelectorAll("[data-i18n-placeholder]");
    i18nPlaceholders.forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      const translation = t(key);
      if (translation) {
        el.setAttribute("placeholder", translation);
      }
    });

    // Update tooltips and titles
    const i18nTitles = document.querySelectorAll("[data-i18n-title]");
    i18nTitles.forEach(el => {
      const key = el.getAttribute("data-i18n-title");
      const translation = t(key);
      if (translation) {
        el.setAttribute("title", translation);
        el.setAttribute("aria-label", translation);
      }
    });

    // Update Sign In / Auth Button UI with localized text
    updateAuthUI();
  }

  // Update Authentication Button & User Profile according to Auth State and Current Language
  function updateAuthUI() {
    if (!btnAuth) return;
    if (currentUser) {
      btnAuth.classList.add("logged-in");
      const firstName = currentUser.displayName ? currentUser.displayName.split(" ")[0] : (currentUser.email ? currentUser.email.split("@")[0] : t("role_reader", "Profile"));
      btnAuth.innerHTML = `
        <img src="${currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" class="user-nav-avatar" alt="${currentUser.displayName || 'User'}" />
        <span>${firstName}</span>
        <i class="fas fa-chevron-down" style="font-size: 0.75rem; margin-left: 0.2rem;"></i>
      `;
      btnAuth.setAttribute("title", currentUser.displayName || currentUser.email || t("role_reader", "Profile"));
      btnAuth.setAttribute("aria-label", currentUser.displayName || currentUser.email || t("role_reader", "Profile"));

      if (userDropdownAvatar) userDropdownAvatar.src = currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
      if (userDropdownName) userDropdownName.textContent = currentUser.displayName || t("role_reader", "Anonymous Reader");
      if (userDropdownEmail) userDropdownEmail.textContent = currentUser.email || "No email available";

      if (userRoleBadge) {
        if (isAdmin) {
          userRoleBadge.textContent = t("role_admin", "👑 Editor-in-Chief (Admin)");
          userRoleBadge.className = "user-role-badge admin-badge";
        } else {
          userRoleBadge.textContent = t("role_reader", "Reader");
          userRoleBadge.className = "user-role-badge";
        }
      }

      if (btnOpenVisitorsModal) {
        btnOpenVisitorsModal.style.display = isAdmin ? "flex" : "none";
      }
    } else {
      btnAuth.classList.remove("logged-in");
      const signInLabel = t("btn_sign_in", "Sign In");
      const signInTitle = t("btn_sign_in_title", "Sign in with Google");
      btnAuth.innerHTML = `
        <i class="fab fa-google"></i>
        <span id="authBtnText" data-i18n="btn_sign_in">${signInLabel}</span>
      `;
      btnAuth.setAttribute("title", signInTitle);
      btnAuth.setAttribute("aria-label", signInLabel);

      if (userDropdownMenu) {
        userDropdownMenu.classList.remove("active");
      }
      if (btnOpenVisitorsModal) {
        btnOpenVisitorsModal.style.display = "none";
      }
    }
  }

  // Toggle Language Dropdown
  if (langDropdownBtn && langSwitcherWrapper) {
    langDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = langSwitcherWrapper.classList.toggle("active");
      langDropdownBtn.setAttribute("aria-expanded", isActive ? "true" : "false");
      if (isActive && langSearchInput) {
        setTimeout(() => langSearchInput.focus(), 100);
      }
    });

    if (langDropdownMenu) {
      langDropdownMenu.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    document.addEventListener("click", () => {
      langSwitcherWrapper.classList.remove("active");
      langDropdownBtn.setAttribute("aria-expanded", "false");
    });
  }

  // Quick Language Filter / Search in Dropdown
  if (langSearchInput && langOptionsList) {
    langSearchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      const optionButtons = langOptionsList.querySelectorAll(".lang-option-btn");
      optionButtons.forEach(btn => {
        const langCode = (btn.getAttribute("data-lang") || "").toLowerCase();
        const langName = (btn.getAttribute("data-name") || "").toLowerCase();
        const text = btn.textContent.toLowerCase();
        if (langCode.includes(term) || langName.includes(term) || text.includes(term)) {
          btn.style.display = "flex";
        } else {
          btn.style.display = "none";
        }
      });
    });
  }

  // Robust Google Translate Auto-Sync Engine
  let googleTranslatePollTimer = null;
  function syncWithGoogleTranslate(targetLangCode) {
    if (googleTranslatePollTimer) {
      clearInterval(googleTranslatePollTimer);
      googleTranslatePollTimer = null;
    }

    const setCookies = (code) => {
      try {
        const hostname = window.location.hostname;
        const cookieVal = code === "en" ? "" : `/en/${code}`;
        const expires = code === "en" ? "expires=Thu, 01 Jan 1970 00:00:00 UTC;" : "";
        document.cookie = `googtrans=${cookieVal}; path=/; ${expires}`;
        document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname}; ${expires}`;
        document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostname}; ${expires}`;
      } catch (e) {
        console.warn("Cookie sync note:", e);
      }
    };

    setCookies(targetLangCode);

    const triggerSelect = () => {
      const select = document.querySelector("#google_translate_element select") || document.querySelector(".goog-te-combo");
      if (select) {
        let matchedVal = targetLangCode;
        const options = Array.from(select.options || []);
        const foundOpt = options.find(opt => 
          opt.value.toLowerCase() === targetLangCode.toLowerCase() ||
          opt.value.toLowerCase().startsWith(targetLangCode.toLowerCase() + "-") ||
          (targetLangCode === "zh-CN" && (opt.value === "zh-CN" || opt.value === "zh"))
        );
        if (foundOpt) {
          matchedVal = foundOpt.value;
        }

        if (targetLangCode === "en") {
          if (select.value && select.value !== "en" && select.value !== "") {
            select.value = "";
            select.dispatchEvent(new Event("change", { bubbles: true }));
          }
        } else if (select.value !== matchedVal) {
          select.value = matchedVal;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
        return true;
      }
      return false;
    };

    if (!triggerSelect()) {
      let attempts = 0;
      googleTranslatePollTimer = setInterval(() => {
        attempts++;
        if (triggerSelect() || attempts > 30) {
          clearInterval(googleTranslatePollTimer);
          googleTranslatePollTimer = null;
        }
      }, 250);
    }
  }

  // Core Universal Language Switcher Function
  function applyLanguage(langCode, langName, silent = false, skipGoogleSync = false) {
    currentLanguageCode = langCode || "en";
    const displayName = langName || languageNamesMap[currentLanguageCode] || currentLanguageCode;
    
    if (currentLangLabel) {
      currentLangLabel.textContent = displayName;
    }

    if (langOptionsList) {
      const optionButtons = langOptionsList.querySelectorAll(".lang-option-btn");
      optionButtons.forEach(btn => {
        if (btn.getAttribute("data-lang") === currentLanguageCode) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    if (langSwitcherWrapper) {
      langSwitcherWrapper.classList.remove("active");
    }

    localStorage.setItem("user_preferred_lang", currentLanguageCode);

    // Apply translations directly into all UI elements & dynamic feeds
    translateInterface(currentLanguageCode);
    renderPosts();
    renderPopularPosts();

    if (!silent) {
      const toastMsg = t("toast_lang_changed", `🌐 Language switched to ${displayName}`);
      showToast(toastMsg);
    }

    if (!skipGoogleSync) {
      syncWithGoogleTranslate(currentLanguageCode);
    }
  }

  // Listen for direct Google Translate combo selections
  document.addEventListener("change", (e) => {
    if (e.target && (e.target.classList.contains("goog-te-combo") || e.target.closest("#google_translate_element"))) {
      const chosenLang = e.target.value || "en";
      if (chosenLang && chosenLang !== currentLanguageCode) {
        applyLanguage(chosenLang, languageNamesMap[chosenLang] || chosenLang, false, true);
      }
    }
  });

  // Language Option Click Events
  if (langOptionsList) {
    const optionButtons = langOptionsList.querySelectorAll(".lang-option-btn");
    optionButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const langCode = btn.getAttribute("data-lang");
        const langName = btn.querySelector(".lang-name") ? btn.querySelector(".lang-name").textContent : btn.getAttribute("data-name");
        applyLanguage(langCode, langName);
      });
    });
  }

  // Initialize Language Preference from Storage or Browser
  function initLanguagePreference() {
    const savedLang = localStorage.getItem("user_preferred_lang");
    let currentCode = savedLang || "en";

    if (currentCode && (languageNamesMap[currentCode] || currentCode !== "en")) {
      applyLanguage(currentCode, languageNamesMap[currentCode] || currentCode, true);
    } else {
      applyLanguage("en", "English", true);
    }

    checkBrowserLanguageDetection(currentCode);
  }

  // Smart Browser Language Auto-Detection Prompt
  function checkBrowserLanguageDetection(currentSelectedCode) {
    const isDismissed = localStorage.getItem("lang_banner_dismissed");
    if (isDismissed === "true") return;

    if (currentSelectedCode && currentSelectedCode !== "en") return;

    const userBrowserLang = (navigator.language || (navigator.languages && navigator.languages[0]) || "").toLowerCase();
    const primaryLang = userBrowserLang.split("-")[0];

    if (primaryLang && primaryLang !== "en" && (languageNamesMap[primaryLang] || primaryLang.length === 2)) {
      const detectedName = languageNamesMap[primaryLang] || primaryLang.toUpperCase();
      if (langDetectorText && langDetectorBanner) {
        if (primaryLang === "bn") {
          langDetectorText.textContent = `🌍 আপনার ব্রাউজারের ভাষা বাংলা শনাক্ত হয়েছে। সম্পূর্ণ ওয়েবসাইটটি বাংলায় রূপান্তর করবেন?`;
        } else if (primaryLang === "es") {
          langDetectorText.textContent = `🌍 Idioma detectado: Español. ¿Deseas traducir todo el sitio a Español?`;
        } else if (primaryLang === "hi") {
          langDetectorText.textContent = `🌍 आपकी भाषा हिन्दी पहचानी गई है। क्या आप पूरी वेबसाइट का हिन्दी में अनुवाद करना चाहते हैं?`;
        } else if (primaryLang === "ar") {
          langDetectorText.textContent = `🌍 تم اكتشاف لغتك: العربية. هل تريد ترجمة الموقع بالكامل إلى العربية؟`;
        } else {
          langDetectorText.textContent = `🌍 Detected language: ${detectedName}. Would you like to translate this entire website to ${detectedName}?`;
        }
        langDetectorBanner.style.display = "block";

        if (btnTranslateConfirm) {
          btnTranslateConfirm.onclick = () => {
            applyLanguage(primaryLang, detectedName);
            langDetectorBanner.style.display = "none";
            localStorage.setItem("lang_banner_dismissed", "true");
          };
        }

        if (btnTranslateDismiss) {
          btnTranslateDismiss.onclick = () => {
            langDetectorBanner.style.display = "none";
            localStorage.setItem("lang_banner_dismissed", "true");
          };
        }
      }
    }
  }

  initLanguagePreference();

  // --------------------------------------------------------------------------
  // 5. Mobile Hamburger Navigation Menu Handler
  // --------------------------------------------------------------------------
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      hamburgerBtn.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    const navLinks = navMenu.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        hamburgerBtn.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });

    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        hamburgerBtn.classList.remove("active");
        navMenu.classList.remove("active");
      }
    });
  }

  // --------------------------------------------------------------------------
  // 6. Post Data Normalizer & Helper Functions
  // --------------------------------------------------------------------------
  
  // Extract YouTube Embed URL
  function extractYouTubeEmbedUrl(url) {
    if (!url || typeof url !== "string") return null;
    const trimmed = url.trim();
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = trimmed.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  }

  // Normalize Post Object for robust rendering
  function normalizePost(post, index = 0) {
    if (!post || typeof post !== "object") {
      post = {};
    }

    const id = (post.id !== undefined && post.id !== null) ? Number(post.id) : index;
    const title = post.title ? String(post.title).trim() : "Untitled Post";
    const category = post.category ? String(post.category).trim() : "General";

    const image = (post.image && String(post.image).trim() !== "") 
      ? String(post.image).trim() 
      : "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80";

    let authorName = "Staff Author";
    let authorAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";

    if (typeof post.author === "string" && post.author.trim() !== "") {
      authorName = post.author.trim();
    } else if (post.author && typeof post.author === "object") {
      if (post.author.name && String(post.author.name).trim() !== "") {
        authorName = String(post.author.name).trim();
      }
      if (post.author.avatar && String(post.author.avatar).trim() !== "") {
        authorAvatar = String(post.author.avatar).trim();
      }
    }

    const date = post.date 
      ? String(post.date).trim() 
      : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const rawContent = post.content || post.description || post.text || post.excerpt || "";
    let contentHtml = String(rawContent).trim();

    if (contentHtml && !contentHtml.includes("<p>") && !contentHtml.includes("<div>")) {
      contentHtml = contentHtml
        .split(/\n\s*\n/)
        .filter(para => para.trim().length > 0)
        .map(para => `<p>${para.trim().replace(/\n/g, "<br/>")}</p>`)
        .join("");
    }
    if (!contentHtml) {
      contentHtml = `<p>${post.excerpt || "No detailed content provided."}</p>`;
    }

    const videoUrl = post.video || post.videoUrl;
    if (videoUrl) {
      const embedUrl = extractYouTubeEmbedUrl(videoUrl);
      if (embedUrl && !contentHtml.includes(embedUrl)) {
        contentHtml = `
          <div class="embedded-video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <iframe style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" src="${embedUrl}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          </div>
        ` + contentHtml;
      }
    }

    let excerpt = post.excerpt ? String(post.excerpt).trim() : "";
    if (!excerpt) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = contentHtml;
      const plainText = tempDiv.textContent || tempDiv.innerText || "";
      excerpt = plainText.length > 135 ? plainText.substring(0, 135) + "..." : plainText;
    }

    let readTime = post.readTime ? String(post.readTime).trim() : "";
    if (!readTime) {
      const wordCount = (excerpt + " " + contentHtml).replace(/<[^>]*>/g, "").trim().split(/\s+/).length;
      const minutes = Math.max(1, Math.ceil(wordCount / 120));
      readTime = `${minutes} min read`;
    }

    const tags = Array.isArray(post.tags) ? post.tags : (category ? [category] : ["Blog"]);
    const isPopular = Boolean(post.isPopular);
    const isCustom = Boolean(post.isCustom);

    return {
      id,
      title,
      category,
      author: { name: authorName, avatar: authorAvatar },
      date,
      readTime,
      image,
      video: videoUrl || null,
      excerpt,
      content: contentHtml,
      tags,
      isPopular,
      isCustom
    };
  }

  // Local storage custom posts
  function getStoredCustomPosts() {
    try {
      const data = localStorage.getItem("custom_user_blog_posts");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading custom posts from storage:", e);
      return [];
    }
  }

  function saveStoredCustomPosts(posts) {
    try {
      localStorage.setItem("custom_user_blog_posts", JSON.stringify(posts));
    } catch (e) {
      console.error("Error saving custom posts:", e);
    }
  }

  // Aggregate and normalize all posts (Cloud Firestore + Local + Default)
  function getAllNormalizedPosts() {
    const customPosts = getStoredCustomPosts().map(p => ({ ...p, isCustom: true }));
    const cloudNormalized = cloudPosts.map((p, idx) => normalizePost({ ...p, isCustom: true }, idx + 5000));
    const customNormalized = customPosts.map((p, idx) => normalizePost(p, idx + 1000));
    
    // Pick localized default posts for selected language if available
    const currentLangDefaultPosts = localizedBlogPosts[currentLanguageCode] || localizedBlogPosts["en"] || blogPosts;
    const defaultNormalized = currentLangDefaultPosts.map((p, idx) => normalizePost(p, idx));
    
    return [...cloudNormalized, ...customNormalized, ...defaultNormalized];
  }

  // Real-time Cloud Firestore Listener
  try {
    onSnapshot(collection(db, "posts"), (snapshot) => {
      cloudPosts = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          firestoreDocId: docSnap.id,
          id: data.id || docSnap.id,
          ...data
        };
      });
      renderPosts();
      renderPopularPosts();
    }, (error) => {
      console.warn("Firestore realtime sync notice:", error);
    });
  } catch (e) {
    console.error("Firestore setup error:", e);
  }

  // Toast Notification Display Helper
  function showToast(message, isError = false) {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast-message ${isError ? "toast-error" : ""}`;
    toast.innerHTML = `
      <i class="${isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}"></i>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 4000);
  }

  // Post Deletion Handler (Admin Only)
  window.deleteCustomPost = async function(postId, event) {
    if (event) event.stopPropagation();
    
    if (!isAdmin) {
      showToast("Only the Editor-in-Chief has permission to delete posts.", true);
      return;
    }

    if (confirm("Are you sure you want to permanently delete this post from the cloud database?")) {
      const allPosts = getAllNormalizedPosts();
      const targetPost = allPosts.find(p => String(p.id) === String(postId));

      if (targetPost && targetPost.firestoreDocId) {
        try {
          await deleteDoc(doc(db, "posts", targetPost.firestoreDocId));
          showToast("🗑️ Post deleted from cloud database!");
        } catch (err) {
          console.error("Error deleting from Firestore:", err);
          showToast("Failed to delete from database: " + err.message, true);
        }
      } else {
        const customPosts = getStoredCustomPosts();
        const updatedPosts = customPosts.filter(p => String(p.id) !== String(postId));
        saveStoredCustomPosts(updatedPosts);
        renderPosts();
        renderPopularPosts();
        showToast("Post removed successfully!");
      }
    }
  };

  // --------------------------------------------------------------------------
  // 7. Blog Posts Rendering Function
  // --------------------------------------------------------------------------
  function renderPosts() {
    if (!blogGrid) return;

    const allPosts = getAllNormalizedPosts();

    // Filter by category and search query
    const filteredPosts = allPosts.filter(post => {
      const c = currentCategory.toLowerCase();
      const pCat = (post.category || "").toLowerCase();

      let matchCategory = (c === "all" || c === "");
      if (!matchCategory) {
        if (pCat === c) {
          matchCategory = true;
        } else if (c.includes("web") && (pCat.includes("web") || pCat.includes("ডেভেলপমেন্ট") || pCat.includes("desarrollo") || pCat.includes("développ") || pCat.includes("网页") || pCat.includes("ウェブ") || pCat.includes("веб"))) {
          matchCategory = true;
        } else if (c.includes("design") && (pCat.includes("design") || pCat.includes("ডিজাইন") || pCat.includes("diseño") || pCat.includes("डिज़ाइन") || pCat.includes("дизайн") || pCat.includes("conception") || pCat.includes("gestaltung") || pCat.includes("设计") || pCat.includes("デザイン"))) {
          matchCategory = true;
        } else if ((c.includes("ai") || c.includes("tech")) && (pCat.includes("ai") || pCat.includes("tech") || pCat.includes("এআই") || pCat.includes("প্রযুক্তি") || pCat.includes("ia") || pCat.includes("tecnolog") || pCat.includes("तकनीक") || pCat.includes("ki") || pCat.includes("人工智能") || pCat.includes("テック") || pCat.includes("yapay"))) {
          matchCategory = true;
        } else if ((c.includes("prog") || c.includes("code")) && (pCat.includes("prog") || pCat.includes("প্রোগ্রামিং") || pCat.includes("programación") || pCat.includes("प्रोग्रामिंग") || pCat.includes("программ") || pCat.includes("programm") || pCat.includes("编程") || pCat.includes("プログラミング"))) {
          matchCategory = true;
        } else if (c.includes("tutorial") && (pCat.includes("tutorial") || pCat.includes("টিউটোরিয়াল") || pCat.includes("tutoriales") || pCat.includes("ट्यूटोरियल") || pCat.includes("tutoriel") || pCat.includes("anleitung") || pCat.includes("教程") || pCat.includes("チュートリアル") || pCat.includes("rehber") || pCat.includes("обучение"))) {
          matchCategory = true;
        }
      }
      
      const matchSearch = currentSearchQuery === "" || 
        post.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(currentSearchQuery.toLowerCase());
      
      return matchCategory && matchSearch;
    });

    if (resultsCount) {
      const prefix = t("total_posts_prefix", "Showing");
      const articlesWord = t("nav_posts", "Articles");
      resultsCount.textContent = `${prefix} ${filteredPosts.length} ${articlesWord}`;
    }

    if (filteredPosts.length === 0) {
      blogGrid.innerHTML = `
        <div class="no-posts-found" id="noPostsFound">
          <div class="no-posts-icon"><i class="fas fa-search"></i></div>
          <h3>${t("no_posts_title", "No articles found")}</h3>
          <p>${t("no_posts_desc", "Try adjusting your search query or selecting a different category.")}</p>
          <button class="btn-reset-filter" id="resetFilterBtn">
            <i class="fas fa-undo"></i> ${t("btn_show_all", "View All Articles")}
          </button>
        </div>
      `;

      const resetBtn = document.getElementById("resetFilterBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", resetFilters);
      }
      return;
    }

    // Build Cards HTML
    blogGrid.innerHTML = filteredPosts.map(post => {
      const isLiked = likedPosts.has(post.id);
      const isBookmarked = bookmarkedPosts.has(post.id);

      return `
        <article class="blog-card" data-id="${post.id}" id="postCard-${post.id}" style="position: relative;">
          ${(post.isCustom && isAdmin) ? `
            <button class="btn-delete-custom-post" onclick="deleteCustomPost(${post.id}, event)" title="${t("btn_delete", "Delete post")}">
              <i class="fas fa-trash-alt"></i>
            </button>
          ` : ''}
          <div class="card-image-wrapper">
            <img src="${post.image}" alt="${post.title}" class="card-img" loading="lazy" />
            <span class="card-category-badge">${post.category}</span>
            <span class="card-read-time"><i class="far fa-clock"></i> ${post.readTime}</span>
          </div>

          <div class="card-body">
            <div class="card-meta">
              <div class="author-meta">
                <img src="${post.author.avatar}" alt="${post.author.name}" class="author-avatar" />
                <span>${post.author.name}</span>
              </div>
              <span>•</span>
              <div class="card-date">
                <i class="far fa-calendar-alt"></i> ${post.date}
              </div>
            </div>

            <h3 class="card-title" onclick="openArticleModal(${post.id})" style="cursor: pointer;">
              ${post.title}
            </h3>

            <p class="card-description">
              ${post.excerpt}
            </p>

            <div class="card-footer">
              <button class="btn-read-more" onclick="openArticleModal(${post.id})" id="readMoreBtn-${post.id}">
                ${t("btn_read_more", "Read More")} <i class="fas fa-arrow-right arrow-icon"></i>
              </button>

              <div class="card-actions-icons">
                <button 
                  class="action-icon-btn ${isLiked ? 'liked' : ''}" 
                  onclick="toggleLike(${post.id}, this)" 
                  title="${t("like_post", "Like post")}"
                  id="likeBtn-${post.id}"
                >
                  <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <button 
                  class="action-icon-btn ${isBookmarked ? 'bookmarked' : ''}" 
                  onclick="toggleBookmark(${post.id}, this)" 
                  title="${t("bookmark_post", "Bookmark post")}"
                  id="bookmarkBtn-${post.id}"
                >
                  <i class="${isBookmarked ? 'fas' : 'far'} fa-bookmark"></i>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  // --------------------------------------------------------------------------
  // 8. Popular Posts Sidebar Rendering
  // --------------------------------------------------------------------------
  function renderPopularPosts() {
    if (!popularPostsContainer) return;

    const allPosts = getAllNormalizedPosts();
    const popularPosts = allPosts.filter(post => post.isPopular).slice(0, 5);
    
    if (popularPosts.length === 0) {
      popularPostsContainer.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">No popular posts featured yet.</p>`;
      return;
    }

    popularPostsContainer.innerHTML = popularPosts.map(post => `
      <div class="popular-post-item" onclick="openArticleModal(${post.id})" id="popularPost-${post.id}">
        <img src="${post.image}" alt="${post.title}" class="popular-post-thumb" loading="lazy" />
        <div class="popular-post-info">
          <h4 class="popular-post-title">${post.title}</h4>
          <span class="popular-post-date"><i class="far fa-calendar-alt"></i> ${post.date}</span>
        </div>
      </div>
    `).join("");
  }

  // --------------------------------------------------------------------------
  // 9. Search Filtering Handler
  // --------------------------------------------------------------------------
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.trim();
      if (searchClearBtn) {
        searchClearBtn.classList.toggle("visible", currentSearchQuery.length > 0);
      }
      renderPosts();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        currentSearchQuery = "";
        searchClearBtn.classList.remove("visible");
        renderPosts();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 10. Category Filter Handler
  // --------------------------------------------------------------------------
  function setCategory(category) {
    currentCategory = category;

    heroCategoryChips.forEach(chip => {
      if (chip.dataset.category.toLowerCase() === category.toLowerCase()) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });

    sidebarCategories.forEach(item => {
      if (item.dataset.category.toLowerCase() === category.toLowerCase()) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    renderPosts();
  }

  heroCategoryChips.forEach(chip => {
    chip.addEventListener("click", () => {
      setCategory(chip.dataset.category);
    });
  });

  sidebarCategories.forEach(item => {
    item.addEventListener("click", () => {
      setCategory(item.dataset.category);
      const postGridSection = document.getElementById("postsSection");
      if (postGridSection) {
        postGridSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  function resetFilters() {
    currentCategory = "all";
    currentSearchQuery = "";
    if (searchInput) searchInput.value = "";
    if (searchClearBtn) searchClearBtn.classList.remove("visible");
    setCategory("all");
  }

  // --------------------------------------------------------------------------
  // 11. Article Reader Modal Viewer
  // --------------------------------------------------------------------------
  window.openArticleModal = function(postId) {
    const allPosts = getAllNormalizedPosts();
    const post = allPosts.find(p => Number(p.id) === Number(postId));
    if (!post || !articleModal) return;

    modalHeroImg.src = post.image;
    modalHeroImg.alt = post.title;
    modalCategoryBadge.textContent = post.category;
    modalTitle.textContent = post.title;
    modalMetaAuthor.innerHTML = `<i class="fas fa-user-edit"></i> ${post.author.name}`;
    modalMetaDate.innerHTML = `<i class="far fa-calendar-alt"></i> ${post.date}`;
    modalMetaRead.innerHTML = `<i class="far fa-clock"></i> ${post.readTime}`;
    modalContentText.innerHTML = post.content;

    articleModal.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  function closeArticleModal() {
    if (!articleModal) return;
    articleModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeArticleModal);
  }

  if (articleModal) {
    articleModal.addEventListener("click", (e) => {
      if (e.target === articleModal) {
        closeArticleModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (articleModal && articleModal.classList.contains("active")) {
        closeArticleModal();
      }
      if (createPostModal && createPostModal.classList.contains("active")) {
        closeCreateModal();
      }
      if (visitorsModal && visitorsModal.classList.contains("active")) {
        visitorsModal.classList.remove("active");
        document.body.style.overflow = "";
      }
      if (accessDeniedModal && accessDeniedModal.classList.contains("active")) {
        accessDeniedModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    }
  });

  // Link copy button
  if (modalShareCopy) {
    modalShareCopy.addEventListener("click", () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const originalText = modalShareCopy.innerHTML;
        modalShareCopy.innerHTML = `<i class="fas fa-check"></i> Link Copied!`;
        setTimeout(() => {
          modalShareCopy.innerHTML = originalText;
        }, 2000);
      });
    });
  }

  // --------------------------------------------------------------------------
  // 12. Google Authentication & User Profile Handler
  // --------------------------------------------------------------------------
  async function handleGoogleLogin() {
    if (isAuthInProgress) {
      console.log("Auth operation already in progress, skipping duplicate call.");
      return;
    }

    isAuthInProgress = true;
    try {
      showToast(t("toast_signing_in", "Signing in with Google..."));
      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user) {
        showToast(`Welcome, ${result.user.displayName || 'Reader'}!`);
      }
    } catch (err) {
      console.warn("Google Auth notice:", err.code || err.message);
      if (err.code === "auth/popup-closed-by-user") {
        showToast("Sign-in popup was closed.");
      } else if (err.code === "auth/popup-blocked") {
        showToast("পপ-আপ ব্লক হয়েছে। দয়া করে নতুন ট্যাবে (New Tab) অ্যাপটি খুলুন।", true);
      } else if (err.code === "auth/cancelled-popup-request") {
        // Handled silently
      } else if (err.code === "auth/unauthorized-domain") {
        showToast("Firebase Console-এ এই ডোমেইনটি Authorized Domains-এ যুক্ত করতে হবে।", true);
      } else {
        showToast("লগইন ব্যর্থ হয়েছে: নতুন ট্যাবে (New Tab) খুলে চেষ্টা করুন।", true);
      }
    } finally {
      setTimeout(() => {
        isAuthInProgress = false;
      }, 500);
    }
  }

  // Firebase Auth State Listener
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    isAdmin = !!(user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

    // Update UI components with appropriate language texts
    updateAuthUI();

    if (user) {
      // Record visitor details in cloud Firestore
      try {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: user.displayName || "Anonymous Reader",
          email: user.email || "",
          photoURL: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          role: isAdmin ? "admin" : "visitor",
          lastLoginAt: new Date().toISOString()
        }, { merge: true });

        await addDoc(collection(db, "visitor_logs"), {
          uid: user.uid,
          displayName: user.displayName || "Anonymous Reader",
          email: user.email || "",
          photoURL: user.photoURL || "",
          timestamp: new Date().toISOString(),
          action: "login"
        });
      } catch (err) {
        console.warn("User log sync note:", err);
      }
    }

    renderPosts();
  });

  if (btnAuth) {
    btnAuth.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!currentUser) {
        handleGoogleLogin();
      } else {
        if (userDropdownMenu) {
          userDropdownMenu.classList.toggle("active");
        }
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      try {
        await signOut(auth);
        if (userDropdownMenu) userDropdownMenu.classList.remove("active");
        showToast(t("btn_sign_out", "Signed Out"));
      } catch (err) {
        showToast("Error signing out", true);
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (userDropdownMenu && !authWrapper.contains(e.target)) {
      userDropdownMenu.classList.remove("active");
    }
  });

  // --------------------------------------------------------------------------
  // 13. Admin Visitor Directory & Audit Log
  // --------------------------------------------------------------------------
  async function loadVisitorsList() {
    if (!isAdmin || !visitorsTableBody) return;
    visitorsTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 2rem;">
          <i class="fas fa-spinner fa-spin"></i> Loading readers records...
        </td>
      </tr>
    `;

    try {
      const snap = await getDocs(collection(db, "users"));
      const users = snap.docs.map(d => d.data());
      
      if (totalVisitorsCount) {
        totalVisitorsCount.textContent = users.length;
      }

      if (users.length === 0) {
        visitorsTableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center; padding: 2rem;">
              No registered readers found yet.
            </td>
          </tr>
        `;
        return;
      }

      visitorsTableBody.innerHTML = users.map(u => {
        const isUserAdmin = (u.email && u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) || u.role === "admin";
        let formattedTime = "Recently";
        if (u.lastLoginAt) {
          try {
            formattedTime = new Date(u.lastLoginAt).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });
          } catch (e) {
            formattedTime = u.lastLoginAt;
          }
        }

        return `
          <tr>
            <td>
              <img src="${u.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" class="visitor-avatar-cell" alt="${u.displayName || 'User'}" />
            </td>
            <td><strong>${u.displayName || 'Anonymous Reader'}</strong></td>
            <td><code>${u.email || 'N/A'}</code></td>
            <td>
              <span class="user-role-badge ${isUserAdmin ? 'admin-badge' : ''}">
                ${isUserAdmin ? '👑 Admin' : '👤 Reader'}
              </span>
            </td>
            <td><small>${formattedTime}</small></td>
          </tr>
        `;
      }).join("");
    } catch (err) {
      console.error("Error loading visitors:", err);
      visitorsTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; color: red; padding: 2rem;">
            Failed to load records: ${err.message}
          </td>
        </tr>
      `;
    }
  }

  if (btnOpenVisitorsModal) {
    btnOpenVisitorsModal.addEventListener("click", () => {
      if (userDropdownMenu) userDropdownMenu.classList.remove("active");
      if (visitorsModal) {
        visitorsModal.classList.add("active");
        document.body.style.overflow = "hidden";
        loadVisitorsList();
      }
    });
  }

  if (closeVisitorsModalBtn) {
    closeVisitorsModalBtn.addEventListener("click", () => {
      if (visitorsModal) {
        visitorsModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  if (btnRefreshVisitors) {
    btnRefreshVisitors.addEventListener("click", loadVisitorsList);
  }

  if (visitorsModal) {
    visitorsModal.addEventListener("click", (e) => {
      if (e.target === visitorsModal) {
        visitorsModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  // Access Policy Modal Events
  if (closeAccessDeniedBtn) {
    closeAccessDeniedBtn.addEventListener("click", () => {
      if (accessDeniedModal) accessDeniedModal.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  if (btnOkAccessDenied) {
    btnOkAccessDenied.addEventListener("click", () => {
      if (accessDeniedModal) accessDeniedModal.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  if (accessDeniedModal) {
    accessDeniedModal.addEventListener("click", (e) => {
      if (e.target === accessDeniedModal) {
        accessDeniedModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  // --------------------------------------------------------------------------
  // 14. Create Post Modal & Auth Verification
  // --------------------------------------------------------------------------
  async function handleCreatePostRequest() {
    if (!currentUser) {
      showToast(t("btn_sign_in_title", "Please sign in with Google before writing a post."));
      await handleGoogleLogin();
      return;
    }

    if (isAdmin) {
      openCreateModal();
    } else {
      if (loggedVisitorName) loggedVisitorName.textContent = currentUser.displayName || "Valued Reader";
      if (loggedVisitorEmail) loggedVisitorEmail.textContent = currentUser.email || "";
      if (accessDeniedModal) {
        accessDeniedModal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    }
  }

  function openCreateModal() {
    if (!createPostModal) return;
    createPostModal.classList.add("active");
    document.body.style.overflow = "hidden";
    if (postInputTitle) postInputTitle.focus();
  }

  function closeCreateModal() {
    if (!createPostModal) return;
    createPostModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (btnOpenCreatePost) {
    btnOpenCreatePost.addEventListener("click", handleCreatePostRequest);
  }

  if (btnOpenCreatePost2) {
    btnOpenCreatePost2.addEventListener("click", handleCreatePostRequest);
  }

  if (closeCreatePostBtn) {
    closeCreatePostBtn.addEventListener("click", closeCreateModal);
  }

  if (btnCancelCreatePost) {
    btnCancelCreatePost.addEventListener("click", closeCreateModal);
  }

  if (createPostModal) {
    createPostModal.addEventListener("click", (e) => {
      if (e.target === createPostModal) {
        closeCreateModal();
      }
    });
  }

  // Image Presets
  presetChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const imgUrl = chip.dataset.img;
      if (postInputImage) {
        postInputImage.value = imgUrl;
        updateImagePreview(imgUrl);
      }
    });
  });

  function updateImagePreview(url) {
    if (!imagePreviewContainer || !imagePreview) return;
    if (url && url.trim().startsWith("http")) {
      imagePreview.src = url.trim();
      imagePreviewContainer.style.display = "block";
    } else {
      imagePreviewContainer.style.display = "none";
    }
  }

  if (postInputImage) {
    postInputImage.addEventListener("input", (e) => {
      updateImagePreview(e.target.value);
    });
  }

  if (btnRemovePreview) {
    btnRemovePreview.addEventListener("click", () => {
      if (postInputImage) postInputImage.value = "";
      if (imagePreviewContainer) imagePreviewContainer.style.display = "none";
    });
  }

  // Content Formatting Quick Tools
  function insertFormatTag(startTag, endTag = "") {
    if (!postInputContent) return;
    const start = postInputContent.selectionStart;
    const end = postInputContent.selectionEnd;
    const text = postInputContent.value;
    const selectedText = text.substring(start, end) || "Sample text";
    const replacement = `${startTag}${selectedText}${endTag}`;
    
    postInputContent.value = text.substring(0, start) + replacement + text.substring(end);
    postInputContent.focus();
    postInputContent.setSelectionRange(start + startTag.length, start + startTag.length + selectedText.length);
  }

  if (toolBold) toolBold.addEventListener("click", () => insertFormatTag("<b>", "</b>"));
  if (toolItalic) toolItalic.addEventListener("click", () => insertFormatTag("<i>", "</i>"));
  if (toolQuote) toolQuote.addEventListener("click", () => insertFormatTag("<blockquote>", "</blockquote>"));
  if (toolHeading) toolHeading.addEventListener("click", () => insertFormatTag("<h3>", "</h3>"));
  if (toolList) toolList.addEventListener("click", () => insertFormatTag("<ul>\n  <li>", "</li>\n</ul>"));

  // Submit & Publish Post to Firestore
  if (createPostForm) {
    createPostForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!isAdmin) {
        showToast("You do not have permission to publish posts!", true);
        return;
      }

      const title = postInputTitle.value.trim();
      const content = postInputContent.value.trim();

      if (!title) {
        showToast("Please provide an article title!", true);
        return;
      }

      if (!content) {
        showToast("Please provide the article body content!", true);
        return;
      }

      const category = postInputCategory.value.trim() || "General";
      const authorName = postInputAuthor.value.trim() || (currentUser ? currentUser.displayName : "Editor-in-Chief");
      const image = postInputImage.value.trim() || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80";
      const video = postInputVideo.value.trim() || "";
      const excerpt = postInputExcerpt.value.trim() || "";
      const isPopular = postInputPopular ? postInputPopular.checked : false;

      const newPostData = {
        title,
        category,
        author: {
          name: authorName,
          avatar: (currentUser && currentUser.photoURL) || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
          email: currentUser ? currentUser.email : ADMIN_EMAIL
        },
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        image,
        video: video || null,
        excerpt,
        content,
        isPopular,
        isCustom: true,
        createdAt: new Date().toISOString()
      };

      try {
        const btnSubmit = document.getElementById("btnSubmitCreatePost");
        if (btnSubmit) {
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Publishing to Cloud...`;
        }

        await addDoc(collection(db, "posts"), newPostData);

        createPostForm.reset();
        if (imagePreviewContainer) imagePreviewContainer.style.display = "none";
        closeCreateModal();

        showToast("🎉 Post published to live cloud database! Visible worldwide.");

        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = `<i class="fas fa-paper-plane"></i> Publish Post`;
        }

        const postGridSection = document.getElementById("postsSection");
        if (postGridSection) {
          postGridSection.scrollIntoView({ behavior: "smooth" });
        }
      } catch (err) {
        console.error("Error creating post in Firestore:", err);
        showToast("Failed to publish post: " + err.message, true);
        const btnSubmit = document.getElementById("btnSubmitCreatePost");
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = `<i class="fas fa-paper-plane"></i> Publish Post`;
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 15. Like and Bookmark Actions
  // --------------------------------------------------------------------------
  window.toggleLike = function(postId, btnElement) {
    const icon = btnElement.querySelector("i");
    if (likedPosts.has(postId)) {
      likedPosts.delete(postId);
      btnElement.classList.remove("liked");
      icon.className = "far fa-heart";
    } else {
      likedPosts.add(postId);
      btnElement.classList.add("liked");
      icon.className = "fas fa-heart";
    }
  };

  window.toggleBookmark = function(postId, btnElement) {
    const icon = btnElement.querySelector("i");
    if (bookmarkedPosts.has(postId)) {
      bookmarkedPosts.delete(postId);
      btnElement.classList.remove("bookmarked");
      icon.className = "far fa-bookmark";
    } else {
      bookmarkedPosts.add(postId);
      btnElement.classList.add("bookmarked");
      icon.className = "fas fa-bookmark";
    }
  };

  // --------------------------------------------------------------------------
  // 16. Back to Top Button
  // --------------------------------------------------------------------------
  window.addEventListener("scroll", () => {
    if (backToTopBtn) {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // --------------------------------------------------------------------------
  // 17. Newsletter Form Handler
  // --------------------------------------------------------------------------
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = newsletterEmail.value.trim();
      if (email) {
        newsletterMsg.textContent = "🎉 Thank you! You have successfully subscribed to our newsletter.";
        newsletterMsg.classList.add("show");
        newsletterEmail.value = "";
        setTimeout(() => {
          newsletterMsg.classList.remove("show");
        }, 4000);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 18. Initial Render Trigger
  // --------------------------------------------------------------------------
  renderPosts();
  renderPopularPosts();
});
