/**
 * Harjun Raskaskone Oy - Corporate Website JavaScript
 * Handles form validation, smooth scrolling, and subtle interactions
 */

(function() {
    'use strict';

    // =========================================================================
    // Smooth Scroll Navigation
    // =========================================================================
    
    /**
     * Handle smooth scrolling for navigation links
     */
    function initSmoothScroll() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip if it's just "#"
                if (href === '#') {
                    e.preventDefault();
                    return;
                }
                
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Calculate offset for fixed navigation
                    const navHeight = document.querySelector('.nav').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // =========================================================================
    // Navigation Scroll Effect
    // =========================================================================
    
    /**
     * Add shadow to navigation on scroll
     */
    function initNavScrollEffect() {
        const nav = document.querySelector('.nav');
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add shadow when scrolled
            if (scrollTop > 50) {
                nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            } else {
                nav.style.boxShadow = 'none';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    // =========================================================================
    // Contact Form Validation & Handling
    // =========================================================================
    
    /**
     * Validate contact form and handle submission
     */
    function initContactForm() {
        const form = document.getElementById('contact-form');
        const formMessage = document.getElementById('form-message');
        
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const company = document.getElementById('company').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Validate fields
            if (!validateForm(name, company, phone, message)) {
                showFormMessage('Täytä kaikki pakolliset kentät oikein.', 'error');
                return;
            }
            
            // In production, this would send data to a backend
            // For now, we'll show a success message
            handleFormSubmission(name, company, phone, message);
        });
    }
    
    /**
     * Validate form fields
     */
    function validateForm(name, company, phone, message) {
        // Basic validation
        if (name.length < 2) return false;
        if (company.length < 2) return false;
        if (phone.length < 7) return false;
        if (message.length < 10) return false;
        
        // Phone validation (Finnish format)
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        if (!phoneRegex.test(phone)) return false;
        
        return true;
    }
    
    /**
     * Handle form submission
     * In production, this would send data to a backend API
     */
    function handleFormSubmission(name, company, phone, message) {
        const form = document.getElementById('contact-form');
        const formMessage = document.getElementById('form-message');
        
        // Simulate API call delay
        setTimeout(() => {
            // In production: send to backend
            // For now: show success and log to console
            console.log('Form submission:', { name, company, phone, message });
            
            // Show success message
            showFormMessage('Kiitos yhteydenotosta! Otamme sinuun yhteyttä pian.', 'success');
            
            // Clear form
            form.reset();
            
            // Hide message after 5 seconds
            setTimeout(() => {
                hideFormMessage();
            }, 5000);
        }, 500);
    }
    
    /**
     * Show form message
     */
    function showFormMessage(text, type) {
        const formMessage = document.getElementById('form-message');
        formMessage.textContent = text;
        formMessage.className = 'form__message ' + type;
        formMessage.style.display = 'block';
    }
    
    /**
     * Hide form message
     */
    function hideFormMessage() {
        const formMessage = document.getElementById('form-message');
        formMessage.style.display = 'none';
    }

    // =========================================================================
    // Real-time Form Field Validation
    // =========================================================================
    
    /**
     * Add real-time validation feedback to form fields
     */
    function initFieldValidation() {
        const nameField = document.getElementById('name');
        const companyField = document.getElementById('company');
        const phoneField = document.getElementById('phone');
        const messageField = document.getElementById('message');
        
        if (!nameField) return;
        
        // Name validation
        nameField.addEventListener('blur', function() {
            validateField(this, this.value.trim().length >= 2);
        });
        
        // Company validation
        companyField.addEventListener('blur', function() {
            validateField(this, this.value.trim().length >= 2);
        });
        
        // Phone validation
        phoneField.addEventListener('blur', function() {
            const phoneRegex = /^[\d\s\+\-\(\)]+$/;
            const isValid = this.value.trim().length >= 7 && phoneRegex.test(this.value);
            validateField(this, isValid);
        });
        
        // Message validation
        messageField.addEventListener('blur', function() {
            validateField(this, this.value.trim().length >= 10);
        });
    }
    
    /**
     * Add or remove validation styling to a field
     */
    function validateField(field, isValid) {
        if (field.value.trim() === '') {
            // Don't show error if field is empty on blur
            field.style.borderColor = '';
            return;
        }
        
        if (isValid) {
            field.style.borderColor = 'rgba(34, 197, 94, 0.5)';
        } else {
            field.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        }
    }

    // =========================================================================
    // Scroll Reveal Animation
    // =========================================================================
    
    /**
     * Add subtle reveal animation for sections as they enter viewport
     */
    function initScrollReveal() {
        const sections = document.querySelectorAll('section');
        
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        sections.forEach(section => {
            // Initial state
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            observer.observe(section);
        });
    }

    // =========================================================================
    // Initialize Everything
    // =========================================================================
    
    /**
     * Initialize all functionality when DOM is ready
     */
    function init() {
        initSmoothScroll();
        initNavScrollEffect();
        initContactForm();
        initFieldValidation();
        initScrollReveal();
        
        // Log initialization (remove in production)
        console.log('Harjun Raskaskone website initialized');
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
