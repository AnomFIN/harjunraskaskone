# Overmind Tools Suite

Internal tools dashboard for Harjun Raskaskone Oy.

## 🛠️ Tools Included

### 1. URL Shortener
- Create short links with 4-character codes
- Optional custom codes
- Preview pages before redirect
- SQLite storage with collision handling

### 2. File Upload
- Single file upload with drag & drop
- Progress tracking
- Max file size: 100MB
- Secure file serving

### 3. JugiAI Chat
- AI assistant powered by OpenAI GPT-4
- Business & operations guidance
- Tool usage help
- Persists last 20 messages in browser

## 🔒 Security Features

- Admin password authentication
- IP allowlist (configurable)
- Rate limiting on API endpoints
- Request logging
- Dangerous URL blocking (shortener)
- Safe file type filtering (upload)

## 📦 Installation

### Quick Install (Linux)

```bash
cd Overmind
chmod +x install.sh
./install.sh
```

This will:
1. Install Node.js dependencies
2. Set up environment variables
3. Initialize databases
4. Build the frontend

### Manual Installation

#### 1. Install Server Dependencies

```bash
cd Overmind/server
npm install
```

#### 2. Install Web Dependencies

```bash
cd Overmind/web
npm install
```

#### 3. Configure Environment

```bash
cd Overmind/server
cp .env.example .env
nano .env  # Edit with your settings
```

Required environment variables:
- `ADMIN_PASSWORD` - Password for tool access
- `OPENAI_API_KEY` - For JugiAI chat
- `SITE_URL` - Your production domain

#### 4. Build Frontend

```bash
cd Overmind/web
npm run build
```

## 🚀 Running

### Development Mode

Start server and frontend separately:

```bash
# Terminal 1 - Backend
cd Overmind/server
npm run dev

# Terminal 2 - Frontend  
cd Overmind/web
npm run dev
```

Access at: http://localhost:5173

### Production Mode

Build frontend and run server:

```bash
# Build frontend
cd Overmind/web
npm run build

# Start server (serves built frontend)
cd Overmind/server
npm start
```

Access at: http://localhost:3000

## 🔑 Authentication

The suite uses simple password + IP allowlist authentication.

**Set password in `.env`:**
```
ADMIN_PASSWORD=your-secure-password
```

**Configure IP allowlist (optional):**
```
ALLOWED_IPS=127.0.0.1,192.168.1.100
```

Leave `ALLOWED_IPS` empty to disable IP filtering.

## 📊 Database

URL shortener uses SQLite database stored at:
```
Overmind/server/data/shortener.db
```

Backup this file to preserve your short links.

## 📝 Logs

Request logs are stored at:
```
Overmind/server/logs/requests.log
```

## 🔗 API Endpoints

### URL Shortener
- `POST /api/shorten` - Create short link
- `GET /api/shorten/links` - List all links
- `DELETE /api/shorten/:code` - Delete link
- `GET /s/:code` - Preview page (no auth)
- `GET /api/resolve/:code` - Get target URL (admin)

### File Upload
- `POST /api/upload` - Upload file
- `GET /api/upload/files` - List files
- `DELETE /api/upload/:filename` - Delete file
- `GET /files/:filename` - Download file

### AI Chat
- `POST /api/chat` - Send message
- `GET /api/chat/status` - Check availability

All `/api/*` endpoints require authentication.

## 🛡️ Security Notes

### This tool suite is for internal use only

- Set a strong `ADMIN_PASSWORD`
- Use IP allowlist if possible
- Keep `OPENAI_API_KEY` secret
- Monitor request logs regularly
- Block dangerous file types (already implemented)
- Review uploaded files periodically

### URL Shortener Safety

The shortener blocks:
- Localhost/internal IPs
- IPv6 localhost
- `file://`, `javascript:`, `data:` schemes

Preview pages prevent silent redirects.

### File Upload Safety

The upload handler blocks:
- Executable files (.exe, .sh, .bat, etc.)
- Files over 100MB

## 🔧 Configuration

### Changing Port

Edit `.env`:
```
PORT=8080
```

### Changing Site URL

Edit `.env`:
```
SITE_URL=https://tools.harjunraskaskone.fi
```

### Adjusting Rate Limits

Edit `.env`:
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🐛 Troubleshooting

### "Authentication failed"
- Check `ADMIN_PASSWORD` is set correctly
- Verify IP is in `ALLOWED_IPS` (if configured)
- Clear browser localStorage and re-enter password

### "AI chat not available"
- Set `OPENAI_API_KEY` in `.env`
- Verify API key is valid
- Check OpenAI account has credits

### Database errors
- Ensure `data/` directory exists
- Check file permissions
- Delete `shortener.db` to reset (loses data)

### Upload fails
- Check `uploads/` directory exists
- Verify file size < 100MB
- Check file type is allowed

## 📚 Stack

**Backend:**
- Node.js + Express
- better-sqlite3
- OpenAI SDK
- Multer (file uploads)
- Helmet (security)

**Frontend:**
- Vanilla JavaScript (ES modules)
- Vite (dev server & build)
- Custom CSS (no frameworks)

## 📄 License

Private - Harjun Raskaskone Oy internal use only.

## 📞 Support

For issues or questions, contact Harjun Raskaskone Oy IT team.
