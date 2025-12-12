# Changelog

All notable changes to the Overmind Tools Suite will be documented in this file.

## [1.0.0] - 2024-12-12

### Added - Initial Release

#### Tool 1: URL Shortener
- Create short links with auto-generated 4-character codes
- Custom code support (alphanumeric, 4 chars)
- SQLite database storage
- Collision handling with automatic retry (up to 10 attempts)
- Preview pages before redirect (security feature)
- Click counter for analytics
- List all created links
- Delete links
- Dangerous URL blocking:
  - Localhost and 127.0.0.1
  - Private IP ranges (10.x, 172.16-31.x, 192.168.x)
  - IPv6 localhost (::1)
  - file://, javascript:, data: protocols

#### Tool 2: File Upload
- Single file upload with drag & drop
- File picker fallback
- Progress bar with percentage
- Maximum file size: 100MB
- Secure file serving (authenticated)
- File type filtering (blocks executables)
- List uploaded files with metadata
- Delete files
- Unique filename generation with timestamp + hash

#### Tool 3: JugiAI Chat
- AI assistant powered by OpenAI GPT-4
- Business and operations guidance
- Overmind tools help
- Persistent message history (last 20 messages in localStorage)
- Typing indicator
- Timestamp display
- Custom system prompt for HRK context

#### Security Features
- Admin password authentication (configurable)
- IP allowlist support (optional)
- Rate limiting: 100 requests per 15 minutes per IP
- Request logging with timestamps and IP addresses
- Helmet security headers with CSP
- CORS protection
- Input validation on all endpoints
- File type filtering for uploads
- URL validation for shortener

#### Infrastructure
- Node.js + Express backend
- Vanilla JavaScript frontend (no frameworks)
- Vite for development and build
- SQLite for data storage
- Modern Clipboard API for copy functionality
- Responsive design for mobile/desktop

#### Documentation
- Comprehensive README.md
- Deployment guide (DEPLOYMENT.md)
- Environment configuration example (.env.example)
- Installation script (install.sh)
- Code comments throughout

#### Testing
- URL shortener collision handling tests (100 links)
- Custom code validation tests
- URL safety validation tests
- CRUD operations tests
- Click counter tests

### Security

#### Addressed in Initial Release
- Content Security Policy configured appropriately
- Rate limiting on all API endpoints
- Authentication required for all tools
- Dangerous URL patterns blocked
- Executable files blocked from upload
- Request logging for audit trail

#### Known Acceptable Risks
- CSP allows `unsafe-inline` for scripts/styles (required for Vite)
- Static file serving not rate-limited (intentional for SPA)
- Preview pages use inline styles (acceptable for internal tool)

### Performance
- Minimal dependencies
- Static frontend served by Express
- SQLite for fast local storage
- Efficient collision handling
- Lazy loading of components

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Modern mobile browsers

---

## Future Enhancements (Planned)

### Version 1.1
- [ ] Bulk file upload
- [ ] File sharing with expiration
- [ ] QR code generation for short links
- [ ] Link analytics dashboard
- [ ] Export links to CSV

### Version 1.2
- [ ] Team member management
- [ ] Role-based access control
- [ ] Activity audit log UI
- [ ] Email notifications
- [ ] Webhook support

### Version 2.0
- [ ] Multi-file upload
- [ ] Image optimization
- [ ] Video transcoding
- [ ] Document preview
- [ ] Search across all tools

---

## Migration Notes

### From Nothing to 1.0.0
This is the initial release. Follow installation instructions in README.md.

---

## Contributors

- Development: GitHub Copilot
- Specification: Harjun Raskaskone Oy

## License

© 2024 Harjun Raskaskone Oy. Internal use only.
