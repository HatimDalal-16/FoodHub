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

gsap.registerPlugin(ScrollTrigger);

// Set initial off-screen positions
gsap.set(".vision-left", { x: "-110vw" });
gsap.set(".vision-right", { x: "110vw" });

// Animate in on scroll
gsap.to(".vision-left", {
  x: 0,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".vision-wrap",
    start: "top 80%",   // when top of vision block hits 80% down viewport
    end: "top 30%",     // fully in by 30%
    scrub: 1,           // ties to scroll position (remove for snap animation)
  }
});

gsap.to(".vision-right", {
  x: 0,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".vision-wrap",
    start: "top 80%",
    end: "top 30%",
    scrub: 1,
  }
});