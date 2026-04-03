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
    new Sortable(appGrid, {
        animation: 300,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        forceFallback: true, // More reliable across browsers
        swapThreshold: 0.65,
        onStart: (e) => {
            gsap.to(e.item, { scale: 1.1, duration: 0.2 });
        },
        onEnd: (e) => {
            gsap.to(e.item, { scale: 1, duration: 0.2 });
            lucide.createIcons();
        }
    });

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

    spotlightModal.addEventListener('click', (e) => {
        if (e.target === spotlightModal) toggleSpotlight(true);
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

    // 4. THEME ENGINE (Segmented Version)
    const themeSegments = document.querySelectorAll('.theme-segment');
    const themeSlider = document.getElementById('themeSlider');
    const themes = ['dark-mode', 'light-mode', 'neon-mode'];

    themeSegments.forEach((segment, index) => {
        segment.addEventListener('click', () => {
            const newTheme = segment.getAttribute('data-theme');
            
            // Move Slider: 3.5rem (width) + 0.5rem (gap) = 4rem offset per item
            const moveAmount = index * 4; 
            gsap.to(themeSlider, { 
                x: `${moveAmount}rem`, 
                duration: 0.5, 
                ease: "back.out(1.5)" 
            });

            // Update Body Class
            root.classList.remove(...themes);
            if (newTheme !== 'dark-mode') {
                root.classList.add(newTheme);
            }

            // High-fidelity feedback for contrast sync
            gsap.fromTo(".app-label, .launcher-header span, .logo span, .theme-segment", 
                { opacity: 0.7 }, { opacity: 1, duration: 0.4 });
        });
    });

    // 5. DASHBOARD ENTRY ANIMATION (WOW! Effect)
    const dashboardEntry = () => {
        const tl = gsap.timeline({ delay: 0.5 }); // Cinematic 500ms delay

        // Initial hidden state to prevent flash
        gsap.set(launcherContainer, { opacity: 0, scale: 0.95 });
        gsap.set(".app-item", { opacity: 0, y: 80, scale: 0.8 });

        // Background / Overall Zoom Entrance
        tl.to(launcherContainer, {
            duration: 1.5,
            scale: 1,
            opacity: 1,
            ease: "expo.out"
        });

        // App Icon fly-in stagger with Spring Physics
        tl.to(".app-item", {
            duration: 1.2,
            y: 0,
            scale: 1,
            opacity: 1,
            stagger: 0.08,
            ease: "back.out(2)", // High-end "Unlock" Bounce
            delay: -1.2 // Overlap with zoom
        });

        // Soft intensity build for branding
        tl.from(".launcher-header, .launcher-footer", {
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        }, "-=0.5");
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

    backBtn.addEventListener('click', () => {
        if (!lastClickedIconRect) return;
        gsap.to(appViewport, {
            duration: 0.6,
            top: lastClickedIconRect.top + (lastClickedIconRect.height / 2),
            left: lastClickedIconRect.left + (lastClickedIconRect.width / 2),
            width: lastClickedIconRect.width,
            height: lastClickedIconRect.height,
            scale: 0.5,
            opacity: 0,
            borderRadius: '20px',
            ease: "cubic-bezier(0.22, 1, 0.36, 1)",
            onComplete: () => {
                appViewport.classList.remove('active');
                gsap.set(appViewport, { top: '50%', left: '50%', width: '100%', height: '100vh', borderRadius: 0, scale: 1 });
                gsap.to(launcherContainer, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.2)" });
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
