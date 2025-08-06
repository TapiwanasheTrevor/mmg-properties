# Database Seeding Guide

This guide explains how to populate your MMG Platform database with comprehensive test data for development and testing.

## Overview

The seeding system creates realistic test data including:

- **Users**: Admin, Owners, Agents, and Tenants with complete profiles
- **Properties**: 3 properties with realistic addresses and details  
- **Units**: 52 total units with varying types and statuses
- **Leases**: Active leases with proper tenant assignments
- **Maintenance**: 25+ maintenance requests with different statuses
- **Transactions**: 6 months of payment history and security deposits
- **Notifications**: User-specific notifications across all roles
- **Inspections**: Property inspection records

## Prerequisites

Before seeding your database:

1. **Firebase Setup**: Ensure Firebase is properly configured with your project credentials
2. **Environment**: Seeding only works in development mode (`NODE_ENV !== 'production'`)
3. **Permissions**: Firebase Authentication and Firestore must be enabled
4. **Dependencies**: All required packages must be installed

## Seeding Methods

### Method 1: Command Line (Recommended)

The fastest way to seed your database:

```bash
# Install dependencies if needed
npm install

# Run the seeding script
npm run seed

# Or get help
npm run seed:help
```

**Advantages:**
- Fastest execution
- Detailed progress logging
- Complete error reporting
- Automatic credential display

### Method 2: Admin Dashboard (Web Interface)

For a visual seeding experience:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in as an admin user (if you have one)

3. Navigate to: `http://localhost:3000/admin/seed`

4. Click "Seed Database" and monitor progress

**Advantages:**
- Visual progress indicator
- Browser-based interface
- Real-time status updates
- Built-in credential display

### Method 3: Manual Import (Advanced)

For custom seeding scenarios:

```typescript
import { seedAllData } from '@/lib/seeds/index';
import { seedAdvancedData } from '@/lib/seeds/advanced';

const customSeed = async () => {
  const basicData = await seedAllData();
  const advancedData = await seedAdvancedData(
    basicData.userIds,
    basicData.properties, 
    basicData.units
  );
};
```

## Test User Credentials

After seeding, you can log in with these accounts:

### Admin Access
- **Email**: `admin@mmg.com`
- **Password**: `password123`
- **Role**: Full system access

### Property Owners
- **Email**: `john.owner@mmg.com` | **Password**: `password123`
- **Email**: `sarah.owner@mmg.com` | **Password**: `password123`
- **Role**: Property management, financial reports

### Property Agents  
- **Email**: `mike.agent@mmg.com` | **Password**: `password123`
- **Email**: `emma.agent@mmg.com` | **Password**: `password123`
- **Role**: Property operations, tenant management

### Tenants
- **Email**: `alex.tenant@mmg.com` | **Password**: `password123`
- **Email**: `lisa.tenant@mmg.com` | **Password**: `password123`  
- **Email**: `david.tenant@mmg.com` | **Password**: `password123`
- **Email**: `maria.tenant@mmg.com` | **Password**: `password123`
- **Role**: Lease information, maintenance requests

## Generated Data Details

### Properties Created

1. **Sunset Apartments** (Los Angeles, CA)
   - 24 units (studios, 1BR, 2BR)
   - Owner: John Smith
   - Agent: Mike Wilson
   - Monthly Income: $48,000

2. **Downtown Lofts** (San Francisco, CA)
   - 12 luxury loft units (2BR, 3BR)
   - Owner: Sarah Johnson  
   - Agent: Emma Davis
   - Monthly Income: $36,000

3. **Garden View Condos** (San Diego, CA)
   - 16 condo units (1BR, 2BR)
   - Owner: John Smith
   - Agent: Mike Wilson
   - Monthly Income: $28,800

### Maintenance Requests

- **25+ requests** across all properties
- **Categories**: Plumbing, Electrical, HVAC, Appliances, Structural, Other
- **Priorities**: Low, Medium, High, Emergency
- **Statuses**: Submitted, Assigned, In Progress, Completed
- **Realistic descriptions** and cost estimates

### Financial Data

- **6 months** of rent payment history
- **Security deposits** for all active leases
- **Payment methods**: Online, Check, Transfer
- **Various statuses**: Completed, Pending, Late payments (10% rate)
- **Realistic payment dates** and references

### Notifications

- **User-specific notifications** for all roles
- **Types**: Maintenance, Payment, Lease, System, General
- **Priorities**: Low, Medium, High, Urgent
- **Read/unread status** (60% read rate)
- **Action links** where applicable

## Data Relationships

The seeding system creates proper relationships:

- **Tenants → Units**: Active leases with current assignments
- **Units → Properties**: Proper property associations  
- **Maintenance → Users**: Requests linked to tenants, agents, owners
- **Transactions → Leases**: Payments tied to specific lease agreements
- **Notifications → Users**: Role-appropriate notifications

## Customization

### Adding Custom Users

Edit `lib/seeds/index.ts` to add more users:

```typescript
const customUser = await createUserWithProfile(
  'custom.user@mmg.com',
  'password123',
  'Custom User',
  'tenant',
  { phone: '+1-555-0999' }
);
```

### Custom Properties

Add properties in `seedProperties()` function:

```typescript
{
  name: 'My Custom Property',
  address: { /* address details */ },
  type: 'residential',
  ownerId: userIds.owner1,
  agentId: userIds.agent1,
  // ... other properties
}
```

### Custom Data Amounts

Modify loops in seeding functions:

```typescript
// Change from 25 to your desired number
for (let i = 0; i < 25; i++) {
  // maintenance request creation
}
```

## Troubleshooting

### Common Issues

1. **"Firebase is not properly configured"**
   ```bash
   # Check your .env.local file
   cp .env.local.example .env.local
   # Add your Firebase credentials
   ```

2. **"Cannot run seeding in production"**
   ```bash
   # Ensure NODE_ENV is not set to production
   echo $NODE_ENV
   ```

3. **"Permission denied" errors**
   - Check Firebase security rules
   - Ensure Authentication is enabled
   - Verify Firestore permissions

4. **"Module not found" errors**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

### Performance Optimization

For large datasets:

1. **Increase batch size** (Firebase allows 500 operations per batch)
2. **Use parallel processing** for independent operations
3. **Implement progress tracking** for long-running seeds
4. **Add error recovery** for network interruptions

### Security Considerations

- **Never run in production**: Built-in environment checks prevent this
- **Test credentials**: Change default passwords in production
- **Data cleanup**: Clear test data before production deployment
- **API limits**: Be aware of Firebase quota limits during seeding

## Integration Testing

After seeding, verify functionality:

1. **Login flows**: Test all user roles and permissions
2. **Dashboard views**: Verify role-specific content
3. **Data relationships**: Check property-tenant-lease connections  
4. **Search/filtering**: Test data queries and filters
5. **CRUD operations**: Create, update, delete test records

## Data Cleanup

To reset your database:

1. **Firebase Console**: Delete collections manually
2. **Custom script**: Create a cleanup function
3. **Emulators**: Reset emulator data
4. **Fresh seed**: Run seeding again for clean data

## Contributing

When adding new seeding features:

1. **Follow patterns**: Use existing seeding structure
2. **Add type safety**: Include proper TypeScript types  
3. **Error handling**: Implement comprehensive error catching
4. **Documentation**: Update this guide with new features
5. **Testing**: Verify seeds work in different environments

---

**Need Help?** Check the Firebase Console logs and browser console for detailed error messages during seeding operations.