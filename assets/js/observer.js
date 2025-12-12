/* ========================================
   Harjun Raskaskone v1.1 - Intersection Observer
   Active navigation section highlighting
   ======================================== */

(function() {
    'use strict';

    function initSectionObserver() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        if (!sections.length || !navLinks.length) return;

        // Create a map of section IDs to nav links
        const navLinkMap = new Map();
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                const sectionId = href.substring(1);
                navLinkMap.set(sectionId, link);
            }
        });

        // Intersection Observer options
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // Trigger when section is roughly in viewport center
            threshold: 0
        };

        // Track the currently active section
        let currentActiveId = null;

        // Observer callback
        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    
                    // Only update if it's different from current
                    if (sectionId !== currentActiveId) {
                        currentActiveId = sectionId;
                        
                        // Remove active class from all nav links
                        navLinks.forEach(link => link.classList.remove('active'));
                        
                        // Add active class to corresponding nav link
                        const activeLink = navLinkMap.get(sectionId);
                        if (activeLink) {
                            activeLink.classList.add('active');
                        }
                    }
                }
            });
        };

        // Create observer
        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all sections
        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Initialize on DOM ready
    function init() {
        // Check if IntersectionObserver is supported
        if ('IntersectionObserver' in window) {
            initSectionObserver();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
