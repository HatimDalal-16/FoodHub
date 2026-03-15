require("../styles/styles.css");
const Headroom = require("headroom.js");
gsap.registerPlugin(ScrollTrigger);

// Initialize Headroom
const header = document.querySelector("#header");
if (header) {
    const headroom = new Headroom(header);
    headroom.init();
}

console.log("JS reloaded at", Date.now());
console.log("force rebuild", Date.now()); 

// ── Mega Menu ──────────────────────────────────────────────────────────────
(function () {
  const header      = document.getElementById('header');
  const megaPanels  = document.getElementById('mega-panels');
  const navItems    = document.querySelectorAll('.nav-item[data-panel]');
  let closeTimer    = null;

  function showPanel(id) {
    clearTimeout(closeTimer);

    // Hide all panels first, then show the right one
    document.querySelectorAll('.mega-panel').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(`panel-${id}`);
    if (target) target.classList.remove('hidden');

    // Manage active state classes on nav items
    navItems.forEach(item => {
      const link = item.querySelector('a') || item;
      if (item.dataset.panel === id) {
        link.classList.add('text-primary-deepblue');
      } else {
        link.classList.remove('text-primary-deepblue');
      }
    });

    // Open grid row
    megaPanels.style.gridTemplateRows = '1fr';

    // Keep header in its hovered (white) state
    header.classList.add('bg-white', 'text-black');
    header.classList.remove('bg-transparent', 'text-white');
  }

  function hidePanels() {
    // return; // TEMP: Prevent hiding in dev
    closeTimer = setTimeout(() => {
      megaPanels.style.gridTemplateRows = '0fr';
      document.querySelectorAll('.mega-panel').forEach(p => p.classList.add('hidden'));

      // Remove active states from links
      navItems.forEach(item => {
        const link = item.querySelector('a') || item;
        link.classList.remove('text-primary-deepblue');
      });

      // Only revert header colour if mouse isn't still over it
      if (!header.matches(':hover')) {
        header.classList.remove('bg-white', 'text-black');
        header.classList.add('bg-transparent', 'text-white');
      }
    }, 120); // small delay prevents flicker when moving between items
  }

  navItems.forEach(item => {
    if (item.dataset.panel === 'search') {
      // Search triggers on CLICK
      item.addEventListener('click', (e) => {
        e.preventDefault();
        showPanel('search');
        // Auto-focus the input
        const input = document.querySelector('#panel-search input');
        if (input) setTimeout(() => input.focus(), 350);
      });
    } else {
      // Others trigger on HOVER
      item.addEventListener('mouseenter', () => showPanel(item.dataset.panel));
      item.addEventListener('mouseleave', hidePanels);
    }
  });

  megaPanels.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  megaPanels.addEventListener('mouseleave', hidePanels);

  header.addEventListener('mouseleave', hidePanels);
})();

const tabs = document.querySelectorAll('.tab');
const panes = document.querySelectorAll('.tab-pane');

// Show first pane, activate first tab on load
if (panes.length) panes[0].classList.remove('hidden');
if (tabs.length) {
    tabs[0].classList.remove('text-white/50', 'border-transparent');
    tabs[0].classList.add('text-white', 'border-primary-glowgreen');
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        if (tab.classList.contains('text-white')) return;

        tabs.forEach(t => {
            t.classList.remove('text-white', 'border-primary-glowgreen');
            t.classList.add('text-white/50', 'border-transparent');
        });
        tab.classList.add('text-white', 'border-primary-glowgreen');
        tab.classList.remove('text-white/50', 'border-transparent');

        panes.forEach(pane => pane.classList.add('hidden'));
        const target = document.getElementById(tab.dataset.target);
        if (target) target.classList.remove('hidden');
    });
});

// Rotate SVG on hover using GSAP
document.querySelectorAll('.rotate-trigger').forEach(trigger => {
    trigger.addEventListener('mouseenter', () => {
        gsap.to(trigger, { rotation: 180, duration: 1, ease: 'power2.inOut' });
    });
    trigger.addEventListener('mouseleave', () => {
        gsap.to(trigger, { rotation: 0, duration: 1, ease: 'power2.inOut' });
    });
});

