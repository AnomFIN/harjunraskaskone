# Harjun Raskaskone Oy

This repository contains two parts:

1. **Main Website** - Corporate website (static HTML/CSS/JS)
2. **Overmind Suite** - Internal tools dashboard (Node.js + Express)

---

## Part 1: Main Website

Corporate website for Harjun Raskaskone Oy, a Finnish heavy vehicle maintenance and repair company based in Helsinki.

### About the Website

This is a production-ready, single-page corporate website built with:
- **Static HTML** for fast loading and reliability
- **Modern CSS** with CSS variables for maintainable styling
- **Vanilla JavaScript** for minimal, performance-focused interactivity
- **No frameworks or dependencies** - just clean, efficient code

### Design Principles

- **Dark Industrial Premium**: Deep black background (#0a0a0a) with amber accent colors (#f59e0b) for a modern, high-end industrial aesthetic
- **Theme Toggle**: Built-in dark/light mode switch with localStorage persistence
- **Visual Service Cards**: Image-based card layout for services section inspired by premium industrial design
- **Performance First**: Fast load times, minimal file sizes
- **Fully Responsive**: Desktop-first approach with mobile optimization (4-column grid on desktop, responsive down to 1-column on mobile)
- **Accessibility**: Semantic HTML, keyboard navigation support, and respects prefers-reduced-motion
- **Smooth Animations**: Subtle micro-interactions and scroll-triggered animations for enhanced UX

### Site Structure

The single-page website includes these sections:

1. **Hero** - Main headline, CTA, and trust bar
2. **About** - Company introduction and key facts
3. **Operating Model** - How we work
4. **Industries** - Target customer segments
5. **Services** - Four core service offerings
6. **Process Timeline** - 4-step service process
7. **Key Numbers** - Financial metrics for trust building
8. **Trust Proof** - Compliance and company facts
9. **FAQ** - Common questions with SLA promise
10. **Contact** - Company information and contact form

### Running the Main Website

Simply open `index.html` in a web browser. No build process or server required.

For local development with live reload:
```bash
# Using Python (built-in)
python3 -m http.server 8000

# Using Node.js (if installed)
npx serve
```

Then visit `http://localhost:8000`

---

## Part 2: Overmind Tools Suite

Internal tools dashboard for Harjun Raskaskone Oy operations.

### Tools Included

1. **URL Shortener** - Create short links with custom codes
2. **File Upload** - Single file upload with drag & drop
3. **JugiAI Chat** - AI assistant for business & tools help

### Security Features

- Admin password authentication
- IP allowlist (configurable)
- Rate limiting
- Request logging
- Dangerous URL blocking
- Safe file type filtering

### Quick Start

```bash
cd Overmind
chmod +x install.sh
./install.sh
```

Then:
1. Edit `Overmind/server/.env` with your configuration
2. Set `ADMIN_PASSWORD` and `OPENAI_API_KEY`
3. Run `cd Overmind/server && npm start`

**See [Overmind/README.md](Overmind/README.md) for full documentation.**

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Company Information

**Harjun Raskaskone Oy**
- Y-tunnus: 2578643-3
- Location: Helsinki, Finland
- Founded: 2019
- Specialization: Heavy vehicle maintenance and repair

## License

© 2024 Harjun Raskaskone Oy. All rights reserved.
