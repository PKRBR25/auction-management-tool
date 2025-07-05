'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AuctionData = {
  id: number;
  description: string;
  freight: string;
  from: string;
  to: string;
  vehicle: string;
  type: string;
  tracking: string;
  insurance: string;
  participants: {
    id: number;
    name: string;
    email: string;
    contactName: string;
    phone: string;
  }[];
};

export default function AuctionResumePage() {
  const router = useRouter();
  const [auctionData, setAuctionData] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuctionData = async () => {
      const auctionId = sessionStorage.getItem('currentAuctionId');
      if (!auctionId) {
        router.push('/auctions/new');
        return;
      }

      try {
        console.log('Fetching auction data for ID:', auctionId);
        const response = await fetch(`/api/auctions/${auctionId}`);
        const data = await response.json();
        console.log('API Response:', { status: response.status, data });

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch auction data');
        }

        // The API now returns the data directly in the expected format
        setAuctionData(data);
      } catch (error) {
        console.error('Error fetching auction data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load auction details');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionData();
  }, [router]);

  const handleFinish = async () => {
    try {
      // Clear session storage
      sessionStorage.removeItem('newAuctionData');
      sessionStorage.removeItem('currentAuctionId');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error finalizing auction:', error);
      setError('Failed to finalize auction');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading auction details...</p>
      </div>
    );
  }

  if (!auctionData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>No auction data found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Auction Summary</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Auction Details
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {auctionData.description}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Freight</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {auctionData.freight}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">From</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {auctionData.from}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">To</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {auctionData.to}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Vehicle</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {auctionData.vehicle}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {auctionData.type}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tracking</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {auctionData.tracking}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Insurance</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {auctionData.insurance}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Selected Participants
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {auctionData.participants?.length || 0} participants selected
          </p>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {(auctionData.participants || []).map((participant) => (
              <li key={participant.id} className="px-4 py-4 sm:px-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                    <p className="text-sm text-gray-500">{participant.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{participant.contactName}</p>
                    <p className="text-sm text-gray-500">{participant.phone}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => router.push('/auctions/participants')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back
        </button>
        <button
          onClick={handleFinish}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
