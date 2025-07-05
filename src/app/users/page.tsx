'use client';

import { useSession } from 'next-auth/react';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import { useEffect, useState } from 'react';

interface UserData {
  full_name: string;
  email: string;
  created_at: string;
  is_verified: boolean;
  is_active: boolean;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Add cache-busting query parameter to prevent browser caching
        const response = await fetch(`/api/users/profile?t=${Date.now()}`, {
          // Prevent browser caching
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserData({
            full_name: data.fullName,
            email: data.email,
            created_at: data.createdAt,
            is_verified: data.isVerified,
            is_active: data.isActive
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Fetch on mount and when session changes
    if (session) {
      fetchUserData();
    }

    // Set up interval to refresh data every minute
    const intervalId = setInterval(() => {
      if (session) {
        fetchUserData();
      }
    }, 60000); // 60 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [session]);

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Welcome to your profile
          </h1>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-6 mb-6">
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-3xl text-gray-600">
                  {userData?.full_name?.[0] || '?'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-medium text-gray-900">
                  User: {userData?.full_name || 'Loading...'}
                </h2>
                <p className="text-gray-500">
                  Email: {userData?.email || 'Loading...'}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    User Creation
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {userData?.created_at
                      ? new Date(userData.created_at).toLocaleDateString()
                      : 'Loading...'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Verified
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        userData?.is_verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {userData?.is_verified ? 'Yes' : 'No'}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Active
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        userData?.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {userData?.is_active ? 'Yes' : 'No'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
