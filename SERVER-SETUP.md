# Complete Server Setup Guide for tiper.translam.com

## 🚀 Quick Start

### Step 1: Run Installation Script (Fresh Server)
```bash
# Download and run the installation script
cd /tmp
wget https://raw.githubusercontent.com/your-repo/translam-tiper-website/main/server-install.sh
chmod +x server-install.sh
sudo ./server-install.sh
```

Or if you already have the repository:
```bash
cd /var/www/html/translam-tiper-website
chmod +x server-install.sh
sudo ./server-install.sh
```

### Step 2: Secure MySQL
```bash
sudo mysql_secure_installation
```

Set root password and answer:
- Remove anonymous users? **Yes**
- Disallow root login remotely? **Yes**
- Remove test database? **Yes**
- Reload privilege tables? **Yes**

### Step 3: Clone Repository (if not already done)
```bash
cd /var/www/html
git clone https://github.com/your-repo/translam-tiper-website.git
cd translam-tiper-website
```

### Step 4: Run Deployment Script
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

You'll be prompted for:
- MySQL root password
- New database password
- SSL certificate email (optional)

---

## 📋 What Gets Installed

### server-install.sh installs:
- ✅ System updates
- ✅ Node.js 20.x LTS
- ✅ npm (Node Package Manager)
- ✅ PM2 (Process Manager)
- ✅ MySQL Server 8.0
- ✅ Nginx Web Server
- ✅ Certbot (SSL certificates)
- ✅ Essential build tools
- ✅ Firewall configuration (UFW)

### deploy.sh configures:
- ✅ MySQL database and user
- ✅ Environment files (.env)
- ✅ Frontend and backend dependencies
- ✅ Frontend production build
- ✅ Nginx reverse proxy
- ✅ PM2 processes
- ✅ SSL certificate (optional)
- ✅ File permissions
- ✅ Log rotation

---

## 🔧 Manual Installation (Alternative)

If you prefer to install step-by-step:

### 1. Update System
```bash
sudo apt-get update && sudo apt-get upgrade -y
```

### 2. Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x
```

### 3. Install PM2
```bash
sudo npm install -g pm2
pm2 -v
```

### 4. Install MySQL
```bash
sudo apt-get install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
sudo mysql_secure_installation
```

### 5. Install Nginx
```bash
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Install Certbot
```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### 7. Configure Firewall
```bash
sudo ufw enable
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## 🗄️ Database Setup

### Create Database and User
```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE translam_tiper CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'translam_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON translam_tiper.* TO 'translam_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Import Database
```bash
mysql -u root -p translam_tiper < database/translam_tiper.sql
```

---

## ⚙️ Environment Configuration

### Frontend (.env.production and .env.local)
```bash
PORT=3004
NEXT_PUBLIC_API_URL=http://127.0.0.1:4004
```

### Backend (admin-backend/.env)
```bash
DB_HOST=localhost
DB_NAME=translam_tiper
DB_USER=translam_user
DB_PASSWORD=your_secure_password
DB_PORT=3306
PORT=4004
ADMIN_CORS_ORIGINS=http://localhost:3004,http://127.0.0.1:3004,https://tiper.translam.com
JWT_SECRET=your_random_secret_key
```

Generate JWT secret:
```bash
openssl rand -base64 32
```

---

## 🌐 Nginx Configuration

Create `/etc/nginx/sites-available/tiper.translam.com`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tiper.translam.com www.tiper.translam.com;

    location / {
        proxy_pass http://127.0.0.1:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /var/www/html/translam-tiper-website/admin-backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/nginx/tiper.translam.com.access.log;
    error_log /var/log/nginx/tiper.translam.com.error.log;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/tiper.translam.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 SSL Certificate

### Install SSL with Certbot
```bash
sudo certbot --nginx -d tiper.translam.com -d www.tiper.translam.com
```

Follow prompts and select option to redirect HTTP to HTTPS.

### Auto-renewal
Certbot automatically sets up a cron job. Test it:
```bash
sudo certbot renew --dry-run
```

---

## 🚀 Application Deployment

### Install Dependencies
```bash
# Frontend
cd /var/www/html/translam-tiper-website
npm install

# Backend
cd admin-backend
npm install
```

### Build Frontend
```bash
cd /var/www/html/translam-tiper-website
npm run build
```

### Start with PM2
```bash
# Start backend
cd /var/www/html/translam-tiper-website/admin-backend
pm2 start src/server.js --name "translam-admin"

