#!/bin/bash

# MMG Properties Platform Deployment Script
# This script handles production deployment to Vercel with mmgproperties.africa

set -e  # Exit on any error

echo "🚀 MMG Properties Platform Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}📋 Checking dependencies...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
        npm install -g vercel@latest
    fi
    
    echo -e "${GREEN}✅ All dependencies are installed${NC}"
}

# Environment setup
setup_environment() {
    echo -e "${BLUE}🔧 Setting up environment...${NC}"
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        echo -e "${YELLOW}⚠️  .env.production not found. Creating template...${NC}"
        cp .env.production.example .env.production 2>/dev/null || true
        echo -e "${RED}❌ Please configure .env.production with your Firebase credentials${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Environment configuration ready${NC}"
}

# Run tests and linting
run_tests() {
    echo -e "${BLUE}🧪 Running tests and linting...${NC}"
    
    # Install dependencies
    npm install
    
    # Run type checking
    if npm run type-check; then
        echo -e "${GREEN}✅ Type checking passed${NC}"
    else
        echo -e "${RED}❌ Type checking failed${NC}"
        exit 1
    fi
    
    # Run linting
    if npm run lint; then
        echo -e "${GREEN}✅ Linting passed${NC}"
    else
        echo -e "${RED}❌ Linting failed${NC}"
        exit 1
    fi
    
    # Build the application
    if npm run build; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
}

# Firebase setup check
check_firebase() {
    echo -e "${BLUE}🔥 Checking Firebase configuration...${NC}"
    
    # Check if firebase.json exists
    if [ ! -f "firebase.json" ]; then
        echo -e "${RED}❌ firebase.json not found${NC}"
        exit 1
    fi
    
    # Check if Firestore rules exist
    if [ ! -f "firestore.rules" ]; then
        echo -e "${RED}❌ firestore.rules not found${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Firebase configuration ready${NC}"
}

# Deploy to Vercel
deploy_to_vercel() {
    echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
    
    # Check deployment mode
    if [ "$1" == "preview" ]; then
        echo -e "${YELLOW}📋 Deploying to preview environment${NC}"
        vercel --confirm
    else
        echo -e "${YELLOW}📋 Deploying to production (mmgproperties.africa)${NC}"
        vercel --prod --confirm
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Deployment successful!${NC}"
        echo -e "${GREEN}🌐 Site: https://mmgproperties.africa${NC}"
    else
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    fi
}

# Domain configuration
configure_domain() {
    echo -e "${BLUE}🌐 Configuring domain...${NC}"
    
    echo "Setting up mmgproperties.africa domain..."
    echo "Please ensure the following DNS records are configured:"
    echo ""
    echo "A Record:     @ → 76.76.21.21"
    echo "CNAME Record: www → cname.vercel-dns.com"
    echo ""
    echo "After DNS propagation, run:"
    echo "vercel domains add mmgproperties.africa"
    echo ""
}

# Post-deployment tasks
post_deployment() {
    echo -e "${BLUE}📝 Post-deployment tasks...${NC}"
    
    echo "1. Verify Firebase Security Rules are deployed"
    echo "2. Test user authentication flows"
    echo "3. Verify real-time data synchronization"
    echo "4. Test mobile responsiveness"
    echo "5. Check GPS tracking (for agents)"
    echo "6. Test camera functionality"
    echo "7. Verify SMS notifications (if configured)"
    echo "8. Check payment gateway integration (if configured)"
    echo ""
    echo -e "${GREEN}✅ Deployment checklist ready${NC}"
}

# Main deployment function
main() {
    echo "Starting deployment process..."
    echo ""
    
    # Check for deployment type
    DEPLOY_TYPE=${1:-production}
    
    check_dependencies
    setup_environment
    check_firebase
    run_tests
    deploy_to_vercel $DEPLOY_TYPE
    
    if [ "$DEPLOY_TYPE" == "production" ]; then
        configure_domain
    fi
    
    post_deployment
    
    echo ""
    echo -e "${GREEN}🎉 MMG Properties Platform deployment complete!${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Configure Firebase project settings"
    echo "2. Set up environment variables in Vercel dashboard"
    echo "3. Configure domain DNS settings"
    echo "4. Test all functionality"
    echo ""
    echo "Support: https://github.com/mmg-properties/platform/issues"
}

# Help function
show_help() {
    echo "MMG Properties Platform Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [preview|production]"
    echo ""
    echo "Arguments:"
    echo "  preview     Deploy to preview environment"
    echo "  production  Deploy to production (default)"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh preview     # Deploy to preview"
    echo "  ./deploy.sh production  # Deploy to production"
    echo "  ./deploy.sh             # Deploy to production (default)"
}

# Check for help flag
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    show_help
    exit 0
fi

# Run main function
main $1