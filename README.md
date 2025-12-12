# Harjun Raskaskone Oy - Website v1.1

Professional corporate website for Harjun Raskaskone Oy, a Finnish heavy vehicle maintenance and repair company.

## 🎯 Overview

This is a single-page website built with a light, premium industrial theme designed to build trust with financiers, enterprise customers, and partners. The site is production-ready and optimized for performance, accessibility, and conversion.

## ✨ Features

### Design
- **Light Premium Theme**: Off-white background with steel-blue and graphite accents
- **Subtle Visual Effects**: CSS-only gradient mesh, soft glow on interactive elements
- **Responsive Design**: Mobile-first approach, fully responsive from 320px to 2560px+
- **Typography**: Inter font family with large, well-spaced text for readability

### Content Sections
1. **Hero** - Main value proposition with trust indicators and proof card
2. **About** - Company background and values
3. **Operating Model** - Three-pillar approach (uptime, process, partnership)
4. **Industries** - Target customer sectors
5. **Services** - Four service categories with featured contracts option
6. **Process** - Four-step service workflow timeline
7. **Key Numbers** - Financial and operational metrics
8. **Trust Proof** - Compliance, company details, and financier perspective
9. **FAQ + SLA** - Interactive accordion with service level agreement
10. **Contact** - Contact form with multiple submission options

### Interactive Features
- Sticky header with scroll shadow
- Active navigation section highlighting (IntersectionObserver)
- FAQ accordion
- Smooth anchor scrolling (respects `prefers-reduced-motion`)
- Mobile menu toggle
- Floating "back to top" button
- Contact form with POST/mailto fallback

### Technical
- **Pure HTML/CSS/JS** - No frameworks or build tools required
- **Semantic HTML5** - Proper structure and accessibility
- **Modular Architecture** - Separated CSS and JS files
- **SEO Ready** - JSON-LD schema, meta tags, semantic structure
- **Performance Optimized** - Minimal dependencies, efficient code
- **Security Audited** - CodeQL scanned, no vulnerabilities

## 📁 Project Structure

```
harjunraskaskone/
├── index.html              # Main HTML file
├── assets/
│   ├── css/
│   │   ├── styles.css      # Base styles and layout
│   │   └── components.css  # Component styles (buttons, cards, etc.)
│   └── js/
│       ├── main.js         # Core functionality
│       ├── observer.js     # Navigation active state
│       └── forms.js        # Contact form handling
├── .gitignore
└── README.md
```

## 🚀 Deployment

### Simple Deployment (Static Hosting)

The website is static and can be deployed to any web hosting service:

1. **Upload files** to your web server
2. **Update phone numbers** in `index.html`:
   - Search for `+358XXXXXXXXX` and replace with actual phone number
   - Update in 3 locations: Hero CTAs, Contact details, and JSON-LD schema
3. **Update email** if different from `info@harjunraskaskone.fi`
4. **Test the site** in multiple browsers and devices

### Recommended Hosting Platforms
- **GitHub Pages** - Free, automatic HTTPS
- **Netlify** - Free tier, automatic deployments
- **Vercel** - Free tier, excellent performance
- **Traditional hosting** - Any shared hosting with HTML support

### Optional: Form Backend

By default, the contact form uses `mailto:` fallback. To use a backend API:

1. Add `data-endpoint="https://your-api.com/contact"` to the form element
2. Ensure your endpoint accepts POST requests with JSON:
   ```json
   {
     "name": "string",
     "company": "string",
     "phone": "string",
     "email": "string",
     "message": "string",
     "callback": boolean,
     "consent": boolean
   }
   ```

## 🛠 Development

### Local Testing

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx serve

# Then open http://localhost:8000
```

### Browser Support
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Accessibility
- Semantic HTML structure
- ARIA attributes where needed
- Keyboard navigation support
- Screen reader compatible
- Reduced motion support

## 📝 Customization

### Colors
Edit CSS variables in `assets/css/styles.css`:
```css
:root {
    --color-accent-primary: #3b5998;  /* Main brand color */
    --color-accent-secondary: #5a7bb5; /* Secondary accent */
    /* ... other variables */
}
```

### Content
All content is in `index.html`. Sections are clearly marked with comments.

### Fonts
Currently using Google Fonts (Inter). To use custom fonts:
1. Remove Google Fonts link from `<head>`
2. Add font files to `assets/fonts/`
3. Update `@font-face` in CSS

## 📊 Performance

Expected Lighthouse scores:
- **Performance**: 90+
- **Accessibility**: 90+
- **Best Practices**: 90+
- **SEO**: 90+

## 🔒 Security

- No external dependencies (except Google Fonts CDN)
- Input validation on contact form
- Safe handling of user data
- No eval() or innerHTML misuse
- CodeQL scanned: 0 vulnerabilities

## 📞 Support

For issues or questions about this website:
- Company: Harjun Raskaskone Oy
- Y-tunnus: 2578643-3
- Email: info@harjunraskaskone.fi

## 📄 License

Copyright © 2025 Harjun Raskaskone Oy. All rights reserved.
