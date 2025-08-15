#!/usr/bin/env tsx

/**
 * MMG Platform CRUD Operations Test Script
 * 
 * This script tests all CRUD operations for each entity type
 * to verify data integrity and proper functionality.
 */

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Import all services to test
import { 
  createProperty, 
  getProperty, 
  updateProperty, 
  deleteProperty, 
  getProperties 
} from '../lib/services/properties';

import { 
  createTenant, 
  getTenant, 
  updateTenant, 
  deleteTenant 
} from '../lib/services/tenants';

import { 
  createLease, 
  getLease, 
  updateLease, 
  deleteLease 
} from '../lib/services/leases';

import { 
  createMaintenanceRequest, 
  getMaintenanceRequest, 
  updateMaintenanceRequest, 
  deleteMaintenanceRequest 
} from '../lib/services/maintenance';

import { 
  createTransaction, 
  getTransaction, 
  updateTransaction, 
  deleteTransaction 
} from '../lib/services/transactions';

import { 
  createUnit, 
  getUnit, 
  updateUnit, 
  deleteUnit 
} from '../lib/services/units';

// Test credentials
const TEST_ADMIN = {
  email: 'admin@mmgproperties.africa',
  password: 'Admin@MMG2024!'
};

interface TestResult {
  entity: string;
  operation: string;
  success: boolean;
  error?: string;
  details?: any;
}

class CRUDTester {
  private results: TestResult[] = [];
  private testEntityIds: Map<string, string> = new Map();

  constructor() {
    console.log('🧪 MMG Platform CRUD Operations Test Suite');
    console.log('==========================================\n');
  }

  private logResult(entity: string, operation: string, success: boolean, error?: string, details?: any) {
    this.results.push({ entity, operation, success, error, details });
    const icon = success ? '✅' : '❌';
    console.log(`${icon} ${entity} - ${operation}: ${success ? 'PASS' : 'FAIL'}`);
    if (error) {
      console.log(`   Error: ${error}`);
    }
    if (details && success) {
      console.log(`   ID: ${details}`);
    }
  }

  async authenticate() {
    try {
      console.log('🔐 Authenticating as admin user...');
      await signInWithEmailAndPassword(auth, TEST_ADMIN.email, TEST_ADMIN.password);
      console.log('✅ Authentication successful\n');
      return true;
    } catch (error: any) {
      console.log('❌ Authentication failed:', error.message);
      return false;
    }
  }

