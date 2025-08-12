# MMG Properties Platform - Test Credentials & Data

## 🔐 Test User Accounts

### Administrator Account
- **Email:** `admin@mmgproperties.africa`
- **Password:** `Admin@MMG2024!`
- **Role:** System Administrator
- **Access:** Full platform access, user management, system settings

### Property Owner Account
- **Email:** `owner@example.com`
- **Password:** `Owner@123456`
- **Role:** Property Owner
- **Name:** John Mutasa
- **Access:** Property management, financials, tenant management, analytics

### Field Agent Account
- **Email:** `agent@mmgproperties.africa`
- **Password:** `Agent@123456`
- **Role:** Field Agent
- **Name:** Sarah Moyo
- **Access:** Property inspections, maintenance tasks, GPS tracking

### Tenant Account
- **Email:** `tenant@example.com`
- **Password:** `Tenant@123456`
- **Role:** Tenant
- **Name:** David Sibanda
- **Access:** Maintenance requests, lease documents, payment history

## 🏠 Test Properties

### Property 1: Borrowdale Brook Estate
- **Type:** Residential House
- **Location:** Borrowdale, Harare
- **Status:** Occupied
- **Rent:** $1,500/month
- **Features:** 4 bed, 3 bath, pool, garden

### Property 2: Avondale Apartment
- **Type:** Apartment
- **Location:** Avondale, Harare
- **Status:** Available
- **Rent:** $600/month
- **Features:** 2 bed, 1 bath, parking, backup power

### Property 3: Hillside Office Park
- **Type:** Commercial
- **Location:** Hillside, Bulawayo
- **Status:** Occupied
- **Rent:** $2,000/month
- **Features:** 500sqm office space, parking

## 🛠 Test Maintenance Requests

1. **High Priority:** Leaking kitchen tap (Property 1)
2. **Medium Priority:** Bedroom light repair (Property 1)
3. **Completed:** Window cleaning (Property 2)

## 📊 Test Data Summary

- **Properties:** 3 (2 occupied, 1 available)
- **Users:** 4 (1 admin, 1 owner, 1 agent, 1 tenant)
- **Maintenance Requests:** 3 (1 pending, 1 in progress, 1 completed)
- **Active Leases:** 2
- **Payment Records:** 2 (1 completed, 1 pending)
- **Inspection Reports:** 1

## 🚀 Running the Seed Script

### Setup Test Data

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env.local
# Add your Firebase configuration
```

3. **Run seed script:**
```bash
# Using npm
npm run seed

# Or directly with ts-node
npx ts-node scripts/seed-data.ts

# Or with Node.js
node -r ts-node/register scripts/seed-data.ts
```

4. **Verify seeding:**
- Login with admin credentials
- Check Firebase Console for created data
- Test each user role

## 🧪 Testing Scenarios

### Owner Testing Flow
1. Login as owner@example.com
2. View property dashboard
3. Check rental income
4. Review maintenance requests
5. View tenant information

### Tenant Testing Flow
1. Login as tenant@example.com
2. Submit maintenance request
3. Upload photos
4. View lease documents
5. Check payment history

### Agent Testing Flow
1. Login as agent@mmgproperties.africa
2. Enable GPS tracking
3. View assigned properties
4. Conduct property inspection
5. Take and upload photos
6. Submit inspection report

### Admin Testing Flow
1. Login as admin@mmgproperties.africa
2. View system dashboard
3. Manage users
4. Check system health
5. Review audit logs

## 📱 Mobile Testing

### GPS Features (Agent Account)
1. Login on mobile device
2. Allow location permissions
3. Navigate to property
4. Check-in at property location
5. Complete inspection

### Camera Features
1. Open maintenance request form
2. Click "Add Photos"
3. Allow camera permissions
4. Take property photos
5. Submit with request

## 🔄 Resetting Test Data

To reset and re-seed the database:

```bash
# Clear Firestore data (Firebase Console or CLI)
firebase firestore:delete --all-collections

# Re-run seed script
npm run seed
```

## ⚠️ Important Notes

1. **Development Only:** These credentials are for testing only
2. **Change in Production:** Never use these credentials in production
3. **Firebase Emulator:** Use Firebase emulator for local development
4. **Rate Limits:** Be aware of Firebase free tier limits

## 🆘 Troubleshooting

### Cannot Login
- Verify Firebase Auth is enabled
- Check .env configuration
- Ensure seed script ran successfully

### No Data Showing
- Check Firestore security rules
- Verify user roles are set correctly
- Check browser console for errors

### GPS Not Working
- Ensure HTTPS is enabled
- Check browser location permissions
- Test on actual mobile device

### Camera Not Working
- HTTPS required for camera access
- Check browser permissions
- Test on mobile device

---

**Note:** After seeding, you can immediately start testing all platform features with realistic data!