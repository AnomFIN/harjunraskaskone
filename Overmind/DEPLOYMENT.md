# Overmind Tools Suite - Deployment Guide

## Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Node.js 18+ installed
- Domain name (optional, but recommended)
- SSL certificate (recommended for production)

## Quick Deployment (VPS/Linux Server)

### 1. Clone Repository

```bash
git clone https://github.com/AnomFIN/harjunraskaskone.git
cd harjunraskaskone/Overmind
```

### 2. Run Installer

```bash
chmod +x install.sh
./install.sh
```

### 3. Configure Environment

Edit `server/.env`:

```bash
nano server/.env
```

Set these required variables:

```bash
# Required
ADMIN_PASSWORD=your-very-strong-password-here

# Recommended
OPENAI_API_KEY=sk-...your-key-here
SITE_URL=https://tools.yourcompany.com

# Optional
ALLOWED_IPS=127.0.0.1,your.office.ip
PORT=3000
```

### 4. Start Server

**Option A: Direct (for testing)**
```bash
cd server
npm start
```

**Option B: With PM2 (recommended for production)**
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
cd server
pm2 start server.js --name overmind

# Save PM2 config
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

Server will run on `http://localhost:3000`

### 5. Set Up Reverse Proxy (Nginx)

Create Nginx config:

```bash
sudo nano /etc/nginx/sites-available/overmind
```

Add:

```nginx
server {
    listen 80;
    server_name tools.yourcompany.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/overmind /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Set Up SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tools.yourcompany.com
```

## Firewall Configuration

Allow only necessary ports:

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

**Do NOT** open port 3000 directly - access through Nginx only.

## Directory Structure on Server

```
/var/www/harjunraskaskone/Overmind/
├── server/
│   ├── data/           # SQLite databases (backup regularly!)
│   ├── uploads/        # Uploaded files
│   ├── logs/           # Request logs
│   └── .env            # Configuration (keep secure!)
└── web/
    └── dist/           # Built frontend
```

## Backup Strategy

### Database Backup

Create backup script:

```bash
#!/bin/bash
# backup-overmind.sh

BACKUP_DIR="/var/backups/overmind"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/harjunraskaskone/Overmind/server/data/shortener.db \
   $BACKUP_DIR/shortener_$DATE.db

# Backup uploads (optional)
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz \
   /var/www/harjunraskaskone/Overmind/server/uploads/

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

Schedule with cron:

```bash
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-overmind.sh
```

## Monitoring

### Check Server Status

```bash
# With PM2
pm2 status
pm2 logs overmind

# View request logs
tail -f server/logs/requests.log
```

### Monitor Resources

```bash
# CPU and memory
htop

# Disk space
df -h

# Database size
du -h server/data/shortener.db
```

## Updates

### Update Code

```bash
cd /var/www/harjunraskaskone
git pull origin main

# Reinstall dependencies if needed
cd Overmind/server
npm install

# Rebuild frontend
cd ../web
npm run build

# Restart server
pm2 restart overmind
```

## Troubleshooting

### Server won't start

Check logs:
```bash
pm2 logs overmind --lines 100
```

Common issues:
- Port 3000 already in use: change `PORT` in `.env`
- Database locked: check file permissions
- Missing dependencies: run `npm install` again

### Can't authenticate

1. Verify `ADMIN_PASSWORD` is set in `.env`
2. Clear browser localStorage
3. Check server logs for authentication attempts

### File uploads fail

1. Check `uploads/` directory permissions: `chmod 755 uploads/`
2. Verify disk space: `df -h`
3. Check file size limit (default 100MB)

### AI chat not working

1. Verify `OPENAI_API_KEY` is set correctly
2. Check OpenAI API status
3. Ensure account has credits

## Security Checklist

- [ ] Strong `ADMIN_PASSWORD` set (20+ characters)
- [ ] `ALLOWED_IPS` configured (if possible)
- [ ] SSL certificate installed
- [ ] Firewall enabled (ufw)
- [ ] Port 3000 NOT publicly accessible
- [ ] Regular backups scheduled
- [ ] Logs monitored regularly
- [ ] Server and packages up to date
- [ ] `.env` file permissions: `chmod 600 .env`

## Performance Tuning

### For high traffic:

1. Increase rate limits in `.env`:
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500
```

2. Enable Nginx caching for static files
3. Consider Redis for session storage (future enhancement)

## Maintenance

### Regular tasks:

- **Daily**: Check logs for errors
- **Weekly**: Review uploaded files, delete if needed
- **Monthly**: Update dependencies: `npm update`
- **Quarterly**: Review and clean database

## Support

For issues or questions:
1. Check logs: `pm2 logs overmind`
2. Review [README.md](README.md)
3. Contact IT team

---

**Remember**: This is an internal tool. Keep authentication credentials secure and monitor access logs regularly.
