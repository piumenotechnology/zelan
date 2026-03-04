# Zelan Bakery & Cake - Deployment Guide

This guide covers deploying the Zelan Bakery backend API to various environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Deployment Options](#deployment-options)
   - [VPS/Dedicated Server](#vpsdedicated-server)
   - [Docker](#docker)
   - [Cloud Platforms](#cloud-platforms)
4. [Database Setup](#database-setup)
5. [Nginx Configuration](#nginx-configuration)
6. [SSL/HTTPS Setup](#sslhttps-setup)
7. [Process Management](#process-management)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup Strategy](#backup-strategy)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] Change default admin password
- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Configure proper `FRONTEND_URL` for CORS
- [ ] Set `NODE_ENV=production`
- [ ] Database credentials are secure
- [ ] File upload directory has proper permissions
- [ ] Firewall rules configured (only expose necessary ports)
- [ ] SSL certificate ready

---

## Environment Configuration

### Production Environment Variables

Create a `.env` file with production values:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=zelan_user
DB_PASSWORD=strong_password_here
DB_NAME=zelan_bakery_db

# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL (for CORS) - your actual frontend domain
FRONTEND_URL=https://zelanbakery.com

# Upload Configuration
MAX_FILE_SIZE=10485760

# JWT Configuration - CHANGE THIS!
JWT_SECRET=your-very-long-and-secure-random-string-at-least-32-chars
JWT_EXPIRES_IN=7d
```

### Generate Secure JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

---

## Deployment Options

### VPS/Dedicated Server

#### Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ LTS
- MySQL 8.0+
- Nginx (reverse proxy)
- PM2 (process manager)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2
```

#### Step 2: Create Application User

```bash
# Create user for the application
sudo adduser --system --group --home /var/www/zelan zelan

# Create application directory
sudo mkdir -p /var/www/zelan/backend
sudo chown -R zelan:zelan /var/www/zelan
```

#### Step 3: Deploy Application

```bash
# Switch to app directory
cd /var/www/zelan/backend

# Clone or copy your application files
# Option 1: Git clone
sudo -u zelan git clone <repository-url> .

# Option 2: SCP from local
scp -r ./backend/* user@server:/var/www/zelan/backend/

# Install dependencies
sudo -u zelan npm install --production

# Create uploads directory
sudo -u zelan mkdir -p uploads/images uploads/voice

# Set permissions
sudo chmod 755 uploads
sudo chmod 755 uploads/images
sudo chmod 755 uploads/voice
```

#### Step 4: Configure Environment

```bash
# Create production .env
sudo -u zelan nano /var/www/zelan/backend/.env
# Add your production environment variables
```

#### Step 5: Start with PM2

```bash
# Start application
cd /var/www/zelan/backend
sudo -u zelan pm2 start server.js --name "zelan-api"

# Save PM2 process list
sudo -u zelan pm2 save

# Setup PM2 to start on boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u zelan --hp /var/www/zelan
```

---

### Docker

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/images uploads/voice

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=3306
      - DB_USER=zelan_user
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=zelan_bakery_db
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=zelan_bakery_db
      - MYSQL_USER=zelan_user
      - MYSQL_PASSWORD=${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped

volumes:
  mysql_data:
```

#### Deploy with Docker

```bash
# Create .env file for Docker
cat > .env << EOF
DB_PASSWORD=your_secure_password
MYSQL_ROOT_PASSWORD=your_root_password
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://zelanbakery.com
EOF

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

---

### Cloud Platforms

#### Railway

1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

#### Render

1. Create new Web Service
2. Connect repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

#### DigitalOcean App Platform

1. Create new App
2. Select repository
3. Configure environment variables
4. Deploy

---

## Database Setup

### Create Production Database

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE zelan_bakery_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'zelan_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON zelan_bakery_db.* TO 'zelan_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Import Schema

```bash
mysql -u zelan_user -p zelan_bakery_db < database/schema.sql
```

### Secure MySQL

```bash
# Edit MySQL configuration
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Ensure these settings:
bind-address = 127.0.0.1
# Remove skip-networking if present
```

---

## Nginx Configuration

### Create Site Configuration

```bash
sudo nano /etc/nginx/sites-available/zelan-api
```

```nginx
server {
    listen 80;
    server_name api.zelanbakery.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.zelanbakery.com;

    # SSL Configuration (update paths after certbot)
    ssl_certificate /etc/letsencrypt/live/api.zelanbakery.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.zelanbakery.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/zelan-api.access.log;
    error_log /var/log/nginx/zelan-api.error.log;

    # File upload size
    client_max_body_size 15M;

    # Serve uploaded files directly
    location /uploads/ {
        alias /var/www/zelan/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }
}
```

### Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/zelan-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.zelanbakery.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## Process Management

### PM2 Commands

```bash
# Start application
pm2 start server.js --name "zelan-api"

# View status
pm2 status

# View logs
pm2 logs zelan-api

# Restart
pm2 restart zelan-api

# Stop
pm2 stop zelan-api

# Monitor
pm2 monit

# Reload with zero downtime
pm2 reload zelan-api
```

### PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'zelan-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/zelan-error.log',
    out_file: '/var/log/pm2/zelan-out.log',
    merge_logs: true,
    max_memory_restart: '500M'
  }]
};
```

Start with ecosystem:
```bash
pm2 start ecosystem.config.js --env production
```

---

## Monitoring & Logging

### Application Logs

```bash
# PM2 logs
pm2 logs zelan-api --lines 100

# Nginx logs
tail -f /var/log/nginx/zelan-api.access.log
tail -f /var/log/nginx/zelan-api.error.log
```

### Health Check Monitoring

Add to crontab for basic monitoring:

```bash
crontab -e

# Add health check every 5 minutes
*/5 * * * * curl -sf http://localhost:3000/health > /dev/null || pm2 restart zelan-api
```

### Setup Log Rotation

```bash
sudo nano /etc/logrotate.d/zelan-api
```

```
/var/log/pm2/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

---

## Backup Strategy

### Database Backup Script

Create `/var/www/zelan/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/www/zelan/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="zelan_bakery_db"
DB_USER="zelan_user"
DB_PASS="your_password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /var/www/zelan/backend uploads/

# Delete backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /var/www/zelan/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /var/www/zelan/backup.sh >> /var/log/zelan-backup.log 2>&1
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```bash
# Check MySQL is running
sudo systemctl status mysql

# Check connection
mysql -u zelan_user -p -h localhost zelan_bakery_db

# Check .env file
cat /var/www/zelan/backend/.env | grep DB_
```

#### 2. File Upload Errors

```bash
# Check directory permissions
ls -la /var/www/zelan/backend/uploads/

# Fix permissions
sudo chown -R zelan:zelan /var/www/zelan/backend/uploads/
sudo chmod 755 /var/www/zelan/backend/uploads/
```

#### 3. 502 Bad Gateway

```bash
# Check if Node.js is running
pm2 status

# Check Node.js logs
pm2 logs zelan-api --lines 50

# Check Nginx error log
tail -f /var/log/nginx/zelan-api.error.log
```

#### 4. High Memory Usage

```bash
# Check PM2 memory
pm2 monit

# Restart to free memory
pm2 restart zelan-api

# Configure memory limit in ecosystem.config.js
max_memory_restart: '500M'
```

### Useful Commands

```bash
# Check disk space
df -h

# Check memory
free -m

# Check processes
htop

# Check port usage
sudo netstat -tlnp | grep 3000

# Test API locally
curl http://localhost:3000/health
```

---

## Security Best Practices

1. **Firewall Configuration**
   ```bash
   sudo ufw allow 22/tcp   # SSH
   sudo ufw allow 80/tcp   # HTTP
   sudo ufw allow 443/tcp  # HTTPS
   sudo ufw enable
   ```

2. **Keep Software Updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   npm audit fix
   ```

3. **Secure SSH**
   - Disable password authentication
   - Use SSH keys only
   - Change default SSH port (optional)

4. **Regular Backups**
   - Automated daily backups
   - Test restore process periodically

5. **Monitor Logs**
   - Check for suspicious activity
   - Set up alerts for errors
