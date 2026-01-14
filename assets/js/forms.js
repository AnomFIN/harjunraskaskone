/* ========================================
   Rakennusliike Suvenkari v4.0 - Form Handler
   Contact form with POST/mailto fallback
   ======================================== */

(function() {
    'use strict';

    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const formStatus = document.getElementById('formStatus');
        const endpoint = form.getAttribute('data-endpoint');

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                company: formData.get('company'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                message: formData.get('message'),
                callback: formData.get('callback') === 'on',
                consent: formData.get('consent') === 'on'
            };

            // Validate required fields
            if (!data.name || !data.phone || !data.message) {
                showStatus('Täytä kaikki pakolliset kentät.', 'error');
                return;
            }

            if (!data.consent) {
                showStatus('Hyväksy yhteystietojen käyttö ennen lähettämistä.', 'error');
                return;
            }

            // Check if endpoint exists and is not empty
            if (endpoint && endpoint.trim() !== '') {
                // Try POST submission
                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });

                    if (response.ok) {
                        showStatus('Viesti lähetetty onnistuneesti! Otamme yhteyttä pian.', 'success');
                        form.reset();
                    } else {
                        throw new Error('Server returned an error');
                    }
                } catch (error) {
                    console.error('Form submission error:', error);
                    // Fallback to mailto
                    fallbackToMailto(data);
                }
            } else {
                // No endpoint, use mailto fallback
                fallbackToMailto(data);
            }
        });

        function fallbackToMailto(data) {
            // Construct mailto link
            const subject = encodeURIComponent('Yhteydenottopyyntö - Rakennusliike Suvenkari');
            let body = `Nimi: ${data.name}%0D%0A`;
            
            if (data.company) {
                body += `Yritys: ${data.company}%0D%0A`;
            }
            
            body += `Puhelin: ${data.phone}%0D%0A`;
            
            if (data.email) {
                body += `Sähköposti: ${data.email}%0D%0A`;
            }
            
            if (data.callback) {
                body += `Pyydän takaisinsoittoa: Kyllä%0D%0A`;
            }
            
            body += `%0D%0AViesti:%0D%0A${encodeURIComponent(data.message)}`;

            const mailtoLink = `mailto:info@rakennusliikesuvenkari.fi?subject=${subject}&body=${body}`;
            
            // Open mailto link
            window.location.href = mailtoLink;
            
            showStatus('Sähköpostiohjelma avataan... Jos se ei avaudu, ota yhteyttä suoraan: info@rakennusliikesuvenkari.fi', 'success');
        }

        function showStatus(message, type) {
            if (!formStatus) return;
            
            formStatus.textContent = message;
            formStatus.className = 'form-status ' + type;
            
            // Auto-hide after 5 seconds for success messages
            if (type === 'success') {
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            }
        }
    }

    // Initialize on DOM ready
    function init() {
        initContactForm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
