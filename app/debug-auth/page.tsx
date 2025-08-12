'use client';

import { useAuth } from '@/hooks/useAuth';

export default function DebugAuthPage() {
  const { user, loading, firebaseUser } = useAuth();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Authentication</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Loading State:</h2>
          <p className="text-lg">{loading ? 'TRUE' : 'FALSE'}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Firebase User:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {firebaseUser ? JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified
            }, null, 2) : 'NULL'}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">App User:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {user ? JSON.stringify(user, null, 2) : 'NULL'}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">User Role:</h2>
          <p className="text-lg font-mono">
            {user?.role || 'UNDEFINED'}
          </p>
        </div>
      </div>
    </div>
  );
}