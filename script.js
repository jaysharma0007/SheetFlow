// Initialize Lucide Icons first
lucide.createIcons();

const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Single synchronized scroll handler for performance
lenis.on('scroll', (e) => {
    // Navbar Scroll Toggle
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (e.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // GSAP ScrollTrigger Sync (Crucial for Lenis + ScrollTrigger)
    ScrollTrigger.update();
});

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Navbar Scroll Toggle (Synchronized with Lenis)
lenis.on('scroll', (e) => {
    const navbar = document.querySelector('.navbar');
    if (e.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// UI Components Reveal Logic (iOS Unlock Style)
const revealUpElements = document.querySelectorAll('.reveal-up');
revealUpElements.forEach((el) => {
    // Set initial state for snappy entrance
    gsap.set(el, { opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' });
    gsap.to(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none"
        },
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: "back.out(1.4)", // Springy iOS feel
        stagger: 0.1
    });
});

const revealLeftElements = document.querySelectorAll('.reveal-left');
revealLeftElements.forEach((el) => {
    gsap.set(el, { opacity: 0, x: -50, filter: 'blur(10px)' });
    gsap.to(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none"
        },
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        duration: 1.4,
        ease: "power4.out"
    });
});

const revealScaleElements = document.querySelectorAll('.reveal-scale');
revealScaleElements.forEach((el) => {
    gsap.set(el, { opacity: 0, scale: 0.85, filter: 'blur(5px)' });
    gsap.to(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none"
        },
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.5,
        ease: "back.out(1.2)"
    });
});

// Parallax Effect Logic (Synchronized with Lenis)
lenis.on('scroll', (e) => {
    const scrolled = e.scrollY;
    // Cache selectors for performance
    document.querySelectorAll('.parallax').forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 0.1;
        const yPos = -(scrolled * speed);
        gsap.to(el, {
            y: yPos,
            duration: 0.1,
            ease: "none",
            overwrite: "auto"
        });
    });
});

// Stats Counter Animation
const statNumbers = document.querySelectorAll('.stat-number');
statNumbers.forEach((stat) => {
    const target = parseInt(stat.dataset.target);
    
    ScrollTrigger.create({
        trigger: stat,
        start: "top 90%",
        onEnter: () => {
            let current = 0;
            const step = Math.ceil(target / 100);
            const interval = setInterval(() => {
                current += step;
                if (current >= target) {
                    stat.textContent = target + (stat.textContent.includes('%') ? '%' : '+');
                    clearInterval(interval);
                } else {
                    stat.textContent = current + (stat.textContent.includes('%') ? '%' : '+');
                }
            }, 20);
        }
    });
});

// Placeholder Image for Dashboard
const mockupImg = document.getElementById('dashboard_mockup');
if (mockupImg) {
    mockupImg.src = `https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop`;
}

// Hero Subtle Floating Animation (Request Animation Frame)
const heroFloatingElements = document.querySelectorAll('.shape');
let floatOffset = 0;
function animateHeroFloating() {
    floatOffset += 0.02;
    heroFloatingElements.forEach((el, index) => {
        const xAmplitude = 30 + index * 5;
        const yAmplitude = 20 + index * 10;
        const x = Math.sin(floatOffset + index) * xAmplitude;
        const y = Math.cos(floatOffset * 0.8 + index) * yAmplitude;
        el.style.transform = `translate(${x}px, ${y}px)`;
    });
    requestAnimationFrame(animateHeroFloating);
}
animateHeroFloating();

// Mobile Menu Toggle Logic
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('active');
        const icon = mobileNavToggle.querySelector('i');
        
        if (isOpen) {
            icon.setAttribute('data-lucide', 'x');
            // GSAP Menu Entrance
            gsap.fromTo(mobileMenu, 
                { opacity: 0, y: -20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
            );
            // Staggered Link Entrance
            gsap.fromTo(mobileLinks,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, delay: 0.2, ease: "power2.out" }
            );
        } else {
            icon.setAttribute('data-lucide', 'menu');
            // GSAP Menu Exit
            gsap.to(mobileMenu, { opacity: 0, y: -10, duration: 0.3, ease: "power2.in" });
        }
        lucide.createIcons();
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileNavToggle.querySelector('i').setAttribute('data-lucide', 'menu');
            lucide.createIcons();
            document.body.style.overflow = '';
        });
    });
}

// Refresh ScrollTrigger on Resize
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});
