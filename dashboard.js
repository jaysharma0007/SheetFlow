document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIALIZE LUCIDE ICONS
    lucide.createIcons();

    const appGrid = document.querySelector('.app-grid');
    const appItems = document.querySelectorAll('.app-item');
    const launcherContainer = document.getElementById('launcherContainer');
    const appViewport = document.getElementById('appViewport');
    const backBtn = document.getElementById('backBtn');
    const appContent = document.getElementById('appContent');
    const spotlightModal = document.getElementById('spotlightModal');
    const spotlightInput = document.getElementById('spotlightInput');
    const spotlightResults = document.getElementById('spotlightResults');
    const root = document.documentElement;

    let lastClickedIconRect = null;

    // 2. DRAG & DROP LAUNCHER GRID (Supreme SortableJS)
    let isDragging = false;
    new Sortable(appGrid, {
        animation: 250,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        forceFallback: true, // More reliable across browsers
        swapThreshold: 0.65,
        filter: '.dock-divider', // Skip the divider
        onStart: (e) => {
            isDragging = true;
            gsap.to(e.item, { scale: 1.1, duration: 0.2 });
        },
        onEnd: (e) => {
            isDragging = false;
            gsap.to(e.item, { scale: 1, duration: 0.2 });
            lucide.createIcons();
        }
    });

    // 2.1 DOCK MAGNIFICATION (macOS Wave Effect)
    const dockMagnification = () => {
        const dockWrapper = document.querySelector('.app-dock-wrapper');
        const maxScale = 1.5;
        const radius = 180;

        dockWrapper.addEventListener('mousemove', (e) => {
            if (isDragging) return;

            const mouseX = e.clientX;
            const items = document.querySelectorAll('.app-item');

            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const iconCenter = rect.left + rect.width / 2;
                const distance = Math.abs(mouseX - iconCenter);

                if (distance < radius) {
                    const ratio = 1 - (distance / radius);
                    
                    // Snappy macOS "Pop" Interaction
                    const tiltX = (e.clientY - (rect.top + rect.height/2)) * 0.1;
                    const tiltY = (e.clientX - (rect.left + rect.width/2)) * -0.1;

                    gsap.to(item, {
                        scale: 1 + (1.8 - 1) * Math.pow(ratio, 2), // Higher pop scale
                        y: -45 * Math.pow(ratio, 2), // More dramatic lift
                        rotationX: tiltX * ratio,
                        rotationY: tiltY * ratio,
                        duration: 0.15, // Ultra-snappy
                        ease: "elastic.out(1, 0.75)", // Bouncy "Pop" feel
                        overwrite: 'auto'
                    });
                } else {
                    gsap.to(item, { scale: 1, y: 0, rotationX: 0, rotationY: 0, duration: 0.3, ease: "power2.out" });
                }
            });
        });

        dockWrapper.addEventListener('mouseleave', () => {
            document.querySelectorAll('.app-item').forEach(item => {
                gsap.to(item, { scale: 1, y: 0, duration: 0.4, ease: "power2.out" });
            });
        });
    };
    dockMagnification();

    // 3. SPOTLIGHT SEARCH (Cmd + K or /)
    const toggleSpotlight = (forceClose = false) => {
        const isActive = spotlightModal.classList.contains('active');
        if (isActive || forceClose) {
            spotlightModal.classList.remove('active');
            spotlightInput.value = '';
            spotlightResults.innerHTML = '';
        } else {
            spotlightModal.classList.add('active');
            setTimeout(() => spotlightInput.focus(), 50);
        }
    };

    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            toggleSpotlight();
        }
        if (e.key === '/') {
            if (document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                toggleSpotlight();
            }
        }
        if (e.key === 'Escape') toggleSpotlight(true);
    });

    // Mock Search Results
    spotlightInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        if (val.length < 1) {
            spotlightResults.innerHTML = '';
            return;
        }

        const modules = ['Dashboard', 'Orders', 'Customers', 'Inventory', 'Invoices', 'Reports', 'Settings'];
        const results = modules.filter(m => m.toLowerCase().includes(val));
        
        spotlightResults.innerHTML = results.map(m => `
            <div class="search-result" onclick="navigateTo('${m.toLowerCase()}')">
                <i data-lucide="corner-down-right"></i>
                <span class="result-title">${m}</span>
            </div>
        `).join('');
        lucide.createIcons();
    });

    // Supreme Header Command Hub Trigger
    const mainSearchTrigger = document.getElementById('mainSearchTrigger');
    if (mainSearchTrigger) {
        mainSearchTrigger.addEventListener('click', () => toggleSpotlight());
    }

    // 4. THEME ENGINE (Compact Sphere Cycle)
    const themeCycleBtn = document.getElementById('themeCycleBtn');
    const themes = ['dark-mode', 'light-mode', 'neon-mode'];
    const themeIcons = ['moon', 'sun', 'zap'];
    let currentThemeIndex = 0;

    if (themeCycleBtn) {
        themeCycleBtn.addEventListener('click', () => {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            const newTheme = themes[currentThemeIndex];
            const newIcon = themeIcons[currentThemeIndex];

            // Rotary Spin physics
            const currentSvg = themeCycleBtn.querySelector('svg') || themeCycleBtn.querySelector('i');
            gsap.to(currentSvg, {
                rotation: 180,
                scale: 0.5,
                opacity: 0,
                duration: 0.25,
                onComplete: () => {
                    themeCycleBtn.innerHTML = `<i data-lucide="${newIcon}"></i>`;
                    lucide.createIcons();
                    const nextSvg = themeCycleBtn.querySelector('svg');
                    gsap.fromTo(nextSvg, 
                        { rotation: -180, scale: 0.5, opacity: 0 }, 
                        { rotation: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)" }
                    );
                }
            });

            root.classList.remove(...themes);
            if (newTheme !== 'dark-mode') root.classList.add(newTheme);

            // Settle generic UI back into its bobbing state
            gsap.fromTo(".app-item", 
                { y: 20, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "back.out(1.5)" });

            gsap.fromTo(".logo span, .app-icon svg", 
                { opacity: 0.7, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4 });
        });
    }

    // 5. DASHBOARD ENTRY ANIMATION (macOS WOW! Effect)
    const dashboardEntry = () => {
        const tl = gsap.timeline({ delay: 0.5 }); // Cinematic OS build

        const centralBranding = document.querySelector('.central-branding-container');
        const dockWrapper = document.querySelector('.app-dock-wrapper');

        // Initial hidden state
        gsap.set(centralBranding, { opacity: 0, scale: 0.8, y: 30 });
        gsap.set(dockWrapper, { opacity: 0, y: 100 });
        gsap.set(".app-item", { opacity: 0, scale: 0.8 });

        // 1. Central Logo Revealing Focus
        tl.to(centralBranding, {
            duration: 1.8,
            scale: 1,
            y: 0,
            opacity: 1,
            ease: "expo.out"
        });

        // 2. Central Logo Revealing Focus
        tl.to(centralBranding, {
            duration: 1.8,
            scale: 1,
            y: 0,
            opacity: 1,
            ease: "expo.out"
        }, "-=0.8");

        // 2. Dock sliding up from bottom
        tl.to(dockWrapper, {
            duration: 1.2,
            y: 0,
            opacity: 1,
            ease: "back.out(1.2)"
        }, "-=1.2");

        // 3. Dock icons staggered bounce
        tl.to(".app-item", {
            duration: 1,
            scale: 1,
            opacity: 1,
            stagger: 0.05,
            ease: "back.out(2)",
            delay: -0.8
        });

    };
    dashboardEntry();

    // 6. APP OPENING / CLOSING ENGINE (60 FPS Native Transforms)
    const openApp = (element, type) => {
        // Measure exactly where the icon is on the screen natively
        const icon = element.querySelector('.app-icon');
        lastClickedIconRect = icon.getBoundingClientRect();
        
        // Push content inside the viewport immediately but hide it
        showAppContent(type);
        gsap.set(appContent, { opacity: 0 }); 
        
        // Wrap appViewport physically around the dock icon via inline styles
        appViewport.style.pointerEvents = 'auto'; // Prevent clicking beneath it while expanding
        gsap.set(appViewport, {
            opacity: 1,
            top: lastClickedIconRect.top,
            left: lastClickedIconRect.left,
            width: lastClickedIconRect.width,
            height: lastClickedIconRect.height,
            borderRadius: '16px',
            scale: 1,
            xPercent: 0,
            yPercent: 0,
            transform: 'none' // Strip native centering
        });
        
        // GPU Accelerate the viewport out to fill the screen! Smooth 60 FPS.
        gsap.to(appViewport, {
            duration: 0.5,
            top: '50%',
            left: '50%',
            width: '100vw',
            height: '100vh',
            xPercent: -50,
            yPercent: -50,
            borderRadius: 0,
            ease: "expo.out",
            onComplete: () => {
                appViewport.classList.add('active'); // CSS Takes control
                gsap.set(appViewport, { clearProps: "all" }); // Destroys glitch-inducing inline rules
            }
        });
        
        // Stagger fade-in the inner content perfectly midway
        gsap.to(appContent, { opacity: 1, duration: 0.3, delay: 0.2, ease: "power2.out" });
        
        // Push the dashboard beautifully into the background Z-layer
        gsap.to(launcherContainer, { opacity: 0, scale: 0.96, duration: 0.5, ease: "power2.inOut" });
    };

    const showAppContent = (type) => {
        appContent.innerHTML = `
            <div class="minimize-btn" onclick="minimizeApp()" title="Minimize to Dock"></div>
            <div class="module-view reveal-up">
                <header class="module-header">
                    <h1 class="visual-title"><span class="gradient-text">${type.charAt(0).toUpperCase() + type.slice(1)}</span> Powerhouse</h1>
                    <p class="visual-description">The automated business engine for your ${type} pipeline.</p>
                </header>
                <div class="module-mockup-grid">
                    <div class="glass-card" style="height: 250px;"></div>
                    <div class="glass-card" style="height: 250px;"></div>
                    <div class="glass-card" style="height: 250px; grid-column: span 2;"></div>
                </div>
            </div>
        `;
    };

    window.minimizeApp = () => {
        if (!lastClickedIconRect) return;
        
        // Prepare variables exactly where viewport is right now
        const rect = appViewport.getBoundingClientRect();
        appViewport.classList.remove('active'); // Detach CSS to allow GSAP absolute control

        gsap.set(appViewport, {
            top: rect.top, left: rect.left, width: rect.width, height: rect.height, transform: 'none'
        });

        // Instantly destroy inner content to prevent layout thrashing while shrinking
        appContent.innerHTML = '';
        
        // Fluidly suck the viewport straight back down into the exact origin dock icon
        gsap.to(appViewport, {
            duration: 0.45,
            top: lastClickedIconRect.top,
            left: lastClickedIconRect.left,
            width: lastClickedIconRect.width,
            height: lastClickedIconRect.height,
            opacity: 0,
            borderRadius: '16px',
            ease: "expo.out",
            onComplete: () => {
                gsap.set(appViewport, { clearProps: "all" }); // Total cleanup to stop ghosts
                appViewport.style.pointerEvents = 'none'; // Lock out clicks
            }
        });

        // Pop the background UI back up!
        gsap.to(launcherContainer, { 
            opacity: 1, scale: 1, duration: 0.45, delay: 0.05, ease: "back.out(1.2)" 
        });
    };

    appItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('app-item') || e.target.closest('.app-item')) {
                openApp(item, item.getAttribute('data-app'));
            }
        });
    });

    // Global navigation for search results
    window.navigateTo = (app) => {
        toggleSpotlight(true);
        const item = document.querySelector(`.app-item[data-app="${app}"]`);
        if (item) openApp(item, app);
    };
});
