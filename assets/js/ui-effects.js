/* ========================================
   Rakennusliike Suvenkari - Premium UI Microinteractions
   Smooth animations, scroll reveals, progress bars, count-ups
   ======================================== */

(function() {
    'use strict';

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ============= Easing Functions =============

    function easeOutCubic(t) {
        return (--t) * t * t + 1;
    }

    function easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }

    // ============= Scroll Reveal System =============

    function initRevealAnimations() {
        if (prefersReducedMotion) return;

        const revealElements = document.querySelectorAll('[data-reveal]');
        if (revealElements.length === 0) return;

        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -80px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger the reveal slightly for sequential items
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, index * 80); // 80ms stagger
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => {
            el.classList.add('reveal-element');
            observer.observe(el);
        });
    }

    // ============= Progress Bar Animations (5-bar section) =============

    function initProgressBars() {
        if (prefersReducedMotion) return;

        const progressBars = document.querySelectorAll('[data-progress]');
        if (progressBars.length === 0) return;

        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const animateProgress = (element) => {
            const targetPercent = parseInt(element.getAttribute('data-progress'));
            const duration = 1200; // 1.2 seconds
            const start = performance.now();

            const progressFill = element.querySelector('.progress-fill');
            if (!progressFill) return;

            function update(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOutQuart(progress);
                const current = Math.floor(eased * targetPercent);
                
                progressFill.style.width = current + '%';
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }

            requestAnimationFrame(update);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateProgress(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        progressBars.forEach(bar => observer.observe(bar));
    }

    // ============= Counter Animation (Count-up numbers) =============

    function initCounters() {
        if (prefersReducedMotion) return;

        const counters = document.querySelectorAll('[data-count-to]');
        if (counters.length === 0) return;

        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const animateCounter = (element) => {
            const target = parseFloat(element.getAttribute('data-count-to'));
            const suffix = element.getAttribute('data-count-suffix') || '';
            const prefix = element.getAttribute('data-count-prefix') || '';
            const decimals = element.getAttribute('data-count-decimals') || 0;
            const duration = 1800; // 1.8 seconds
            const start = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOutCubic(progress);
                const current = eased * target;
                
                element.textContent = prefix + current.toFixed(decimals) + suffix;
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.textContent = prefix + target.toFixed(decimals) + suffix;
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

    // ============= Enhanced FAQ Accordion =============

    function initEnhancedAccordion() {
        const faqItems = document.querySelectorAll('.faq-item-enhanced');
        if (faqItems.length === 0) return;

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question-enhanced');
            const answer = item.querySelector('.faq-answer-enhanced');
            const icon = question.querySelector('.faq-icon');
            
            if (!question || !answer) return;

            // Set initial state
            answer.style.maxHeight = '0';
            answer.style.overflow = 'hidden';
            answer.style.transition = prefersReducedMotion ? 'none' : 'max-height 450ms cubic-bezier(0.4, 0, 0.2, 1), opacity 350ms ease';
            answer.style.opacity = '0';

            question.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                
                // Close all other accordions
                faqItems.forEach(otherItem => {
                    const otherQuestion = otherItem.querySelector('.faq-question-enhanced');
                    const otherAnswer = otherItem.querySelector('.faq-answer-enhanced');
                    const otherIcon = otherQuestion.querySelector('.faq-icon');
                    
                    if (otherItem !== item) {
                        otherQuestion.setAttribute('aria-expanded', 'false');
                        otherAnswer.style.maxHeight = '0';
                        otherAnswer.style.opacity = '0';
                        if (otherIcon) {
                            otherIcon.style.transform = 'rotate(0deg)';
                        }
                    }
                });
                
                // Toggle current accordion
                if (isExpanded) {
                    this.setAttribute('aria-expanded', 'false');
                    answer.style.maxHeight = '0';
                    answer.style.opacity = '0';
                    if (icon) {
                        icon.style.transform = 'rotate(0deg)';
                    }
                } else {
                    this.setAttribute('aria-expanded', 'true');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    answer.style.opacity = '1';
                    if (icon) {
                        icon.style.transform = 'rotate(45deg)';
                        icon.style.transition = prefersReducedMotion ? 'none' : 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)';
                    }
                }
            });

            // Keyboard support
            question.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }

    // ============= Card Hover Effects =============

    function initCardHoverEffects() {
        if (prefersReducedMotion) return;

        // Risk & Quality cards
        const cards = document.querySelectorAll('.risk-quality-card, .registry-box, .bento-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });
    }

    // ============= Smooth Number Reveal on Financial Metrics =============

    function initFinancialMetrics() {
        if (prefersReducedMotion) return;

        const metrics = document.querySelectorAll('.financial-metric-value');
        if (metrics.length === 0) return;

        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        entry.target.style.transition = 'opacity 500ms ease, transform 600ms cubic-bezier(0.4, 0, 0.2, 1)';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        metrics.forEach(metric => observer.observe(metric));
    }

    // ============= Initialize All Effects =============

    function init() {
        initRevealAnimations();
        initProgressBars();
        initCounters();
        initEnhancedAccordion();
        initCardHoverEffects();
        initFinancialMetrics();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
