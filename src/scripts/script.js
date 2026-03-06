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

  // TEMP: Force panel open for development
  showPanel('about');
})();

const tabs = document.querySelectorAll('.tab');
const video = document.querySelector('video');
const videoSource = document.querySelector('video source');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Skip if this tab is already active (has full white text)
        if (tab.classList.contains('text-white')) return;

        // Set all tabs to semi-transparent white
        tabs.forEach(t => {
            t.classList.remove('text-white');
            t.classList.add('text-white/50');
        });

        // Make clicked tab full white
        tab.classList.add('text-white');
        tab.classList.remove('text-white/50');

        // Fade out video
        video.classList.add('opacity-0');

        // After fade, change source and fade in
        setTimeout(() => {
            videoSource.src = `assets/${tab.dataset.video}`;
            video.load();
            video.play().catch(e => console.log('Autoplay prevented'));
            video.classList.remove('opacity-0');
        }, 300); // match transition duration
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
$(document).ready(function(){
    $('.service-slider').slick({
        dots: false,
        infinite: true,
        slidesToShow: 3,
        variableWidth: true,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 0,
        speed: 9000,
        cssEase: 'linear',
        arrows: false,
        pauseOnHover: true,
        pauseOnFocus: true,
        draggable: true,
        swipe: true,
        touchMove: true,
       
    });

    $('.small-card-slider').slick({
        dots: false,
        infinite: true,
        slidesToShow: 4,
        variableWidth: true,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        speed: 1000,
        arrows: false,
        pauseOnHover: true,
        pauseOnFocus: true,
        draggable: true,
        swipe: true,
        touchMove: true,
    
    });

    // Initialize Slick Slider for News Cards
    $('.news-card-slider').slick({
        dots: false,
        infinite: true,
        slidesToScroll: 1,
        variableWidth: true,
        autoplay: true,
        autoplaySpeed: 0,
        speed: 9000,
        cssEase: 'linear',
        arrows: false,
        pauseOnHover: true,
        pauseOnFocus: true,
        draggable: true,
        swipe: true,
        touchMove: true
    });
});

// Accordion Logic
document.querySelectorAll('.accordion-item').forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const content = item.querySelector('.accordion-panel');

    item.addEventListener('click', (e) => {
        // Prevent collapse when clicking links (Industry standard safeguard)
        if (e.target.closest('a')) return;

        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        const group = item.closest('.w-full.flex.flex-col');

        // Close other items in the same group
        if (group && !isExpanded) {
            group.querySelectorAll('.accordion-trigger').forEach(otherTrigger => {
                if (otherTrigger !== trigger && otherTrigger.getAttribute('aria-expanded') === 'true') {
                    otherTrigger.setAttribute('aria-expanded', 'false');
                    const otherContent = document.getElementById(otherTrigger.getAttribute('aria-controls'));
                    if (otherContent) {
                        gsap.to(otherContent, {
                            maxHeight: 0,
                            opacity: 0,
                            duration: 0.4,
                            ease: "power2.inOut",
                            onComplete: () => {
                                otherContent.classList.add('invisible');
                            }
                        });
                    }
                }
            });
        }

        // Toggle the clicked item
        if (isExpanded) {
            trigger.setAttribute('aria-expanded', 'false');
            gsap.to(content, {
                maxHeight: 0,
                opacity: 0,
                duration: 0.4,
                ease: "power2.inOut",
                onComplete: () => {
                    content.classList.add('invisible');
                }
            });
        } else {
            trigger.setAttribute('aria-expanded', 'true');
            content.classList.remove('invisible');
            gsap.fromTo(content, 
                { maxHeight: 0, opacity: 0 },
                { maxHeight: 1000, opacity: 1, duration: 0.6, ease: "power3.out" }
            );
        }
    });
});

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

