/* ========================================
   Rakennusliike Suvenkari v5.0 - Premium JavaScript
   High-investment UX engineering with smooth interactions
   ======================================== */

(function() {
    'use strict';

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ============= Utility Functions =============

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function easeOutQuad(t) {
        return t * (2 - t);
    }

    function easeOutCubic(t) {
        return (--t) * t * t + 1;
    }

    // ============= Module 1: Header & Scroll Progress =============

    function initHeader() {
        const header = document.getElementById('header');
        if (!header) return;

        let ticking = false;
        let lastScrollY = 0;

        function updateHeader() {
            const scrollY = window.scrollY;
            
            // Sticky header with blur/opacity
            if (scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScrollY = scrollY;
            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick, { passive: true });
        updateHeader();
    }

    function initScrollProgress() {
        if (prefersReducedMotion) return;

        // Create scroll progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.setAttribute('aria-hidden', 'true');
        document.body.appendChild(progressBar);

        let ticking = false;

        function updateProgress() {
            const winScroll = document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                window.requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // ============= Module 2: Navigation =============

    function initMobileNav() {
        const navToggle = document.getElementById('navToggle');
        const navList = document.getElementById('navList');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!navToggle || !navList) return;

        navToggle.addEventListener('click', function() {
            const isActive = navList.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navList.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navList.contains(e.target)) {
                navList.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function initSmoothScroll() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (!href || href === '#') return;
                
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    const headerHeight = document.getElementById('header')?.offsetHeight || 80;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: prefersReducedMotion ? 'auto' : 'smooth'
                    });
                }
            });
        });
    }

    function initScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        if (!sections.length || !navLinks.length) return;

        const navLinkMap = new Map();
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                navLinkMap.set(href.substring(1), link);
            }
        });

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        let currentActive = null;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    if (sectionId !== currentActive) {
                        currentActive = sectionId;
                        navLinks.forEach(link => link.classList.remove('active'));
                        const activeLink = navLinkMap.get(sectionId);
                        if (activeLink) activeLink.classList.add('active');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    // ============= Module 3: Back to Top Button =============

    function initBackToTop() {
        const backToTopButton = document.getElementById('backToTop');
        if (!backToTopButton) return;

        let ticking = false;

        function updateVisibility() {
            if (window.scrollY > 500) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                window.requestAnimationFrame(updateVisibility);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick, { passive: true });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    }

    // ============= Module 4: Section Reveal System =============

    function initReveal() {
        if (prefersReducedMotion) return;

        const revealElements = document.querySelectorAll('[data-reveal]');
        if (revealElements.length === 0) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => observer.observe(el));
    }

    // ============= Module 5: Counter Animation =============

    function initCounters() {
        if (prefersReducedMotion) return;

        const counters = document.querySelectorAll('[data-counter]');
        if (counters.length === 0) return;

        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const animateCounter = (element) => {
            const target = parseInt(element.getAttribute('data-counter'));
            const duration = 2000;
            const start = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOutCubic(progress);
                const current = Math.floor(eased * target);
                
                element.textContent = current.toLocaleString('fi-FI');
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.textContent = target.toLocaleString('fi-FI');
                }
            }

            requestAnimationFrame(update);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        counters.forEach(counter => observer.observe(counter));
    }

    // ============= Module 6: FAQ Accordion =============

    function initAccordion() {
        const faqQuestions = document.querySelectorAll('.faq-question, .faq-question-enhanced');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                
                // Close all others
                faqQuestions.forEach(q => {
                    if (q !== this) {
                        q.setAttribute('aria-expanded', 'false');
                    }
                });
                
                // Toggle current
                this.setAttribute('aria-expanded', !isExpanded);
            });
        });

        // Keyboard navigation
        faqQuestions.forEach((question, index) => {
            question.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = faqQuestions[index + 1];
                    if (next) next.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = faqQuestions[index - 1];
                    if (prev) prev.focus();
                }
            });
        });
    }

    // ============= Module 7: Form Validation & Toast =============

    function initForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });

            if (isValid) {
                submitForm(form);
            }
        });
    }

    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'Tämä kenttä on pakollinen';
        } else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Anna kelvollinen sähköpostiosoite';
            }
        } else if (field.type === 'tel' && value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                message = 'Anna kelvollinen puhelinnumero';
            }
        }

        const formGroup = field.closest('.form-group');
        if (formGroup) {
            let errorEl = formGroup.querySelector('.field-error');
            
            if (!isValid) {
                field.classList.add('error');
                if (!errorEl) {
                    errorEl = document.createElement('span');
                    errorEl.className = 'field-error';
                    formGroup.appendChild(errorEl);
                }
                errorEl.textContent = message;
            } else {
                field.classList.remove('error');
                if (errorEl) errorEl.remove();
            }
        }

        return isValid;
    }

    function submitForm(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Lähetetään...';
        submitBtn.disabled = true;

        // Simulate submission (since no backend endpoint)
        setTimeout(() => {
            showToast('Viesti lähetetty onnistuneesti! Otamme yhteyttä pian.', 'success');
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1000);
    }

    // ============= Module 8: Toast Notifications =============

    function initToasts() {
        // Create toast container
        const container = document.createElement('div');
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }

    function showToast(message, type = 'info') {
        const container = document.querySelector('.toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Make showToast globally available
    window.showToast = showToast;

    // ============= Module 9: Copy to Clipboard =============

    function initClipboard() {
        const copyButtons = document.querySelectorAll('[data-copy]');
        
        copyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const textToCopy = this.getAttribute('data-copy');
                
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        showToast('Kopioitu leikepöydälle', 'success');
                    }).catch(() => {
                        showToast('Kopiointi epäonnistui', 'error');
                    });
                } else {
                    // Fallback for older browsers
                    const textarea = document.createElement('textarea');
                    textarea.value = textToCopy;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    try {
                        document.execCommand('copy');
                        showToast('Kopioitu leikepöydälle', 'success');
                    } catch (err) {
                        showToast('Kopiointi epäonnistui', 'error');
                    }
                    document.body.removeChild(textarea);
                }
            });
        });
    }

    // ============= Module 10: Premium Visual Effects =============

    function initFx() {
        if (prefersReducedMotion) return;

        // Subtle parallax on hero
        const hero = document.querySelector('.hero');
        if (hero) {
            let ticking = false;
            
            function updateParallax() {
                const scrolled = window.scrollY;
                const rate = scrolled * 0.05; // Very subtle
                hero.style.transform = `translateY(${rate}px)`;
                ticking = false;
            }

            function requestTick() {
                if (!ticking && window.scrollY < window.innerHeight) {
                    window.requestAnimationFrame(updateParallax);
                    ticking = true;
                }
            }

            window.addEventListener('scroll', requestTick, { passive: true });
        }

        // Button interaction enhancements
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                if (!prefersReducedMotion) {
                    this.style.transform = 'translateY(-2px)';
                }
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });

        // Card hover enhancements
        const cards = document.querySelectorAll('.bento-card, .service-card, .trust-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                if (!prefersReducedMotion) {
                    this.style.transform = 'translateY(-4px)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }

    // ============= Utility: Update Year =============

    function updateYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // ============= Initialize All Modules =============

    function init() {
        updateYear();
        initHeader();
        initScrollProgress();
        initMobileNav();
        initSmoothScroll();
        initScrollSpy();
        initBackToTop();
        initReveal();
        initCounters();
        initAccordion();
        initForm();
        initToasts();
        initClipboard();
        initFx();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
