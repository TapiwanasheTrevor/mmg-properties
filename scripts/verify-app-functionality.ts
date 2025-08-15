#!/usr/bin/env tsx

/**
 * MMG Platform Application Functionality Verification
 * 
 * This script verifies that the application is running and accessible,
 * and that the main pages load correctly.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestResult {
  endpoint: string;
  status: number;
  success: boolean;
  description: string;
}

class AppVerifier {
  private baseUrl = 'http://localhost:3001';
  private results: TestResult[] = [];

  constructor() {
    console.log('🔍 MMG Platform Application Verification');
    console.log('========================================\n');
  }

  private async testEndpoint(endpoint: string, description: string): Promise<TestResult> {
    try {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" ${this.baseUrl}${endpoint}`);
      const status = parseInt(stdout.trim());
      const success = status === 200;
      
      const result: TestResult = {
        endpoint,
        status,
        success,
        description
      };

      this.results.push(result);
      const icon = success ? '✅' : '❌';
      console.log(`${icon} ${description}: ${status}`);
      
      return result;
    } catch (error: any) {
      const result: TestResult = {
        endpoint,
        status: 0,
        success: false,
        description
      };
      
      this.results.push(result);
      console.log(`❌ ${description}: Error - ${error.message}`);
      return result;
    }
  }

  async runVerification() {
    console.log('🌐 Testing Application Endpoints');
    console.log('-------------------------------');

    // Test main application pages
    await this.testEndpoint('/', 'Homepage');
    await this.testEndpoint('/login', 'Login Page');
    await this.testEndpoint('/properties', 'Properties Page');
    await this.testEndpoint('/tenants', 'Tenants Page');
    await this.testEndpoint('/leases', 'Leases Page');
    await this.testEndpoint('/maintenance', 'Maintenance Page');
    await this.testEndpoint('/financials', 'Financials Page');
    await this.testEndpoint('/messages', 'Messages Page');
    await this.testEndpoint('/dashboard', 'Dashboard Page');

    this.printSummary();
  }

  private printSummary() {
    console.log('\n📊 Verification Summary');
    console.log('=======================');

    const successfulTests = this.results.filter(r => r.success).length;
    const totalTests = this.results.length;
    const percentage = Math.round((successfulTests / totalTests) * 100);

    console.log(`✅ Successful: ${successfulTests}/${totalTests} (${percentage}%)`);

    if (percentage === 100) {
      console.log('\n🎉 All application endpoints are accessible!');
      console.log('✅ CRUD operations interface is ready for testing');
      console.log(`\n🌐 Access the application at: ${this.baseUrl}`);
      console.log('\n👤 Test Credentials Available:');
      console.log('   Admin: admin@mmgproperties.africa / Admin@MMG2024!');
      console.log('   Owner: owner@example.com / Owner@123456');
      console.log('   Agent: agent@mmgproperties.africa / Agent@123456');
      console.log('   Tenant: tenant@example.com / Tenant@123456');
    } else {
      console.log('\n⚠️  Some endpoints are not accessible:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`   ${result.description}: ${result.status || 'Error'}`);
      });
    }
  }
}

// Run the verification
async function main() {
  const verifier = new AppVerifier();
  await verifier.runVerification();
}

main().catch(console.error);