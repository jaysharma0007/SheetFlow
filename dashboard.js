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

            // Icon Swapping Logic (Dynamic Morphing + Color Preservation)
            const iconMap = {
                'dark-mode': ['layout', 'shopping-bag', 'contact-2', 'container', 'receipt', 'pie-chart', 'shapes', 'command'],
                'light-mode': ['layout', 'shopping-bag', 'contact-2', 'container', 'receipt', 'pie-chart', 'shapes', 'command'], 
                'neon-mode': ['cpu', 'zap', 'activity', 'globe', 'fingerprint', 'layers', 'box', 'terminal']
            };

            const currentSet = iconMap[newTheme] || iconMap['dark-mode'];
            const dockIcons = document.querySelectorAll('.app-item i, .app-item svg');
            
            dockIcons.forEach((icon, i) => {
                if (currentSet[i]) {
                    icon.outerHTML = `<i data-lucide="${currentSet[i]}"></i>`;
                }
            });
            lucide.createIcons();

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

    // 6. APP OPENING / CLOSING ENGINE
    const openApp = (element, type) => {
        const icon = element.querySelector('.app-icon');
        lastClickedIconRect = icon.getBoundingClientRect();
        
        const clone = icon.cloneNode(true);
        clone.classList.add('app-clone');
        document.body.appendChild(clone);
        
        gsap.set(clone, {
            position: 'fixed',
            top: lastClickedIconRect.top,
            left: lastClickedIconRect.left,
            width: lastClickedIconRect.width,
            height: lastClickedIconRect.height,
            borderRadius: '20px',
            zIndex: 9999,
            margin: 0
        });

        const tl = gsap.timeline({ onComplete: () => showAppContent(type) });
        gsap.to(launcherContainer, { opacity: 0, scale: 0.9, duration: 0.4, ease: "power2.inOut" });

        tl.to(clone, {
            duration: 0.6,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 0,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        });
    };

    const showAppContent = (type) => {
        appViewport.classList.add('active');
        appContent.innerHTML = `
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
        document.querySelectorAll('.app-clone').forEach(c => c.remove());
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