//-------------GLobe
(function () {
  const canvas = document.getElementById('globe-canvas');
  const loader = document.getElementById('globe-loading');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const DEG = Math.PI / 180;

  let isInitialized = false;
  let isVisible = false;

  // ── HiDPI resize ──────────────────────────────────────────────────────────
  function resize() {
    const r = canvas.getBoundingClientRect();
    canvas.width  = r.width  * devicePixelRatio;
    canvas.height = r.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  // ── Rotation state ────────────────────────────────────────────────────────
  let rotY = 0, rotX = 0.28;
  const HOME_X = 0.28, HOME_Y = 0;
  let dragging = false, springBack = false;
  let lastMX = 0, lastMY = 0;
  const AUTO_SPEED = 0.003, SPRING = 0.055;

  // ── Performance Optimizations ─────────────────────────────────────────────
  let cY, sY, cX, sX; 
  function updateRotation() {
    cY = Math.cos(rotY); sY = Math.sin(rotY);
    cX = Math.cos(rotX); sX = Math.sin(rotX);
  }

  function rotate([x, y, z]) {
    const x1 = x * cY + z * sY, z1 = -x * sY + z * cY;
    return [x1, y * cX - z1 * sX, y * sX + z1 * cX];
  }

  function toXYZ(lat, lon) {
    return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
  }

  // ── Data storage ──────────────────────────────────────────────────────────
  let features = [];
  let borderRingsXYZ = []; 
  let dotsXYZ = [];        
  let gridLatXYZ = [];     
  let gridLonXYZ = [];

  function buildGeometry() {
    if (!features.length) return;
    dotsXYZ = [];
    const STEP = 2.2;
    for (let lat = -85; lat <= 85; lat += STEP) {
      for (let lon = -180; lon < 180; lon += STEP) {
        for (const f of features) {
          if (onLand(lon, lat, f)) {
            dotsXYZ.push(toXYZ(lat * DEG, lon * DEG));
            break;
          }
        }
      }
    }
    borderRingsXYZ = [];
    const SEG = 4;
    features.forEach(f => {
      const rings = featureToRings(f);
      rings.forEach(ring => {
        const ringXYZ = [];
        for (let i = 0; i < ring.length - 1; i++) {
          const [lon1, lat1] = ring[i], [lon2, lat2] = ring[i+1];
          if (Math.abs(lon1 - lon2) > Math.PI) continue;
          for (let s = 0; s <= SEG; s++) {
            const t = s / SEG;
            ringXYZ.push(toXYZ(lat1 + (lat2 - lat1) * t, lon1 + (lon2 - lon1) * t));
          }
        }
        borderRingsXYZ.push(ringXYZ);
      });
    });
    gridLatXYZ = []; gridLonXYZ = [];
    const GLATS = 24, GLONS = 48, STEPS = 90;
    for (let i = 0; i <= GLATS; i++) {
      const lat = (i / GLATS) * Math.PI - Math.PI / 2;
      const pts = [];
      for (let j = 0; j <= STEPS; j++) pts.push(toXYZ(lat, (j / STEPS) * Math.PI * 2));
      gridLatXYZ.push(pts);
    }
    for (let i = 0; i < GLONS; i++) {
      const lon = (i / GLONS) * Math.PI * 2;
      const pts = [];
      for (let j = 0; j <= STEPS; j++) pts.push(toXYZ((j / STEPS) * Math.PI - Math.PI / 2, lon));
      gridLonXYZ.push(pts);
    }
  }

  function pipRing(lon, lat, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function onLand(lon, lat, feature) {
    const g = feature.geometry; if (!g) return false;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    for (const poly of polys) {
      if (!pipRing(lon, lat, poly[0])) continue;
      let inHole = false;
      for (let h = 1; h < poly.length; h++) if (pipRing(lon, lat, poly[h])) { inHole = true; break; }
      if (!inHole) return true;
    }
    return false;
  }
  function featureToRings(feature) {
    const g = feature.geometry; if (!g) return [];
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    return polys.flatMap(poly => poly.map(ring => ring.map(([lo, la]) => [lo * DEG, la * DEG])));
  }

  const GEOJSON_URLS = [
    'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson',
    'https://cdn.jsdelivr.net/npm/@geo-maps/countries-land-110m@0.6.0/map.geo.json',
  ];

  async function loadGeoJSON() {
    for (const url of GEOJSON_URLS) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        if (data.type === 'FeatureCollection') return data.features;
        if (data.type === 'Polygon' || data.type === 'MultiPolygon') return [{ geometry: data }];
      } catch (_) {}
    }
    return null;
  }

  function draw() {
    if (!isVisible || !isInitialized) return;
    const W = canvas.width / devicePixelRatio;
    const H = canvas.height / devicePixelRatio;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.44;
    ctx.clearRect(0, 0, W, H);
    updateRotation();
    const BASE = '210, 220, 228';

    ctx.lineWidth = 0.4;
    ctx.strokeStyle = `rgba(${BASE}, 0.15)`;
    [...gridLatXYZ, ...gridLonXYZ].forEach(line => {
      ctx.beginPath();
      let move = true;
      line.forEach(pt => {
        const p = rotate(pt);
        if (p[2] < 0) { move = true; return; }
        if (move) { ctx.moveTo(cx + p[0] * R, cy - p[1] * R); move = false; }
        else ctx.lineTo(cx + p[0] * R, cy - p[1] * R);
      });
      ctx.stroke();
    });

    dotsXYZ.forEach(pt => {
      const p = rotate(pt);
      if (p[2] < 0.1) return;
      const alpha = 0.15 + p[2] * 0.5;
      ctx.beginPath();
      ctx.arc(cx + p[0] * R, cy - p[1] * R, 0.5 + p[2] * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${BASE}, ${alpha})`;
      ctx.fill();
    });

    ctx.lineWidth = 0.7;
    ctx.strokeStyle = `rgba(${BASE}, 0.45)`;
    borderRingsXYZ.forEach(ring => {
      ctx.beginPath();
      let move = true;
      ring.forEach(pt => {
        const p = rotate(pt);
        if (p[2] < 0) { move = true; return; }
        if (move) { ctx.moveTo(cx + p[0] * R, cy - p[1] * R); move = false; }
        else ctx.lineTo(cx + p[0] * R, cy - p[1] * R);
      });
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${BASE}, 0.2)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    if (!dragging) {
      if (springBack) {
        rotX += (HOME_X - rotX) * SPRING;
        let dY = HOME_Y - (rotY % (Math.PI * 2));
        if (dY > Math.PI) dY -= Math.PI * 2; if (dY < -Math.PI) dY += Math.PI * 2;
        rotY += dY * SPRING;
        if (Math.abs(HOME_X - rotX) < 0.001 && Math.abs(dY) < 0.001) { rotX = HOME_X; rotY = HOME_Y; springBack = false; }
      } else rotY += AUTO_SPEED;
    }
  }

  function loop() { draw(); requestAnimationFrame(loop); }

  async function init() {
    if (isInitialized) return;
    resize();
    const feats = await loadGeoJSON();
    if (!feats) { if (loader) loader.textContent = 'Map data unavailable'; return; }
    features = feats;
    buildGeometry();
    isInitialized = true;
    if (loader) loader.style.display = 'none';
  }

  // ── Lazy Loading Logic ──────────────────────────────────────────────
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !isInitialized) {
          init();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(canvas.parentElement);
  } else {
    // Fallback for older browsers
    init();
    isVisible = true;
  }

  window.addEventListener('resize', () => { resize(); if (isInitialized) buildGeometry(); });
  loop();

  canvas.addEventListener('mousedown', e => { dragging = true; springBack = false; lastMX = e.clientX; lastMY = e.clientY; canvas.style.cursor = 'grabbing'; });
  window.addEventListener('mousemove', e => { if (!dragging) return; rotY += (e.clientX - lastMX) * 0.006; rotX += (e.clientY - lastMY) * 0.006; rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX)); lastMX = e.clientX; lastMY = e.clientY; });
  window.addEventListener('mouseup', () => { dragging = false; springBack = true; canvas.style.cursor = 'grab'; });
  canvas.addEventListener('touchstart', e => { dragging = true; springBack = false; lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY; }, { passive: true });
  canvas.addEventListener('touchmove', e => { if (!dragging) return; rotY += (e.touches[0].clientX - lastMX) * 0.006; rotX += (e.touches[0].clientY - lastMY) * 0.006; rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX)); lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY; e.preventDefault(); }, { passive: false });
  canvas.addEventListener('touchend', () => { dragging = false; springBack = true; });
})();
