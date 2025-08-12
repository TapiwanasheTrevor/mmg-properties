# MMG Properties Platform - Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Firebase project created and configured
- [ ] Domain `mmgproperties.africa` registered and DNS configured
- [ ] Vercel account setup with deployment access
- [ ] Production environment variables configured
- [ ] SSL certificates configured (handled by Vercel)

### 2. Firebase Configuration
- [ ] Create Firebase project: `mmg-properties`
- [ ] Enable Authentication with email/password
- [ ] Enable Firestore Database
- [ ] Enable Firebase Storage
- [ ] Configure security rules (already in `firestore.rules`)
- [ ] Generate service account credentials for admin SDK

### 3. Environment Variables Setup

Copy `.env.production` to your Vercel dashboard or CI/CD system:

```bash
# Required Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Required Auth
NEXTAUTH_SECRET=generate_secure_random_string
FIREBASE_ADMIN_PRIVATE_KEY=your_admin_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email

# Optional but Recommended
SENTRY_DSN=your_sentry_dsn
GOOGLE_ANALYTICS_ID=your_ga_id
SMS_API_KEY=your_zimbabwe_sms_api_key
```

### 4. Domain Configuration

Configure DNS records for `mmgproperties.africa`:

```
A Record:     @ → 76.76.21.21
CNAME Record: www → cname.vercel-dns.com
```

## 🛠 Deployment Steps

### Method 1: Automated Deployment (Recommended)

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Deploy to preview environment
./scripts/deploy.sh preview

# Deploy to production
./scripts/deploy.sh production
```

### Method 2: Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel@latest

# Build and test locally
npm install
npm run build
npm run start

# Deploy to Vercel
vercel --prod --confirm

# Configure custom domain
vercel domains add mmgproperties.africa
```

## 🔧 Post-Deployment Configuration

### 1. Firebase Setup
```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firebase Functions (if any)
firebase deploy --only functions
```

### 2. Domain Verification
- Verify `mmgproperties.africa` resolves correctly
- Test SSL certificate installation
- Confirm WWW redirect works

### 3. Application Testing
- [ ] User registration and login flows
- [ ] Role-based access control (Owner/Tenant/Agent/Admin)
- [ ] Property creation and management
- [ ] Maintenance request system
- [ ] Real-time data synchronization
- [ ] Mobile responsiveness
- [ ] GPS tracking (mobile devices)
- [ ] Camera functionality (mobile devices)
- [ ] File upload system

## 📱 PWA Installation Testing

### Mobile Testing
1. Open `https://mmgproperties.africa` in mobile browser
2. Check for "Install App" prompt
3. Verify offline functionality
4. Test camera access permissions
5. Test GPS location permissions

### Desktop Testing
1. Open in Chrome/Edge
2. Look for install icon in address bar
3. Verify app installs as standalone application

## 🔍 Production Monitoring

### Key Metrics to Monitor
- Page load times (< 3 seconds)
- Real-time sync performance
- Authentication success rates
- API response times
- Mobile camera/GPS functionality
- Error rates and crash reports

### Monitoring Tools Setup
1. **Vercel Analytics**: Enabled automatically
2. **Sentry**: Configure `SENTRY_DSN` for error tracking
3. **Google Analytics**: Configure `GOOGLE_ANALYTICS_ID`
4. **Firebase Analytics**: Included with Firebase config

## 🚨 Troubleshooting

### Common Issues

**1. Firebase Connection Errors**
```bash
# Verify environment variables
echo $NEXT_PUBLIC_FIREBASE_API_KEY
echo $NEXT_PUBLIC_FIREBASE_PROJECT_ID
```

**2. Authentication Not Working**
- Check `NEXTAUTH_SECRET` is set
- Verify Firebase Auth is enabled
- Check domain configuration in Firebase Console

**3. Real-time Updates Not Working**
- Verify Firestore security rules are deployed
- Check user permissions in Firebase Console
- Test with browser developer tools

**4. Mobile Features Not Working**
- Verify HTTPS is enabled (required for camera/GPS)
- Check browser permissions
- Test on actual mobile devices

**5. Domain Issues**
- Verify DNS propagation (24-48 hours)
- Check Vercel domain configuration
- Ensure SSL certificate is active

## 🔐 Security Considerations

### Production Security Checklist
- [ ] Firestore security rules properly configured
- [ ] Admin routes protected with role verification
- [ ] API endpoints have proper authentication
- [ ] File upload restrictions in place
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers configured (in `vercel.json`)

### Regular Security Tasks
- Review user access permissions monthly
- Monitor authentication logs for suspicious activity
- Update Firebase security rules as features evolve
- Regular backup of Firestore data

## 🌍 Zimbabwe-Specific Features

### SMS Integration
Configure SMS gateway for Zimbabwe networks:
- Econet Zimbabwe
- NetOne
- Telecel Zimbabwe

### Phone Number Validation
Supports Zimbabwe formats:
- +263 77X XXX XXX
- +263 78X XXX XXX  
- +263 71X XXX XXX

### Currency Support
- Primary: USD (United States Dollar)
- Secondary: ZWL (Zimbabwe Dollar)
- Real-time conversion rates

### Location Services
- Harare, Bulawayo, Mutare, Gweru city support
- GPS coordinates for property locations
- Agent location tracking

## 📊 Performance Optimization

### Recommended Settings
- Enable Vercel Edge Functions
- Configure CDN caching
- Optimize images with Next.js Image component
- Use Firebase Firestore offline persistence
- Enable service worker for offline functionality

### Bundle Size Monitoring
```bash
# Analyze bundle size
npm run build
npm run analyze
```

## 📞 Support and Maintenance

### Emergency Contacts
- Vercel Support: [Vercel Support](https://vercel.com/support)
- Firebase Support: [Firebase Support](https://firebase.google.com/support)
- Domain Support: Contact your domain registrar

### Regular Maintenance Tasks
- Weekly: Monitor application performance
- Monthly: Review user feedback and analytics
- Quarterly: Security audit and dependency updates
- Annually: Domain renewal and SSL certificate check

---

## 🎉 Deployment Complete!

Your MMG Properties Platform is now live at **https://mmgproperties.africa**

### Next Steps:
1. Create admin user account
2. Add initial property data
3. Invite property owners to register
4. Configure agent accounts
5. Test all user flows

### Platform Features Summary:
- **Multi-role system**: Admin, Owner, Agent, Tenant
- **Real-time updates**: Live property and maintenance data
- **Mobile-first**: Responsive design with PWA support
- **Zimbabwe-focused**: Local phone formats, currencies, locations
- **GPS tracking**: Field agent location monitoring
- **Camera integration**: Property photos and inspections
- **Secure**: Role-based access control and Firebase security rules

**🏠 Welcome to the future of property management in Zimbabwe! 🇿🇼**