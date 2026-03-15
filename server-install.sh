#!/bin/bash

#############################################
# Complete Server Installation Script
# For: tiper.translam.com
# Ubuntu/Debian based systems
#############################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

log_info "Starting server installation for tiper.translam.com..."

#############################################
# 1. System Update
#############################################
log_info "Updating system packages..."
apt-get update -y
apt-get upgrade -y
log_success "System updated successfully"

#############################################
# 2. Install Essential Tools
#############################################
log_info "Installing essential tools..."
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    unzip \
    vim \
    htop \
    ufw
log_success "Essential tools installed"

#############################################
# 3. Install Node.js 20.x (LTS)
#############################################
log_info "Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    log_success "Node.js $(node -v) installed"
else
    log_warning "Node.js already installed: $(node -v)"
fi

# Verify npm
if ! command -v npm &> /dev/null; then
    log_error "npm not found after Node.js installation"
    exit 1
fi
log_info "npm version: $(npm -v)"

#############################################
# 4. Install PM2 Process Manager
#############################################
log_info "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    log_success "PM2 installed: $(pm2 -v)"
else
    log_warning "PM2 already installed: $(pm2 -v)"
    npm update -g pm2
fi

#############################################
# 5. Install MySQL Server
#############################################
log_info "Installing MySQL Server..."
if ! command -v mysql &> /dev/null; then
    apt-get install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
    log_success "MySQL installed and started"
    log_warning "Please run 'mysql_secure_installation' after this script"
else
    log_warning "MySQL already installed"
fi

#############################################
# 6. Install Nginx
#############################################
log_info "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    log_success "Nginx installed and started"
else
    log_warning "Nginx already installed"
fi

#############################################
# 7. Install Certbot (for SSL)
#############################################
log_info "Installing Certbot for SSL certificates..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
    log_success "Certbot installed"
else
    log_warning "Certbot already installed"
fi

#############################################
# 8. Configure Firewall (UFW)
#############################################
log_info "Configuring firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3004/tcp comment 'Frontend Dev Port'
ufw allow 4004/tcp comment 'Backend Dev Port'
log_success "Firewall configured"

#############################################
# 9. Create Application Directory Structure
#############################################
log_info "Setting up directory structure..."
mkdir -p /var/www/html
chown -R $SUDO_USER:$SUDO_USER /var/www/html
log_success "Directory structure created"

#############################################
# 10. Install Additional Node.js Build Tools
#############################################
log_info "Installing Node.js build tools..."
apt-get install -y gcc g++ make
log_success "Build tools installed"

#############################################
# 11. Configure System Limits for Node.js
#############################################
log_info "Configuring system limits..."
cat >> /etc/security/limits.conf << EOF
# Increased limits for Node.js applications
* soft nofile 65535
* hard nofile 65535
* soft nproc 65535
* hard nproc 65535
EOF
log_success "System limits configured"

#############################################
# 12. Install MySQL Client Libraries
#############################################
log_info "Installing MySQL development libraries..."
apt-get install -y libmysqlclient-dev
log_success "MySQL client libraries installed"

#############################################
# SUMMARY
#############################################
echo ""
echo "=============================================="
log_success "Server Installation Complete!"
echo "=============================================="
echo ""
log_info "Installed Software Versions:"
echo "  - Node.js: $(node -v)"
echo "  - npm: $(npm -v)"
echo "  - PM2: $(pm2 -v)"
echo "  - Nginx: $(nginx -v 2>&1 | grep -oP '(?<=nginx/)[0-9.]+')"
echo "  - MySQL: $(mysql --version | grep -oP '(?<=Distrib )[0-9.]+')"
echo ""
log_info "Services Status:"
systemctl is-active --quiet mysql && echo "  - MySQL: Running" || echo "  - MySQL: Stopped"
systemctl is-active --quiet nginx && echo "  - Nginx: Running" || echo "  - Nginx: Stopped"
echo ""
log_warning "Next Steps:"
echo "  1. Run: mysql_secure_installation"
echo "  2. Create MySQL database and user"
echo "  3. Clone your application repository"
echo "  4. Run the deployment script"
echo ""
log_info "MySQL Root Password Setup:"
echo "  sudo mysql"
echo "  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';"
echo "  FLUSH PRIVILEGES;"
echo "  EXIT;"
echo ""
log_success "Installation script completed successfully!"
echo "=============================================="