# Start frontend
cd /var/www/html/translam-tiper-website
pm2 start npm --name "translam-tiper-website-frontend" -- start

# Save configuration
pm2 save

# Setup auto-start on boot
pm2 startup systemd
```

---

## 📊 Management Commands

### PM2 Commands
```bash
# List all processes
pm2 list

# View logs
pm2 logs
pm2 logs translam-admin
pm2 logs translam-tiper-website-frontend

# Restart services
pm2 restart all
pm2 restart translam-admin
pm2 restart translam-tiper-website-frontend

# Stop services
pm2 stop all
pm2 stop translam-admin

# Delete services
pm2 delete translam-admin
pm2 delete translam-tiper-website-frontend

# Monitor resources
pm2 monit
```

### Nginx Commands
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/tiper.translam.com.access.log
sudo tail -f /var/log/nginx/tiper.translam.com.error.log
```

### MySQL Commands
```bash
# Connect to database
mysql -u translam_user -p translam_tiper

# Backup database
mysqldump -u translam_user -p translam_tiper > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u translam_user -p translam_tiper < backup_20260207.sql
```

---

## 🔍 Troubleshooting

### Check if services are running
```bash
# PM2 processes
pm2 list

# Nginx
sudo systemctl status nginx

# MySQL
sudo systemctl status mysql

# Check ports
sudo netstat -tlnp | grep -E ':(3004|4004)'
# or
sudo ss -tlnp | grep -E ':(3004|4004)'
```

### Test endpoints
```bash
# Backend health check
curl http://localhost:4004

# Frontend check
curl -I http://localhost:3004

# Domain check
curl -I http://tiper.translam.com
curl -I https://tiper.translam.com
```

### View logs
```bash
# PM2 logs
pm2 logs --lines 100

# Nginx logs
sudo tail -100 /var/log/nginx/tiper.translam.com.error.log

# System logs
sudo journalctl -u nginx -n 100
sudo journalctl -u mysql -n 100
```

### Common Issues

#### Port already in use
```bash
# Find process using port
sudo lsof -i :3004
sudo lsof -i :4004

# Kill process
sudo kill -9 <PID>
```

#### Permission denied
```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/html/translam-tiper-website

# Fix permissions
sudo find /var/www/html/translam-tiper-website -type d -exec chmod 755 {} \;
sudo find /var/www/html/translam-tiper-website -type f -exec chmod 644 {} \;
sudo chmod -R 775 /var/www/html/translam-tiper-website/admin-backend/uploads
```

#### Database connection failed
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u translam_user -p translam_tiper

# Check grants
mysql -u root -p -e "SHOW GRANTS FOR 'translam_user'@'localhost';"
```

#### CORS errors
Check `admin-backend/.env` ADMIN_CORS_ORIGINS includes your domain:
```bash
ADMIN_CORS_ORIGINS=http://localhost:3004,http://127.0.0.1:3004,https://tiper.translam.com
```

---

## 🔄 Update/Redeploy

```bash
# Pull latest code
cd /var/www/html/translam-tiper-website
git pull origin main

# Update dependencies
npm install
cd admin-backend && npm install && cd ..

# Rebuild frontend
npm run build

# Restart services
pm2 restart all

# Check status
pm2 list
pm2 logs
```

---

## 📦 Server Requirements

- **OS**: Ubuntu 20.04+ or Debian 11+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB
- **CPU**: 2 cores recommended
- **Ports**: 80, 443, 3004, 4004

---

## 🔐 Security Checklist

- [ ] UFW firewall enabled
- [ ] MySQL secured with `mysql_secure_installation`
- [ ] Strong database password set
- [ ] JWT_SECRET set to random value
- [ ] SSL certificate installed
- [ ] Nginx security headers configured
- [ ] File permissions set correctly
- [ ] Regular backups configured
- [ ] PM2 logs rotated
- [ ] SSH key authentication enabled
- [ ] Root login disabled

---

## 📞 Support

For issues or questions:
- Check logs: `pm2 logs`
- View error logs: `sudo tail -f /var/log/nginx/tiper.translam.com.error.log`
- Check service status: `pm2 list`

---

## 📝 Notes

- Frontend runs on port **3004**
- Backend runs on port **4004**
- Nginx proxies domain to these ports
- SSL terminates at Nginx
- PM2 auto-restarts on crashes
- Logs rotate automatically

---

**Last Updated**: February 7, 2026
