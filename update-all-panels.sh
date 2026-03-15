#!/bin/bash

#############################################
# Update All Translam Panels Script
#############################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root (use sudo)"
    exit 1
fi

echo ""
echo "=============================================="
echo "  Updating All Translam Panels"
echo "=============================================="
echo ""

# All panel directories
declare -a PANELS=(
    "/var/www/html/translam"
    "/var/www/html/translam-portal"
    "/var/www/html/tcl-website"
    "/var/www/html/tce-website"
    "/var/www/html/translam-tiper-website"
    "/var/www/html/titm-website"
)

declare -a PANEL_NAMES=(
    "translam.com"
    "portal.translam.com"
    "tcl.translam.com"
    "tce.translam.com"
    "tiper.translam.com"
    "titm.translam.com"
)

# Update each panel
for i in "${!PANELS[@]}"; do
    dir="${PANELS[$i]}"
    name="${PANEL_NAMES[$i]}"
    
    if [ -d "$dir" ]; then
        echo ""
        log_info "Updating: $name"
        echo "----------------------------------------"
        
        cd "$dir"
        
        # Git pull
        if [ -d ".git" ]; then
            log_info "Pulling latest code..."
            git pull || log_error "Git pull failed"
        else
            log_info "Not a git repository, skipping pull"
        fi
        
        # Update frontend dependencies
        log_info "Updating frontend dependencies..."
        npm install || log_error "Frontend npm install failed"
        
        # Update backend dependencies
        if [ -d "admin-backend" ]; then
            log_info "Updating backend dependencies..."
            cd admin-backend
            npm install || log_error "Backend npm install failed"
            cd ..
        elif [ -d "backend" ]; then
            log_info "Updating backend dependencies..."
            cd backend
            npm install || log_error "Backend npm install failed"
            cd ..
        fi
        
        # Build frontend
        log_info "Building frontend..."
        cd "$dir"
        npm run build || log_error "Frontend build failed"
        
        log_success "$name updated"
    else
        log_error "Directory not found: $dir"
    fi
done

echo ""
echo "=============================================="
log_info "Restarting all PM2 processes..."
pm2 restart all
log_success "All processes restarted"

echo ""
log_info "Current PM2 status:"
pm2 list

echo ""
echo "=============================================="
log_success "All panels updated successfully!"
echo "=============================================="
