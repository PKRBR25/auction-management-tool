'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AuctionData = {
  description: string;
  freight: string;
  from: string;
  to: string;
  vehicle: string;
  type: string;
  tracking: string;
  insurance: string;
};

export default function ConfirmAuctionPage() {
  const router = useRouter();
  const [auctionData, setAuctionData] = useState<AuctionData | null>(null);

  useEffect(() => {
    // Retrieve auction data from session storage
    const storedData = sessionStorage.getItem('newAuctionData');
    if (storedData) {
      setAuctionData(JSON.parse(storedData));
    } else {
      router.push('/auctions/new');
    }
  }, [router]);

  const transformAuctionData = (data: AuctionData) => {
    // Transform data to match API schema
    return {
      ...data,
      vehicle: data.vehicle.toUpperCase().replace(/ /g, '_'),
      type: data.type.toUpperCase().replace(/ /g, '_'),
      tracking: data.tracking === 'Real Time' ? 'REAL_TIME' : 'NO',
      insurance: data.insurance.toUpperCase()
    };
  };

  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!auctionData) return;

    try {
      const transformedData = transformAuctionData(auctionData);
      console.log('Creating auction with data:', transformedData);

      const response = await fetch('/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      const result = await response.json();
      console.log('API Response:', { status: response.status, result });

      if (!response.ok) {
        const errorMessage = result.error || result.message || 'Failed to create auction';
        const errorDetails = result.details ? (Array.isArray(result.details) ? result.details.map((d: any) => d.message).join(', ') : result.details) : '';
        throw new Error(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
      }

      if (!result.id || typeof result.id !== 'number') {
        console.error('Invalid auction data received:', result);
        throw new Error('Invalid auction data received from server');
      }

      // Store the auction data
      const auctionId = result.id.toString();
      console.log('Created auction:', {
        id: result.id,
        description: result.description,
        freight: result.freight
      });
      sessionStorage.setItem('currentAuctionId', auctionId);
      sessionStorage.setItem('currentAuctionData', JSON.stringify(result));

      router.push('/auctions/participants');
    } catch (error) {
      console.error('Error creating auction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create auction';
      setError(errorMessage);
      console.log('Setting error message:', errorMessage);
    }
  };

  if (!auctionData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Confirm Auction Details</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Please review the auction information
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

      <div className="flex justify-between mt-6">
        <button
          onClick={() => router.push('/auctions/new')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Confirm & Continue
        </button>
      </div>
    </div>
  );
}
