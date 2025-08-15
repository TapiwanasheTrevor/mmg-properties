#!/usr/bin/env tsx

/**
 * Fix User Permissions Script
 * 
 * This script updates existing users in the database to ensure
 * they have proper permissions based on their roles.
 */

import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../lib/types';

// Test credentials
const TEST_ADMIN = {
  email: 'admin@mmgproperties.africa',
  password: 'Admin@MMG2024!'
};

// Get default permissions based on role
const getDefaultPermissions = (role: UserRole): string[] => {
  switch (role) {
    case 'admin':
      return [
        'users:read', 'users:write', 'users:delete',
        'properties:read', 'properties:write', 'properties:delete',
        'leases:read', 'leases:write', 'leases:delete',
        'maintenance:read', 'maintenance:write', 'maintenance:delete',
        'payments:read', 'payments:write', 'payments:delete',
        'reports:read', 'reports:write',
        'settings:read', 'settings:write'
      ];
    case 'owner':
      return [
        'properties:read', 'properties:write',
        'leases:read', 'leases:write',
        'maintenance:read', 'maintenance:write',
        'payments:read',
        'reports:read'
      ];
    case 'agent':
      return [
        'properties:read',
        'leases:read', 'leases:write',
        'maintenance:read', 'maintenance:write',
        'payments:read'
      ];
    case 'tenant':
      return [
        'properties:read',
        'leases:read',
        'maintenance:read', 'maintenance:write',
        'payments:read'
      ];
    default:
      return [];
  }
};

async function fixUserPermissions() {
  try {
    console.log('🔧 Fixing User Permissions');
    console.log('=========================\n');

    // Authenticate as admin
    console.log('🔐 Authenticating as admin...');
    await signInWithEmailAndPassword(auth, TEST_ADMIN.email, TEST_ADMIN.password);
    console.log('✅ Authentication successful\n');

    // Get all users
    console.log('👥 Fetching all users...');
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    console.log(`📋 Found ${usersSnapshot.size} users\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      console.log(`👤 Processing user: ${userData.profile?.email || userData.email || userId}`);
      
      // Check if user has permissions field
      if (!userData.permissions || !Array.isArray(userData.permissions)) {
        console.log(`   ⚠️  Missing or invalid permissions field`);
        
        // Get user role
        const userRole = userData.role as UserRole;
        if (!userRole) {
          console.log(`   ❌ No role found, skipping`);
          skippedCount++;
          continue;
        }

        // Get default permissions for role
        const defaultPermissions = getDefaultPermissions(userRole);
        
        // Update user with permissions
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
          permissions: defaultPermissions
        });
        
        console.log(`   ✅ Updated permissions for ${userRole} (${defaultPermissions.length} permissions)`);
        updatedCount++;
      } else {
        console.log(`   ✅ Permissions already set (${userData.permissions.length} permissions)`);
        skippedCount++;
      }
    }

    console.log('\n📊 Summary');
    console.log('==========');
    console.log(`✅ Updated: ${updatedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users`);
    console.log(`📋 Total: ${usersSnapshot.size} users`);

    if (updatedCount > 0) {
      console.log('\n🎉 User permissions have been fixed!');
      console.log('🔄 Please refresh your browser to see the changes.');
    } else {
      console.log('\n✅ All users already have proper permissions set.');
    }

  } catch (error: any) {
    console.error('❌ Error fixing user permissions:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixUserPermissions().then(() => {
  console.log('\n✅ Process completed');
  process.exit(0);
}).catch(console.error);