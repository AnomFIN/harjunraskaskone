/* ========================================
   Suvenkari v1.0 - Premium JavaScript Interactions
   Smooth scroll, scrollspy, filter, validation, animations
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

    function easeOutCubic(t) {
        return (--t) * t * t + 1;
    }

    // ============= Module 1: Header & Scroll Effects =============

    function initHeader() {
        const header = document.querySelector('.suv-header');
        if (!header) return;

        let ticking = false;

        function updateHeader() {
            const scrollY = window.scrollY;
            
            if (scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

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

    // ============= Module 2: Smooth Scroll =============

    function initSmoothScroll() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (!href || href === '#') return;
                
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    const header = document.querySelector('.suv-header');
                    const headerHeight = header?.offsetHeight || 88;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: prefersReducedMotion ? 'auto' : 'smooth'
                    });
                }
            });
        });
    }

    // ============= Module 3: Scrollspy / Active Nav Highlighting =============

    function initScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.suv-nav-link[href^="#"]');
        
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

    // ============= Module 4: Back to Top Button =============

    function initBackToTop() {
        const backToTopButton = document.querySelector('.suv-back-to-top');
        if (!backToTopButton) return;

        let ticking = false;

        function updateVisibility() {
            if (window.scrollY > 600) {
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

    // ============= Module 5: Service Filter/Search =============

    function initServiceFilter() {
        const searchInput = document.getElementById('serviceSearch');
        const serviceCards = document.querySelectorAll('.suv-service-card');
        
        if (!searchInput || !serviceCards.length) return;

        const filterServices = debounce(function() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            serviceCards.forEach(card => {
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const description = card.querySelector('p')?.textContent.toLowerCase() || '';
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = '';
                    if (!prefersReducedMotion) {
                        card.style.animation = 'fadeIn 300ms ease-out';
                    }
                } else {
                    card.style.display = 'none';
                }
            });

            // Show message if no results
            const visibleCards = Array.from(serviceCards).filter(card => card.style.display !== 'none');
            let noResultsMsg = document.getElementById('noServiceResults');
            
            if (visibleCards.length === 0 && searchTerm) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('p');
                    noResultsMsg.id = 'noServiceResults';
                    noResultsMsg.className = 'suv-no-results';
                    noResultsMsg.textContent = 'Ei hakutuloksia. Kokeile toista hakusanaa.';
                    searchInput.parentElement.insertAdjacentElement('afterend', noResultsMsg);
                }
            } else if (noResultsMsg) {
                noResultsMsg.remove();
            }
        }, 250);

        searchInput.addEventListener('input', filterServices);
    }

    // ============= Module 6: Contact Form Validation =============

    function initFormValidation() {
        const form = document.getElementById('suvenkariContactForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input[required], textarea[required]');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
                updateSubmitButton();
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                    updateSubmitButton();
                }
            });
        });

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
                if (!phoneRegex.test(value) || value.length < 7) {
                    isValid = false;
                    message = 'Anna kelvollinen puhelinnumero';
                }
            }

            const formGroup = field.closest('.suv-form-group');
            if (formGroup) {
                let errorEl = formGroup.querySelector('.suv-field-error');
                
                if (!isValid) {
                    field.classList.add('error');
                    if (!errorEl) {
                        errorEl = document.createElement('span');
                        errorEl.className = 'suv-field-error';
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

        function updateSubmitButton() {
            const allValid = Array.from(inputs).every(input => {
                return !input.hasAttribute('required') || 
                       (input.value.trim() && !input.classList.contains('error'));
            });
            
            if (submitBtn) {
                submitBtn.disabled = !allValid;
            }
        }

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

        // Initial check
        updateSubmitButton();
    }

    function submitForm(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Lähetetään...';
        submitBtn.disabled = true;

        // Create FormData from form
        const formData = new FormData(form);

        // Submit to PHP backend
        fetch('contact_submit.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, 'success');
                form.reset();
                
                // Re-disable submit button after reset
                setTimeout(() => {
                    submitBtn.disabled = false;
                    const inputs = form.querySelectorAll('input[required], textarea[required]');
                    inputs.forEach(input => {
                        if (!input.value.trim()) {
                            submitBtn.disabled = true;
                        }
                    });
                }, 100);
            } else {
                showToast(data.message || 'Viestin lähetys epäonnistui. Yritä uudelleen.', 'error');
                submitBtn.disabled = false;
            }
            submitBtn.textContent = originalText;
        })
        .catch(error => {
            console.error('Form submission error:', error);
            showToast('Viestin lähetys epäonnistui. Tarkista verkkoyhteytesi ja yritä uudelleen.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }

    // ============= Module 7: Toast Notifications =============

    function initToasts() {
        const container = document.createElement('div');
        container.className = 'suv-toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }

    function showToast(message, type = 'info') {
        const container = document.querySelector('.suv-toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `suv-toast suv-toast-${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4500);
    }

    window.showToast = showToast;

    // ============= Module 8: Reveal on Scroll Animations =============

    function initRevealAnimations() {
        if (prefersReducedMotion) return;

        const revealElements = document.querySelectorAll('[data-reveal]');
        if (revealElements.length === 0) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -80px 0px'
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

    // ============= Module 9: Count-up Animation for Stats =============

    function initCountUpAnimations() {
        if (prefersReducedMotion) return;

        const counters = document.querySelectorAll('[data-countup]');
        if (counters.length === 0) return;

        const observerOptions = {
            threshold: 0.6,
            rootMargin: '0px'
        };

        const animateCounter = (element) => {
            const targetText = element.getAttribute('data-countup');
            const numericMatch = targetText.match(/[\d,\.]+/);
            
            if (!numericMatch) return;
            
            const numericPart = numericMatch[0].replace(/,/g, '');
            const target = parseFloat(numericPart);
            const prefix = targetText.substring(0, numericMatch.index);
            const suffix = targetText.substring(numericMatch.index + numericMatch[0].length);
            const isDecimal = numericPart.includes('.');
            const duration = 2000;
            const start = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOutCubic(progress);
                const current = eased * target;
                
                if (isDecimal) {
                    element.textContent = prefix + current.toFixed(1).replace('.', ',') + suffix;
                } else {
                    element.textContent = prefix + Math.floor(current).toLocaleString('fi-FI') + suffix;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.textContent = targetText;
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

    // ============= Module 10: Mobile Navigation =============

    function initMobileNav() {
        const navToggle = document.querySelector('.suv-nav-toggle');
        const nav = document.querySelector('.suv-nav');
        const navLinks = document.querySelectorAll('.suv-nav-link');

        if (!navToggle || !nav) return;

        navToggle.addEventListener('click', function() {
            const isActive = nav.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 968) {
                    nav.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !nav.contains(e.target)) {
                nav.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ============= Module 11: Copy to Clipboard =============

    function initCopyButtons() {
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

    // ============= Module 12: Update Year =============

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
        initSmoothScroll();
        initScrollSpy();
        initBackToTop();
        initServiceFilter();
        initFormValidation();
        initToasts();
        initRevealAnimations();
        initCountUpAnimations();
        initMobileNav();
        initCopyButtons();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
