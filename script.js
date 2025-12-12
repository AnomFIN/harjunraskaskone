/**
 * Harjun Raskaskone Oy - Website JavaScript
 * Minimal, performance-focused vanilla JavaScript
 * No dependencies, no framework bloat
 */

// ===== Mobile Menu Toggle =====
(function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuToggle || !navLinks) return;
    
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!menuToggle.contains(event.target) && !navLinks.contains(event.target)) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
})();

// ===== Smooth Scroll Enhancement =====
// Modern browsers support smooth scroll via CSS, but this provides fallback
(function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            e.preventDefault();
            
            // Calculate offset for fixed navigation
            const navHeight = document.querySelector('.nav').offsetHeight;
            const targetPosition = targetElement.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
})();

// ===== Navigation Scroll Effect =====
(function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add shadow when scrolled
        if (currentScroll > 50) {
            nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
        } else {
            nav.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
})();

// ===== Contact Form Handling =====
(function initContactForm() {
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    
    if (!form || !formMessage) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            company: document.getElementById('company').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            message: document.getElementById('message').value.trim()
        };
        
        // Basic validation
        if (!formData.name || !formData.phone || !formData.email || !formData.message) {
            showFormMessage('Täytä kaikki pakolliset kentät.', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showFormMessage('Tarkista sähköpostiosoite.', 'error');
            return;
        }
        
        // Phone validation (Finnish format)
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        if (!phoneRegex.test(formData.phone)) {
            showFormMessage('Tarkista puhelinnumero.', 'error');
            return;
        }
        
        // TODO: Replace with actual backend integration for production
        // This currently simulates form submission for demonstration
        // In production, replace simulateFormSubmission() with actual API call
        simulateFormSubmission(formData);
    });
    
    function simulateFormSubmission(data) {
        // Disable submit button during "submission"
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Lähetetään...';
        
        // Simulate API call delay
        setTimeout(function() {
            // Log to console (in production, this would go to backend)
            console.log('Form submission:', data);
            
            // Show success message
            showFormMessage('Kiitos viestistä! Palaamme asiaan pian.', 'success');
            
            // Reset form
            form.reset();
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            // Hide message after 5 seconds
            setTimeout(function() {
                hideFormMessage();
            }, 5000);
        }, 1000);
    }
    
    function showFormMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = 'form-message ' + type;
    }
    
    function hideFormMessage() {
        formMessage.className = 'form-message';
    }
})();

// ===== Intersection Observer for Fade-in Animations =====
// Subtle micro-interactions when elements come into view
(function initScrollAnimations() {
    // Only run if browser supports IntersectionObserver
    if (!('IntersectionObserver' in window)) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate in
    const animatedElements = document.querySelectorAll('.service-card, .number-card, .why-item, .about-item');
    
    animatedElements.forEach(el => {
        // Set initial state
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        // Start observing
        observer.observe(el);
    });
})();

// ===== Active Navigation Link =====
// Highlight current section in navigation
(function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    if (!sections.length || !navLinks.length) return;
    
    window.addEventListener('scroll', function() {
        let current = '';
        const scrollPosition = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
})();

// ===== Performance: Lazy Load Images =====
// If images are added later, this provides lazy loading
(function initLazyLoad() {
    if (!('IntersectionObserver' in window)) return;
    
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;
    
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
})();

// ===== Development Logging =====
// TODO: Remove or disable these console logs in production build
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Harjun Raskaskone Oy - Website loaded successfully');
    console.log('All systems operational. No downtime culture in effect.');
}