gsap.registerPlugin(ScrollTrigger);

// Set initial off-screen positions
gsap.set(".vision-left", { x: "60vw" });
gsap.set(".vision-right", { x: "-60vw" });

// Animate in on scroll
gsap.to(".vision-right", {
  x: 0,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".vision-wrap",
    start: "top 90%",
    end: "top 20%",
    scrub: 1,
  }
});

gsap.to(".vision-left", {
  x: 0,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".vision-wrap",
    start: "top 90%",
    end: "top 20%",
    scrub: 1,
  }
});

// Initialize Slick Slider for Service Cards
function initSliders(isRtl) {
    ['.service-slider', '.small-card-slider', '.news-card-slider'].forEach(sel => {
        const $el = $(sel);
        if ($el.hasClass('slick-initialized')) $el.slick('destroy');
    });

    $('.service-slider').slick({
        dots: false,
        infinite: true,
        slidesToShow: 3,
        variableWidth: true,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 0,
        speed: 10000,
        cssEase: 'linear',
        arrows: false,
        pauseOnHover: true,
        pauseOnFocus: true,
        draggable: true,
        swipe: true,
        touchMove: true,
        rtl: isRtl,
    });

    $('.small-card-slider').slick({
        dots: false,
        infinite: true,
        slidesToShow: 4,
        variableWidth: true,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 500,
        arrows: false,
        pauseOnHover: true,
        pauseOnFocus: true,
        draggable: true,
        swipe: true,
        touchMove: true,
        rtl: isRtl,
    });

    $('.news-card-slider').slick({
        dots: false,
        infinite: true,
        slidesToScroll: 1,
        variableWidth: true,
        autoplay: true,
        autoplaySpeed: 0,
        speed: 10000,
        cssEase: 'linear',
        arrows: false,
        pauseOnHover: true,
        pauseOnFocus: true,
        draggable: true,
        swipe: true,
        touchMove: true,
        rtl: isRtl,
    });
}

$(document).ready(function(){
    initSliders(false);
});

// Accordion Logic
$('.accordion-trigger').on('click', function () {
    const $trigger = $(this);
    const isExpanded = $trigger.attr('aria-expanded') === 'true';
    const $panel = $('#' + $trigger.attr('aria-controls'));

    // Close all other open accordions
    $('.accordion-trigger[aria-expanded="true"]').not($trigger).each(function () {
        $(this).attr('aria-expanded', 'false');
        $('#' + $(this).attr('aria-controls')).slideUp();
    });

    // Toggle the clicked item
    $trigger.attr('aria-expanded', isExpanded ? 'false' : 'true');
    $panel.slideToggle();
});

// ── Small Card – Touch/Keyboard Toggle ────────────────────────────────────────
(function () {
  const slider = document.querySelector('.small-card-slider');
  if (!slider) return;

  function openCard(card) {
    const panel = card.querySelector('[data-card-panel]');
    const desc  = card.querySelector('[data-card-desc]');
    card.style.maxHeight        = '30rem';
    card.style.backgroundColor  = 'var(--color-primary-green)';
    if (panel) panel.style.maxHeight = '15rem';
    if (desc)  desc.style.opacity    = '1';
    card.setAttribute('aria-expanded', 'true');
    if (panel) panel.setAttribute('aria-hidden', 'false');
  }

  function closeCard(card) {
    const panel = card.querySelector('[data-card-panel]');
    const desc  = card.querySelector('[data-card-desc]');
    card.style.maxHeight        = '';
    card.style.backgroundColor  = '';
    if (panel) panel.style.maxHeight = '';
    if (desc)  desc.style.opacity    = '';
    card.setAttribute('aria-expanded', 'false');
    if (panel) panel.setAttribute('aria-hidden', 'true');
  }

  function toggle(card) {
    const isOpen = card.getAttribute('aria-expanded') === 'true';
    slider.querySelectorAll('article').forEach(closeCard);
    if (!isOpen) openCard(card);
  }

  // Click — touch devices only (hover:none = no real hover support)
  slider.addEventListener('click', e => {
    if (!window.matchMedia('(hover: none)').matches) return;
    const card = e.target.closest('article');
    if (card) toggle(card);
  });

  // Keyboard — all devices (Enter / Space for accessibility)
  slider.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('article');
    if (card) { e.preventDefault(); toggle(card); }
  });
})();

