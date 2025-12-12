/* ========================================
   Harjun Raskaskone v1.1 - Main JavaScript
   Core functionality: nav toggle, header scroll, back to top
   ======================================== */

(function() {
    'use strict';

    // Update current year in footer
    function updateYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // Mobile navigation toggle
    function initMobileNav() {
        const navToggle = document.getElementById('navToggle');
        const navList = document.getElementById('navList');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!navToggle || !navList) return;

        navToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', 
                navList.classList.contains('active') ? 'true' : 'false'
            );
        });

        // Close mobile menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navList.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navList.contains(e.target)) {
                navList.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Header scroll shadow
    function initHeaderScroll() {
        const header = document.getElementById('header');
        if (!header) return;

        function updateHeaderOnScroll() {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', updateHeaderOnScroll);
        updateHeaderOnScroll(); // Check initial state
    }

    // Back to top button
    function initBackToTop() {
        const backToTopButton = document.getElementById('backToTop');
        if (!backToTopButton) return;

        function updateBackToTopVisibility() {
            if (window.scrollY > 500) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }

        window.addEventListener('scroll', updateBackToTopVisibility);
        updateBackToTopVisibility(); // Check initial state

        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Smooth scroll for anchor links
    function initSmoothScroll() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) return;

        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip empty hash or just #
                if (!href || href === '#') return;
                
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    const headerHeight = document.getElementById('header')?.offsetHeight || 80;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // FAQ Accordion
    function initFAQAccordion() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                
                // Close all other FAQs
                faqQuestions.forEach(q => {
                    if (q !== this) {
                        q.setAttribute('aria-expanded', 'false');
                    }
                });
                
                // Toggle current FAQ
                this.setAttribute('aria-expanded', !isExpanded);
            });
        });
    }

    // Initialize all
    function init() {
        updateYear();
        initMobileNav();
        initHeaderScroll();
        initBackToTop();
        initSmoothScroll();
        initFAQAccordion();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
