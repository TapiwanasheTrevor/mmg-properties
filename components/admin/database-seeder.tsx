'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, Users, Building, FileText, Bell, Wrench } from 'lucide-react';
import { seedAllData } from '@/lib/seeds/index';
import { seedAdvancedData } from '@/lib/seeds/advanced';
import { isFirebaseConfigured } from '@/lib/firebase';

interface SeedingStatus {
  isSeeding: boolean;
  completed: boolean;
  error: string | null;
  progress: string;
  data: any;
}

export default function DatabaseSeeder() {
  const [status, setStatus] = useState<SeedingStatus>({
    isSeeding: false,
    completed: false,
    error: null,
    progress: '',
    data: null,
  });

  const handleSeed = async () => {
    if (!isFirebaseConfigured()) {
      setStatus(prev => ({
        ...prev,
        error: 'Firebase is not properly configured. Please set up your Firebase project first.'
      }));
      return;
    }

    setStatus({
      isSeeding: true,
      completed: false,
      error: null,
      progress: 'Starting database seeding...',
      data: null,
    });

    try {
      // Seed basic data
      setStatus(prev => ({ ...prev, progress: 'Creating users and properties...' }));
      const basicData = await seedAllData();

      // Seed advanced data
      setStatus(prev => ({ ...prev, progress: 'Creating leases and maintenance data...' }));
      const advancedData = await seedAdvancedData(
        basicData.userIds,
        basicData.properties,
        basicData.units
      );

      setStatus({
        isSeeding: false,
        completed: true,
        error: null,
        progress: 'Seeding completed successfully!',
        data: {
          users: Object.keys(basicData.userIds).length,
          properties: basicData.properties.length,
          units: basicData.units.length,
          leases: advancedData.leases.length,
          maintenance: advancedData.maintenanceRequests.length,
          transactions: advancedData.transactions.length,
          notifications: advancedData.notifications.length,
          inspections: advancedData.inspections.length,
        },
      });
    } catch (error: any) {
      setStatus({
        isSeeding: false,
        completed: false,
        error: error.message || 'An error occurred during seeding',
        progress: '',
        data: null,
      });
    }
  };

  const resetStatus = () => {
    setStatus({
      isSeeding: false,
      completed: false,
      error: null,
      progress: '',
      data: null,
    });
  };

  const testCredentials = [
    { role: 'Admin', email: 'admin@mmg.com', password: 'password123', icon: '👑' },
    { role: 'Owner', email: 'john.owner@mmg.com', password: 'password123', icon: '🏢' },
    { role: 'Owner', email: 'sarah.owner@mmg.com', password: 'password123', icon: '🏢' },
    { role: 'Agent', email: 'mike.agent@mmg.com', password: 'password123', icon: '🎯' },
    { role: 'Agent', email: 'emma.agent@mmg.com', password: 'password123', icon: '🎯' },
    { role: 'Tenant', email: 'alex.tenant@mmg.com', password: 'password123', icon: '🏠' },
    { role: 'Tenant', email: 'lisa.tenant@mmg.com', password: 'password123', icon: '🏠' },
    { role: 'Tenant', email: 'david.tenant@mmg.com', password: 'password123', icon: '🏠' },
    { role: 'Tenant', email: 'maria.tenant@mmg.com', password: 'password123', icon: '🏠' },
  ];

  if (!isFirebaseConfigured()) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Seeder
          </CardTitle>
          <CardDescription>
            Populate your database with test data for development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Firebase is not configured. Please set up your Firebase project and environment variables before seeding the database.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Seeder
          </CardTitle>
          <CardDescription>
            Populate your database with comprehensive test data for development and testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status.error && (
            <Alert variant="destructive">
              <AlertDescription>{status.error}</AlertDescription>
            </Alert>
          )}

          {status.progress && (
            <Alert>
              <AlertDescription className="flex items-center gap-2">
                {status.isSeeding && <Loader2 className="h-4 w-4 animate-spin" />}
                {status.progress}
              </AlertDescription>
            </Alert>
          )}

          {status.completed && status.data && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-800">✅ Seeding Completed!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{status.data.users} Users</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4" />
                    <span>{status.data.properties} Properties</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>{status.data.leases} Leases</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wrench className="h-4 w-4" />
                    <span>{status.data.maintenance} Requests</span>
                  </div>
                </div>
                <div className="text-sm text-green-700">
                  Database has been populated with realistic test data including users, properties, units, leases, maintenance requests, transactions, and notifications.
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSeed}
              disabled={status.isSeeding}
              className="flex items-center gap-2"
            >
              {status.isSeeding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Seed Database
                </>
              )}
            </Button>

            {(status.completed || status.error) && (
              <Button variant="outline" onClick={resetStatus}>
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {status.completed && (
        <Card>
          <CardHeader>
            <CardTitle>🔑 Test User Credentials</CardTitle>
            <CardDescription>
              Use these credentials to log in and test different user roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {testCredentials.map((cred, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cred.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cred.email}</span>
                        <Badge variant="secondary">{cred.role}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">Password: {cred.password}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(cred.email)}
                  >
                    Copy Email
                  </Button>
                </div>
              ))}
            </div>
            
            <Alert className="mt-4">
              <AlertDescription>
                💡 <strong>Tips:</strong> Each role provides different dashboard views and permissions. 
                Try logging in with different users to explore the full platform functionality.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>📋 What Gets Created</CardTitle>
          <CardDescription>
            Overview of the test data that will be generated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">👥 Users & Profiles</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 1 Admin user</li>
                <li>• 2 Property owners</li>
                <li>• 2 Property agents</li>
                <li>• 4 Tenant users</li>
                <li>• Complete user profiles with contact info</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">🏢 Properties & Units</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 3 Properties in different cities</li>
                <li>• 52 Total units (studios, 1BR, 2BR, 3BR)</li>
                <li>• Realistic addresses and amenities</li>
                <li>• Property images and descriptions</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">📄 Leases & Transactions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Active leases for occupied units</li>
                <li>• 6 months of rent payment history</li>
                <li>• Security deposit transactions</li>
                <li>• Various payment statuses</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">🔧 Maintenance & More</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 25+ Maintenance requests</li>
                <li>• Property inspections</li>
                <li>• User notifications</li>
                <li>• Realistic timestamps and statuses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}