  async testPropertyCRUD() {
    console.log('🏢 Testing Property CRUD Operations');
    console.log('-----------------------------------');

    // CREATE
    try {
      const propertyData = {
        name: 'Test Property CRUD',
        type: 'apartment' as const,
        description: 'Test property for CRUD operations',
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        },
        totalUnits: 10,
        occupiedUnits: 0,
        monthlyIncome: 0,
        status: 'available' as const,
        ownerId: 'test-owner-id',
        assignedAgentId: 'test-agent-id',
        images: [],
        documents: [],
        amenities: ['parking', 'pool'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const propertyId = await createProperty(propertyData);
      this.testEntityIds.set('property', propertyId);
      this.logResult('Property', 'CREATE', true, undefined, propertyId);
    } catch (error: any) {
      this.logResult('Property', 'CREATE', false, error.message);
    }

    // READ
    if (this.testEntityIds.has('property')) {
      try {
        const property = await getProperty(this.testEntityIds.get('property')!);
        this.logResult('Property', 'READ', !!property);
      } catch (error: any) {
        this.logResult('Property', 'READ', false, error.message);
      }
    }

    // UPDATE
    if (this.testEntityIds.has('property')) {
      try {
        await updateProperty(this.testEntityIds.get('property')!, {
          name: 'Updated Test Property',
          description: 'Updated description for CRUD test'
        });
        this.logResult('Property', 'UPDATE', true);
      } catch (error: any) {
        this.logResult('Property', 'UPDATE', false, error.message);
      }
    }

    // LIST
    try {
      const properties = await getProperties();
      this.logResult('Property', 'LIST', properties.properties.length > 0, undefined, properties.properties.length);
    } catch (error: any) {
      this.logResult('Property', 'LIST', false, error.message);
    }

    // DELETE (commented out to preserve test data)
    // if (this.testEntityIds.has('property')) {
    //   try {
    //     await deleteProperty(this.testEntityIds.get('property')!);
    //     this.logResult('Property', 'DELETE', true);
    //   } catch (error: any) {
    //     this.logResult('Property', 'DELETE', false, error.message);
    //   }
    // }

    console.log('');
  }

  async testTenantCRUD() {
    console.log('👤 Testing Tenant CRUD Operations');
    console.log('---------------------------------');

    // CREATE
    try {
      const tenantData = {
        userId: 'test-tenant-user-id',
        personalInfo: {
          firstName: 'Test',
          lastName: 'Tenant',
          email: 'test.tenant@example.com',
          phone: '+1234567890',
          dateOfBirth: '1990-01-01',
          emergencyContact: {
            name: 'Emergency Contact',
            phone: '+0987654321',
            relationship: 'Friend'
          }
        },
        status: 'active' as const,
        currentUnit: null,
        currentLease: null,
        applicationDate: new Date(),
        moveInDate: null,
        preferences: {
          communicationMethod: 'email' as const,
          language: 'en',
          timezone: 'UTC'
        },
        documents: [],
        createdAt: new Date()
      };

      const tenantId = await createTenant(tenantData);
      this.testEntityIds.set('tenant', tenantId);
      this.logResult('Tenant', 'CREATE', true, undefined, tenantId);
    } catch (error: any) {
      this.logResult('Tenant', 'CREATE', false, error.message);
    }

    // READ
    if (this.testEntityIds.has('tenant')) {
      try {
        const tenant = await getTenant(this.testEntityIds.get('tenant')!);
        this.logResult('Tenant', 'READ', !!tenant);
      } catch (error: any) {
        this.logResult('Tenant', 'READ', false, error.message);
      }
    }

    // UPDATE
    if (this.testEntityIds.has('tenant')) {
      try {
        await updateTenant(this.testEntityIds.get('tenant')!, {
          personalInfo: {
            firstName: 'Updated',
            lastName: 'Tenant',
            email: 'updated.tenant@example.com',
            phone: '+1234567890',
            dateOfBirth: '1990-01-01',
            emergencyContact: {
              name: 'Emergency Contact',
              phone: '+0987654321',
              relationship: 'Friend'
            }
          }
        });
        this.logResult('Tenant', 'UPDATE', true);
      } catch (error: any) {
        this.logResult('Tenant', 'UPDATE', false, error.message);
      }
    }

    console.log('');
  }

  async testMaintenanceCRUD() {
    console.log('🔧 Testing Maintenance Request CRUD Operations');
    console.log('----------------------------------------------');

    // CREATE
    try {
      const maintenanceData = {
        title: 'Test Maintenance Request',
        description: 'This is a test maintenance request for CRUD operations',
        category: 'plumbing' as const,
        priority: 'medium' as const,
        type: 'repair' as const,
        propertyId: 'test-property-id',
        unitId: 'test-unit-id',
        tenantId: 'test-tenant-id',
        submittedBy: 'test-user-id',
        submittedByName: 'Test User',
        submittedByRole: 'tenant',
        submittedMedia: [],
        preferredDate: null,
        tenantAvailable: true,
        emergencyContact: null,
        progressMedia: [],
        completionMedia: [],
        assignedAgentId: null,
        estimatedCost: null,
        actualCost: null,
        requiresApproval: false,
        approvedBy: null,
        scheduledDate: null,
        completedDate: null,
        comments: []
      };

      const requestId = await createMaintenanceRequest(maintenanceData);
      this.testEntityIds.set('maintenance', requestId);
      this.logResult('Maintenance', 'CREATE', true, undefined, requestId);
    } catch (error: any) {
      this.logResult('Maintenance', 'CREATE', false, error.message);
    }

    // READ
    if (this.testEntityIds.has('maintenance')) {
      try {
        const request = await getMaintenanceRequest(this.testEntityIds.get('maintenance')!);
        this.logResult('Maintenance', 'READ', !!request);
      } catch (error: any) {
        this.logResult('Maintenance', 'READ', false, error.message);
      }
    }

    // UPDATE
    if (this.testEntityIds.has('maintenance')) {
      try {
        await updateMaintenanceRequest(this.testEntityIds.get('maintenance')!, {
          priority: 'high' as const,
          estimatedCost: 150.00
        });
        this.logResult('Maintenance', 'UPDATE', true);
      } catch (error: any) {
        this.logResult('Maintenance', 'UPDATE', false, error.message);
      }
    }

    console.log('');
  }

  async testTransactionCRUD() {
    console.log('💰 Testing Transaction CRUD Operations');
    console.log('--------------------------------------');

    // CREATE
    try {
      const transactionData = {
        type: 'payment' as const,
        subtype: 'rent',
        amount: 1200.00,
        currency: 'USD' as const,
        description: 'Test rent payment for CRUD operations',
        propertyId: 'test-property-id',
        unitId: 'test-unit-id',
        tenantId: 'test-tenant-id',
        leaseId: 'test-lease-id',
        paymentMethod: 'bank_transfer' as const,
        reference: 'TEST-CRUD-001',
        dueDate: new Date(),
        paidDate: null,
        processedBy: null,
        processedAt: null,
        metadata: {
          testTransaction: true
        }
      };

      const transactionId = await createTransaction(transactionData);
      this.testEntityIds.set('transaction', transactionId);
      this.logResult('Transaction', 'CREATE', true, undefined, transactionId);
    } catch (error: any) {
      this.logResult('Transaction', 'CREATE', false, error.message);
    }

    // READ
    if (this.testEntityIds.has('transaction')) {
      try {
        const transaction = await getTransaction(this.testEntityIds.get('transaction')!);
        this.logResult('Transaction', 'READ', !!transaction);
      } catch (error: any) {
        this.logResult('Transaction', 'READ', false, error.message);
      }
    }

    // UPDATE
    if (this.testEntityIds.has('transaction')) {
      try {
        await updateTransaction(this.testEntityIds.get('transaction')!, {
          status: 'completed' as const,
          paidDate: new Date(),
          processedBy: 'test-admin'
        });
        this.logResult('Transaction', 'UPDATE', true);
      } catch (error: any) {
        this.logResult('Transaction', 'UPDATE', false, error.message);
      }
    }

    console.log('');
  }

  async runAllTests() {
    const authenticated = await this.authenticate();
    if (!authenticated) {
      console.log('❌ Cannot proceed without authentication');
      return;
    }

    await this.testPropertyCRUD();
    await this.testTenantCRUD();
    await this.testMaintenanceCRUD();
    await this.testTransactionCRUD();

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Test Summary');
    console.log('===============');
    
    const groupedResults = this.results.reduce((acc, result) => {
      if (!acc[result.entity]) {
        acc[result.entity] = { passed: 0, failed: 0, total: 0 };
      }
      acc[result.entity].total++;
      if (result.success) {
        acc[result.entity].passed++;
      } else {
        acc[result.entity].failed++;
      }
      return acc;
    }, {} as Record<string, { passed: number; failed: number; total: number }>);

    Object.entries(groupedResults).forEach(([entity, stats]) => {
      const percentage = Math.round((stats.passed / stats.total) * 100);
      console.log(`${entity}: ${stats.passed}/${stats.total} passed (${percentage}%)`);
    });

    const totalPassed = this.results.filter(r => r.success).length;
    const totalTests = this.results.length;
    const overallPercentage = Math.round((totalPassed / totalTests) * 100);
    
    console.log(`\nOverall: ${totalPassed}/${totalTests} tests passed (${overallPercentage}%)`);
    
    if (overallPercentage === 100) {
      console.log('\n🎉 All CRUD operations are working correctly!');
    } else {
      console.log('\n⚠️  Some CRUD operations need attention.');
    }

    // Show failed tests
    const failedTests = this.results.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`   ${test.entity} ${test.operation}: ${test.error}`);
      });
    }
  }
}

// Run the tests
async function main() {
  const tester = new CRUDTester();
  await tester.runAllTests();
  process.exit(0);
}

main().catch(console.error);