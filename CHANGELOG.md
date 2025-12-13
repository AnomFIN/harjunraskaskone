# Changelog - Harjun Raskaskone Website

## [4.0.0] - 2024-12-12

### 🎨 Major Visual Redesign - Apple/Tesla-grade
Complete rebuild of the website with a premium industrial finance aesthetic.

### Added
- **Design System**
  - New `tokens.css` with comprehensive design tokens
  - Light industrial finance color palette (#fafbfc background, #2563eb accent)
  - Typography scale from xs (12px) to 7xl (72px)
  - Spacing system (0 to 40)
  - Shadow & glow effect definitions
  - Gradient & mesh backgrounds

- **CSS Architecture**
  - New `base.css` for reset, typography, and layout foundations
  - Updated `components.css` with bento grids and premium cards
  - Backdrop-filter blur on header
  - Gradient dividers (replacing plain lines)
  - Subtle noise texture overlay
  - Light beam/vignette effects

- **Components**
  - Bento grid system (2, 3, 4 column layouts)
  - Premium card components with micro-interactions
  - Enhanced buttons with gradient backgrounds
  - Timeline stepper component
  - Industry chips
  - Improved FAQ accordion
  - Enhanced contact form styling

- **Visual Effects**
  - Gradient mesh backgrounds
  - Hover glow effects on cards and buttons
  - Card lift animations
  - Smooth micro-interactions
  - Refined shadow system

### Changed
- **Typography**
  - Increased H1 from 48px to 60px on desktop (42px mobile)
  - Tighter letter-spacing for headings
  - Improved line-height for readability
  - Premium Inter font stack

- **Layout**
  - Enhanced hero section with left/right composition
  - Improved responsive breakpoints
  - Better mobile navigation
  - Refined spacing throughout

- **Colors**
  - Shifted from dark theme to light industrial finance
  - Updated accent color from #3b5998 to #2563eb
  - Refined text colors for better readability
  - Added steel color palette

### Technical
- Updated JavaScript version headers to v4.0
- Maintained strict mode in all JS files
- Improved accessibility (ARIA, focus states, reduced motion)
- Enhanced mobile responsiveness
- Optimized for performance (static files only)

### Quality Assurance
- ✅ Code review passed (0 comments)
- ✅ Security scan passed (CodeQL - 0 alerts)
- ✅ HTML structure validated
- ✅ CSS syntax validated
- ✅ JavaScript strict mode verified
- ✅ All sections and features verified

### Performance
- No external dependencies except Google Fonts
- Static HTML + CSS + vanilla JS
- Target: Lighthouse Performance 90+
- Target: Lighthouse Accessibility 90+
- No build step required

---

## [1.1.0] - 2024 (Previous Version)
- Initial professional website
- Dark theme with light accents
- Basic components and sections
- Mobile responsive

---

**Migration Notes**: The old `styles.css` is kept for reference but is no longer used. The new CSS architecture uses three files: `tokens.css`, `base.css`, and `components.css`.

**Breaking Changes**: None for end users. The website maintains all existing content and functionality while enhancing the visual presentation.
