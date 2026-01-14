/* ========================================
   Mobile-First Popup & Performance Manager
   ======================================== */

(function() {
    'use strict';

    // Mobile performance utilities
    const isMobile = window.innerWidth <= 767;
    const isSlowConnection = navigator.connection && 
        (navigator.connection.effectiveType === 'slow-2g' || 
         navigator.connection.effectiveType === '2g' ||
         navigator.connection.saveData);

    // Cookie Management
    function initCookiePopup() {
        const popup = document.getElementById('cookiePopup');
        const acceptBtn = document.getElementById('acceptCookies');
        const rejectBtn = document.getElementById('rejectCookies');

        if (!popup) return;

        // Check if user has already made choice
        if (localStorage.getItem('cookieChoice')) {
            return;
        }

        // Show popup after 1 second
        setTimeout(() => {
            popup.style.display = 'block';
            popup.classList.add('show');
        }, 1000);

        acceptBtn?.addEventListener('click', () => {
            localStorage.setItem('cookieChoice', 'accepted');
            hidePopup(popup);
            // Initialize analytics if needed
            console.log('Cookies accepted');
        });

        rejectBtn?.addEventListener('click', () => {
            localStorage.setItem('cookieChoice', 'rejected');
            hidePopup(popup);
            console.log('Only essential cookies');
        });
    }

    // Newsletter Management
    function initNewsletterPopup() {
        const popup = document.getElementById('newsletterPopup');
        const closeBtn = document.getElementById('closeNewsletter');
        const form = document.getElementById('newsletterForm');

        if (!popup) return;

        // Check if user has already subscribed or dismissed
        if (localStorage.getItem('newsletterShown') || 
            localStorage.getItem('newsletterSubscribed')) {
            return;
        }

        // Show after 10 seconds on mobile, 20 seconds on desktop
        const delay = isMobile ? 10000 : 20000;
        
        setTimeout(() => {
            // Only show if user is actively engaged (has scrolled)
            if (window.scrollY > 300) {
                showNewsletterPopup();
            } else {
                // Wait for scroll engagement
                const scrollHandler = () => {
                    if (window.scrollY > 300) {
                        showNewsletterPopup();
                        window.removeEventListener('scroll', scrollHandler);
                    }
                };
                window.addEventListener('scroll', scrollHandler, { passive: true });
            }
        }, delay);

        function showNewsletterPopup() {
            popup.style.display = 'flex';
            setTimeout(() => {
                popup.classList.add('show');
            }, 50);
            localStorage.setItem('newsletterShown', 'true');
        }

        closeBtn?.addEventListener('click', () => {
            hidePopup(popup);
        });

        // Close on backdrop click
        popup?.addEventListener('click', (e) => {
            if (e.target === popup) {
                hidePopup(popup);
            }
        });

        // Handle form submission
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('newsletterEmail')?.value;
            const consent = document.getElementById('newsletterConsent')?.checked;
            
            if (!email || !consent) {
                alert('Täytä kaikki kentät ja hyväksy käyttöehdot');
                return;
            }

            try {
                // Simulate API call (replace with real endpoint)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                localStorage.setItem('newsletterSubscribed', 'true');
                showSuccessMessage();
                hidePopup(popup);
            } catch (error) {
                alert('Virhe liittymisessä. Yritä uudelleen.');
            }
        });
    }

    // Utility functions
    function hidePopup(popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.style.display = 'none';
        }, 300);
    }

    function showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-toast';
        message.textContent = 'Kiitos! Olet nyt liittynyt postituslistallemme.';
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--suv-color-success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--suv-shadow-lg);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            message.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 4000);
    }

    // Mobile Performance Optimizations
    function initMobileOptimizations() {
        if (!isMobile) return;

        // Lazy load images with intersection observer
        const images = document.querySelectorAll('img[loading="lazy"]');
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                        }
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px'
            });

            images.forEach(img => imageObserver.observe(img));
        }

        // Reduce animations on slow connections
        if (isSlowConnection) {
            document.body.classList.add('reduce-animations');
            
            // Add CSS rule for reduced animations
            const style = document.createElement('style');
            style.textContent = `
                .reduce-animations * {
                    animation-duration: 0.1s !important;
                    transition-duration: 0.1s !important;
                }
            `;
            document.head.appendChild(style);
        }

        // Optimize scroll performance
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            document.body.classList.add('scrolling');
            
            scrollTimeout = setTimeout(() => {
                document.body.classList.remove('scrolling');
            }, 150);
        }, { passive: true });
    }

    // Preload critical resources
    function preloadCriticalResources() {
        const criticalImages = [
            'assets/images/logo.png',
            'assets/images/hero-construction.jpg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // Initialize everything
    function init() {
        // Preload first
        preloadCriticalResources();
        
        // DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initCookiePopup();
                initNewsletterPopup();
                initMobileOptimizations();
            });
        } else {
            initCookiePopup();
            initNewsletterPopup();
            initMobileOptimizations();
        }
    }

    init();

})();