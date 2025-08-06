#!/usr/bin/env tsx
// Database seeding script for MMG Platform
// Run with: npm run seed or tsx scripts/seed.ts

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { seedAllData } from '../lib/seeds/index';
import { seedAdvancedData } from '../lib/seeds/advanced';

const main = async () => {
  try {
    console.log('🚀 MMG Platform Database Seeding');
    console.log('================================\n');
    
    // Debug environment variables
    console.log('🔍 Environment Variables Check:');
    console.log('API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing');
    console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
    console.log('AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log();

    // Check if we're in development
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Cannot run seeding in production environment!');
      process.exit(1);
    }

    // Seed basic data
    const basicData = await seedAllData();
    
    // Seed advanced data
    const advancedData = await seedAdvancedData(
      basicData.userIds,
      basicData.properties,
      basicData.units
    );

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📋 Test User Credentials:');
    console.log('========================');
    console.log('👑 Admin:');
    console.log('   Email: admin@mmg.com');
    console.log('   Password: password123');
    console.log('');
    console.log('🏢 Property Owners:');
    console.log('   Email: john.owner@mmg.com | Password: password123');
    console.log('   Email: sarah.owner@mmg.com | Password: password123');
    console.log('');
    console.log('🎯 Agents:');
    console.log('   Email: mike.agent@mmg.com | Password: password123');
    console.log('   Email: emma.agent@mmg.com | Password: password123');
    console.log('');
    console.log('🏠 Tenants:');
    console.log('   Email: alex.tenant@mmg.com | Password: password123');
    console.log('   Email: lisa.tenant@mmg.com | Password: password123');
    console.log('   Email: david.tenant@mmg.com | Password: password123');
    console.log('   Email: maria.tenant@mmg.com | Password: password123');
    console.log('');
    console.log('🌐 Platform URL: http://localhost:3000');
    console.log('');
    console.log('💡 Tips:');
    console.log('- Each role has different dashboard views and permissions');
    console.log('- Try logging in with different users to see role-based features');
    console.log('- Data includes realistic relationships between users and properties');
    console.log('- Maintenance requests and transactions have various statuses');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('MMG Platform Database Seeding Script');
  console.log('');
  console.log('Usage: npm run seed [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h    Show this help message');
  console.log('');
  console.log('This script will create test data including:');
  console.log('- Users (Admin, Owners, Agents, Tenants)');
  console.log('- Properties and Units');
  console.log('- Leases and Maintenance Requests');
  console.log('- Transactions and Notifications');
  console.log('- Inspections and Reports');
  console.log('');
  console.log('⚠️  This script requires Firebase to be properly configured');
  console.log('⚠️  Only runs in development environment');
  process.exit(0);
}

// Run the seeding
main();