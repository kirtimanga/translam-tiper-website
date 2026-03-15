#!/bin/bash

#############################################
# Application Deployment Script
# For: tiper.translam.com
#############################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration Variables
APP_DIR="/var/www/html/translam-tiper-website"
DOMAIN="tiper.translam.com"
FRONTEND_PORT=3004
BACKEND_PORT=4004

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root (use sudo)"
    exit 1
fi

log_info "Starting deployment for tiper.translam.com..."

#############################################
# 1. Database Configuration
#############################################
log_info "Configuring MySQL Database..."
read -p "Enter MySQL root password: " -s MYSQL_ROOT_PASSWORD
echo ""
read -p "Enter new database password for 'translam_tiper': " -s DB_PASSWORD
echo ""

# Create database and user
mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS translam_tiper CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'translam_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON translam_tiper.* TO 'translam_user'@'localhost';
FLUSH PRIVILEGES;
EOF
log_success "Database configured"

# Import database if SQL file exists
if [ -f "$APP_DIR/database/translam_tiper.sql" ]; then
    log_info "Importing database..."
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" translam_tiper < "$APP_DIR/database/translam_tiper.sql"
    log_success "Database imported"
else
    log_warning "Database SQL file not found, skipping import"
fi

#############################################
# 2. Create Environment Files
#############################################
log_info "Creating environment configuration files..."

# Frontend .env.production
cat > "$APP_DIR/.env.production" <<EOF
PORT=$FRONTEND_PORT
NEXT_PUBLIC_API_URL=http://127.0.0.1:$BACKEND_PORT
EOF
log_success "Created .env.production"

# Frontend .env.local
cat > "$APP_DIR/.env.local" <<EOF
PORT=$FRONTEND_PORT
NEXT_PUBLIC_API_URL=http://127.0.0.1:$BACKEND_PORT
EOF
log_success "Created .env.local"

# Backend .env
cat > "$APP_DIR/admin-backend/.env" <<EOF
DB_HOST=localhost
DB_NAME=translam_tiper
DB_USER=translam_user
DB_PASSWORD=$DB_PASSWORD
DB_PORT=3306
PORT=$BACKEND_PORT
ADMIN_CORS_ORIGINS=http://localhost:$FRONTEND_PORT,http://127.0.0.1:$FRONTEND_PORT,https://$DOMAIN
JWT_SECRET=$(openssl rand -base64 32)
EOF
log_success "Created admin-backend/.env"

#############################################
# 3. Install Dependencies
#############################################
log_info "Installing frontend dependencies..."
cd "$APP_DIR"
npm install --production
log_success "Frontend dependencies installed"

log_info "Installing backend dependencies..."
cd "$APP_DIR/admin-backend"
npm install --production
log_success "Backend dependencies installed"

#############################################
# 4. Build Frontend
#############################################
log_info "Building frontend application..."
cd "$APP_DIR"
npm run build
log_success "Frontend built successfully"

#############################################
# 5. Setup Nginx Configuration
#############################################
log_info "Configuring Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN <<'NGINXCONF'
server {
    listen 80;
    listen [::]:80;
    server_name tiper.translam.com www.tiper.translam.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend proxy
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:4004;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Serve uploaded files
    location /uploads/ {
        alias /var/www/html/translam-tiper-website/admin-backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Log files
    access_log /var/log/nginx/tiper.translam.com.access.log;
    error_log /var/log/nginx/tiper.translam.com.error.log;
}
NGINXCONF

# Enable site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN

# Test and reload nginx
nginx -t
systemctl reload nginx
log_success "Nginx configured and reloaded"

#############################################
# 6. Set File Permissions
#############################################
log_info "Setting file permissions..."
chown -R www-data:www-data "$APP_DIR"
find "$APP_DIR" -type d -exec chmod 755 {} \;
find "$APP_DIR" -type f -exec chmod 644 {} \;
chmod -R 775 "$APP_DIR/admin-backend/uploads"
mkdir -p "$APP_DIR/admin-backend/uploads"
chown -R www-data:www-data "$APP_DIR/admin-backend/uploads"
log_success "Permissions set"

#############################################
# 7. Setup PM2
#############################################
log_info "Configuring PM2 processes..."

# Stop existing processes if any
pm2 delete translam-admin 2>/dev/null || true
pm2 delete translam-tiper-website-frontend 2>/dev/null || true

# Start backend
cd "$APP_DIR/admin-backend"
pm2 start src/server.js --name "translam-admin" --update-env
log_success "Backend started on port $BACKEND_PORT"

# Start frontend
cd "$APP_DIR"
pm2 start npm --name "translam-tiper-website-frontend" -- start --update-env
log_success "Frontend started on port $FRONTEND_PORT"

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup systemd -u root --hp /root
log_success "PM2 configured"

#############################################
# 8. Install SSL Certificate
#############################################
log_info "Setting up SSL certificate..."
read -p "Do you want to install SSL certificate now? (y/n): " install_ssl
if [ "$install_ssl" = "y" ] || [ "$install_ssl" = "Y" ]; then
    read -p "Enter email for SSL certificate: " ssl_email
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m "$ssl_email" --redirect
    log_success "SSL certificate installed"
else
    log_warning "SSL installation skipped. Run manually: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

#############################################
# 9. Setup Logrotate
#############################################
log_info "Setting up log rotation..."
cat > /etc/logrotate.d/translam-tiper <<EOF
/var/log/nginx/tiper.translam.com.*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1
    endscript
}
EOF
log_success "Log rotation configured"

#############################################
# SUMMARY
#############################################
echo ""
echo "=============================================="
log_success "Deployment Complete!"
echo "=============================================="
echo ""
log_info "Application URLs:"
echo "  - Website: http://$DOMAIN (or https:// if SSL installed)"
echo "  - Admin Login: http://$DOMAIN/admin/login"
echo "  - API Endpoint: http://$DOMAIN/api/"
echo ""
log_info "Direct Access (for testing):"
echo "  - Frontend: http://localhost:$FRONTEND_PORT"
echo "  - Backend: http://localhost:$BACKEND_PORT"
echo ""
log_info "Service Management:"
echo "  - View processes: pm2 list"
echo "  - View logs: pm2 logs"
echo "  - Restart all: pm2 restart all"
echo "  - Stop all: pm2 stop all"
echo ""
log_info "Database Info:"
echo "  - Database: translam_tiper"
echo "  - User: translam_user"
echo "  - Host: localhost"
echo ""
log_success "Your application is now live!"
echo "=============================================="
