/* ========================================
   Premium JavaScript Enhancements
   Advanced UI interactions and animations
   ======================================== */

(function() {
    'use strict';

    // Performance and utility functions
    const throttle = (func, delay) => {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    };

    // ============= Page Loading Animation =============
    function initPageLoader() {
        // Create loader if it doesn't exist
        let loader = document.querySelector('.page-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'page-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <img src="assets/images/logo.png" alt="Loading" class="loader-logo">
                    <div class="loader-text">Ladataan...</div>
                    <div class="loader-progress">
                        <div class="loader-bar"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(loader);
        }

        // Hide loader when page is ready
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('loaded');
                setTimeout(() => {
                    if (loader.parentNode) {
                        loader.parentNode.removeChild(loader);
                    }
                }, 300);
            }, 500);
        });
    }

    // ============= Floating Action Button =============
    function initFloatingActionButton() {
        const fab = document.createElement('button');
        fab.className = 'fab';
        fab.setAttribute('aria-label', 'Takaisin ylös');
        fab.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m18 15-6-6-6 6"/>
            </svg>
        `;
        document.body.appendChild(fab);

        let isVisible = false;

        const toggleFabVisibility = throttle(() => {
            const shouldShow = window.scrollY > 300;
            if (shouldShow && !isVisible) {
                fab.classList.add('visible');
                isVisible = true;
            } else if (!shouldShow && isVisible) {
                fab.classList.remove('visible');
                isVisible = false;
            }
        }, 100);

        fab.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        window.addEventListener('scroll', toggleFabVisibility, { passive: true });
    }

    // ============= Enhanced Stats Counter =============
    function initStatsCounter() {
        const stats = document.querySelectorAll('[data-countup]');
        if (!stats.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    entry.target.classList.add('animated');
                    animateCounter(entry.target);
                    entry.target.parentElement.classList.add('animated');
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));

        function animateCounter(element) {
            const target = element.getAttribute('data-countup');
            const isPercent = target.includes('%');
            const isPlus = target.includes('+');
            const numMatch = target.match(/[\d.,]+/);
            
            if (!numMatch) return;
            
            const finalValue = parseFloat(numMatch[0].replace(',', '.'));
            let current = 0;
            const increment = finalValue / 60; // 60 frames for 1 second
            const duration = 1000;
            const startTime = Date.now();

            function updateCounter() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function
                const eased = 1 - Math.pow(1 - progress, 3);
                current = finalValue * eased;

                let displayValue = Math.round(current * 10) / 10;
                
                if (target.includes(',')) {
                    displayValue = displayValue.toString().replace('.', ',');
                }
                
                element.textContent = 
                    (isPlus ? '+' : '') + 
                    displayValue + 
                    (isPercent ? '%' : '');

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            }

            requestAnimationFrame(updateCounter);
        }
    }

    // ============= Enhanced Form Interactions =============
    function initFormEnhancements() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea');
            
            inputs.forEach(input => {
                // Add floating labels if they don't exist
                if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('suv-form-label')) {
                    const label = document.createElement('label');
                    label.className = 'suv-form-label';
                    label.textContent = input.placeholder || input.getAttribute('aria-label') || '';
                    input.parentNode.insertBefore(label, input.nextSibling);
                }

                // Add focus effects
                input.addEventListener('focus', () => {
                    input.parentElement.classList.add('focused');
                });

                input.addEventListener('blur', () => {
                    input.parentElement.classList.remove('focused');
                });

                // Real-time validation feedback
                if (input.type === 'email') {
                    input.addEventListener('input', throttle(() => {
                        const isValid = input.validity.valid;
                        input.parentElement.classList.toggle('error', !isValid && input.value);
                        input.parentElement.classList.toggle('success', isValid && input.value);
                    }, 300));
                }
            });
        });
    }

    // ============= Smooth Section Transitions =============
    function initSectionAnimations() {
        const sections = document.querySelectorAll('section');
        const options = {
            threshold: 0.1,
            rootMargin: '50px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    entry.target.style.setProperty('--animation-delay', `${index * 0.1}s`);
                    entry.target.classList.add('section-visible');
                }
            });
        }, options);

        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'all 0.8s ease-out var(--animation-delay, 0s)';
            observer.observe(section);
        });

        // Add CSS for visible state
        const style = document.createElement('style');
        style.textContent = `
            .section-visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ============= Interactive Card Effects =============
    function initInteractiveCards() {
        const cards = document.querySelectorAll('.suv-service-feature, .info-box, [class*="card"]');
        
        cards.forEach(card => {
            // Add hover tilt effect
            card.addEventListener('mouseenter', (e) => {
                card.style.transition = 'transform 0.3s ease';
            });

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                
                const rotateX = (mouseY - centerY) / 20;
                const rotateY = (centerX - mouseX) / 20;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });
    }

    // ============= Enhanced Navigation =============
    function initEnhancedNavigation() {
        const nav = document.querySelector('.suv-nav-list');
        if (!nav) return;

        const links = nav.querySelectorAll('.suv-nav-link');
        const indicator = document.createElement('div');
        indicator.className = 'nav-indicator';
        indicator.style.cssText = `
            position: absolute;
            bottom: 0;
            height: 3px;
            background: var(--suv-gradient-copper);
            border-radius: 2px;
            transition: all 0.3s ease;
            opacity: 0;
        `;
        nav.appendChild(indicator);

        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const rect = link.getBoundingClientRect();
                const navRect = nav.getBoundingClientRect();
                indicator.style.left = `${rect.left - navRect.left}px`;
                indicator.style.width = `${rect.width}px`;
                indicator.style.opacity = '1';
            });
        });

        nav.addEventListener('mouseleave', () => {
            indicator.style.opacity = '0';
        });
    }

    // ============= Parallax Effects =============
    function initParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.suv-hero-visual img, .process-step-image img');
        
        const handleParallax = throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const rate = scrolled * -0.5;
                element.style.transform = `translateY(${rate}px)`;
            });
        }, 16);

        if (parallaxElements.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            window.addEventListener('scroll', handleParallax, { passive: true });
        }
    }

    // ============= Smart Tooltips =============
    function initSmartTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            let tooltip = null;
            
            element.addEventListener('mouseenter', (e) => {
                tooltip = document.createElement('div');
                tooltip.className = 'smart-tooltip';
                tooltip.textContent = element.getAttribute('data-tooltip');
                tooltip.style.cssText = `
                    position: absolute;
                    background: var(--suv-color-bg-dark);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 14px;
                    z-index: 1000;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.2s;
                    box-shadow: var(--suv-shadow-lg);
                `;
                document.body.appendChild(tooltip);
                
                setTimeout(() => {
                    if (tooltip) tooltip.style.opacity = '1';
                }, 10);
            });
            
            element.addEventListener('mousemove', (e) => {
                if (tooltip) {
                    tooltip.style.left = `${e.pageX + 10}px`;
                    tooltip.style.top = `${e.pageY - 40}px`;
                }
            });
            
            element.addEventListener('mouseleave', () => {
                if (tooltip) {
                    tooltip.style.opacity = '0';
                    setTimeout(() => {
                        if (tooltip && tooltip.parentNode) {
                            tooltip.parentNode.removeChild(tooltip);
                        }
                    }, 200);
                }
            });
        });
    }

    // ============= Performance Monitoring =============
    function initPerformanceOptimizations() {
        // Lazy load images that aren't already handled
        const lazyImages = document.querySelectorAll('img:not([loading])');
        lazyImages.forEach(img => {
            img.loading = 'lazy';
        });

        // Optimize animations for slower devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            document.body.classList.add('reduced-animations');
            
            const style = document.createElement('style');
            style.textContent = `
                .reduced-animations * {
                    animation-duration: 0.3s !important;
                    transition-duration: 0.3s !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ============= Initialize Everything =============
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initAll, 100);
            });
        } else {
            setTimeout(initAll, 100);
        }
        
        // Initialize page loader immediately
        initPageLoader();
    }

    function initAll() {
        initFloatingActionButton();
        initStatsCounter();
        initFormEnhancements();
        initSectionAnimations();
        initInteractiveCards();
        initEnhancedNavigation();
        initParallaxEffects();
        initSmartTooltips();
        initPerformanceOptimizations();
        
        // Trigger a custom event when all enhancements are loaded
        window.dispatchEvent(new CustomEvent('premiumUILoaded', {
            detail: { timestamp: Date.now() }
        }));
    }

    // Start initialization
    init();

})();