// ──────────────────────────────────────────────
// Mobile Menu – Toggle, Close, Focus Trap
// ──────────────────────────────────────────────
const menuToggle = document.getElementById('mobile-menu-toggle');
const menuClose = document.getElementById('mobile-menu-close');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
const body = document.body;

if (menuToggle && mobileMenu && mobileMenuBackdrop) {
  const openMenu = () => {
    mobileMenu.classList.remove('translate-x-full');
    mobileMenuBackdrop.classList.remove('opacity-0', 'invisible');
    mobileMenuBackdrop.classList.add('opacity-100', 'visible');
    menuToggle.setAttribute('aria-expanded', 'true');
    body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mobileMenu.classList.add('translate-x-full');
    mobileMenuBackdrop.classList.remove('opacity-100', 'visible');
    mobileMenuBackdrop.classList.add('opacity-0', 'invisible');
    menuToggle.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  };

  menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  mobileMenuBackdrop.addEventListener('click', closeMenu);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('translate-x-full')) {
      closeMenu();
    }
  });
}


// ── Language / Direction Toggle ────────────────────────────────────────────────
(function () {
  const TRANSLATIONS = {
    // Navigation
    'nav.about':   { en: 'About ADFH',    ar: 'عن المنظومة' },
    'nav.explore': { en: 'Explore',        ar: 'استكشف' },
    'nav.trades':  { en: 'Trades',         ar: 'التجارة' },
    'nav.join':    { en: 'Join the Hub',   ar: 'انضم إلى المنظومة' },
    'nav.connect': { en: 'Connect',        ar: 'تواصل' },

    // Hero
    'hero.title': { en: 'Built for Trade Design for Growth', ar: 'بُنيت للتجارة صُممت للنمو' },
    'hero.desc':  { en: 'The Abu Dhabi Food Hub – KEZAD is being developed as an ecosystem for trading of all food categories', ar: 'منظومة أبوظبي للغذاء – كيزاد تُطوَّر لتكون نظاماً متكاملاً لتجارة جميع الفئات الغذائية' },

    // Video tabs
    'tab.1': { en: 'An Integrated Food Trade & Logistics Hub in Abu Dhabi', ar: 'مركز متكامل لتجارة الغذاء واللوجستيات في أبوظبي' },
    'tab.2': { en: 'Powering efficient trade across borders',               ar: 'تمكين تجارة فعّالة عبر الحدود' },
    'tab.3': { en: 'Finest wholesale food trading & logistics platform',    ar: 'أرقى منصة لتجارة الغذاء بالجملة واللوجستيات' },

    // Vision
    'vision.left':  { en: 'Progressing the',    ar: 'نحو تحقيق' },
    'vision.right': { en: 'Vision of Abu Dhabi', ar: 'رؤية أبوظبي' },

    // About
    'about.text': { en: 'The 3.3 square kilometres project is a joint venture between Abu Dhabi Ports Group and Ghassan Aboud Group', ar: 'مشروع بمساحة 3.3 كيلومتر مربع، وهو مشروع مشترك بين مجموعة موانئ أبوظبي ومجموعة غسان عبود' },

    // Market §02


    // Why AD §03
    'why.tag':  { en: 'one-stop-shop', ar: 'وجهة شاملة' },
    'why.desc': { en: 'Abu Dhabi Food Hub, as a one-stop destination for importers, distributors, and sellers, it delivers exceptional value', ar: 'منظومة أبوظبي للغذاء، بوصفها وجهةً شاملة للمستوردين والموزعين والبائعين، تُقدم قيمة استثنائية' },

    // Strategic §04
    'strategic.heading':  { en: 'Strategically located. with world-class logistics connections', ar: 'موقع استراتيجي بوصلات لوجستية على مستوى عالمي' },
    'strategic.subtitle': { en: 'Huge land for huge production',   ar: 'أراضٍ شاسعة لإنتاج ضخم' },
    'strategic.desc':     { en: 'Step into one of the most comprehensive food trade zones in the Middle East. ecosystem to facilitate wholesale trade and logistics across all food categories.', ar: 'ادخل إلى أحد أكثر مناطق تجارة الغذاء شمولاً في الشرق الأوسط، نظام بيئي متكامل لتسهيل التجارة بالجملة واللوجستيات.' },

    // Scale CTA
    'scale.desc': { en: 'Step into one of the most comprehensive food trade zones in the Middle East. An ecosystem designed to facilitate wholesale trade at scale.', ar: 'ادخل إلى أحد أكثر مناطق تجارة الغذاء شمولاً في الشرق الأوسط. نظام بيئي مصمم لتسهيل التجارة بالجملة على نطاق واسع.' },

    // Spaces §05
    'spaces.desc': { en: 'Step into one of the most comprehensive food trade zones in the Middle East. ecosystem to facilitate wholesale trade and logistics across all food categories.', ar: 'ادخل إلى أحد أكثر مناطق تجارة الغذاء شمولاً في الشرق الأوسط. نظام بيئي لتسهيل التجارة بالجملة واللوجستيات.' },

    // News §06
    'news.heading': { en: 'Newsroom', ar: 'غرفة الأخبار' },

    // Footer
    'footer.newsletter.title': { en: 'Be the first to know',                              ar: 'كن أول من يعلم' },
    'footer.newsletter.desc':  { en: "We'll send you only what matters — no noise, no spam.", ar: 'سنرسل لك فقط ما يهمك — بلا ضوضاء، بلا بريد مزعج.' },
  };

  // Elements whose content contains HTML markup (spans, br, etc.)
  const TRANSLATIONS_HTML = {
    'market.heading': {
      en: '<span class="text-primary-lightblue">Abu Dhabi Food Hub</span> is built to reshape the global food trade &amp; logistics landscape.',
      ar: '<span class="text-primary-lightblue">منظومة أبوظبي للغذاء</span> مبنية لإعادة تشكيل منظومة تجارة الغذاء واللوجستيات العالمية.',
    },
    'why.heading': {
      en: 'Importers.<br />Distributors. Sellers',
      ar: 'مستوردون.<br />موزعون. بائعون',
    },
    'scale.heading': {
      en: 'Scale Your Supply &amp; <br> Production',
      ar: 'وسّع إمداداتك <br> وإنتاجك',
    },
    'spaces.heading': {
      en: 'Designed for you.<br><span class="text-primary-lightblue">Built to evolve</span> with you',
      ar: 'صُمم لأجلك.<br><span class="text-primary-lightblue">بُني ليتطور</span> معك',
    },
    'market.teaser': {
      en: 'Ready to see the potential of <span class="whitespace-nowrap">one-stop-shop</span> integrated ecosystem',
      ar: 'هل أنت مستعد لاكتشاف إمكانات النظام البيئي المتكامل؟',
    },
  };

  let currentLang = 'en';
  const html = document.documentElement;
  const btn = document.getElementById('lang-toggle');
  if (!btn) return;

  function applyLang(lang) {
    currentLang = lang;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    btn.setAttribute('aria-label', lang === 'ar' ? 'تغيير اللغة إلى الإنجليزية' : 'Change Language to Arabic');

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const t = TRANSLATIONS[el.dataset.i18n];
      if (t && t[lang] !== undefined) el.textContent = t[lang];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const t = TRANSLATIONS_HTML[el.dataset.i18nHtml];
      if (t && t[lang] !== undefined) el.innerHTML = t[lang];
    });

    initSliders(lang === 'ar');
  }

  btn.addEventListener('click', () => applyLang(currentLang === 'en' ? 'ar' : 'en'));
})();



