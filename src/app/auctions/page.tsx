'use client';

import { useEffect, useState } from 'react';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import Link from 'next/link';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

interface Auction {
  auction_id: number;
  from: string;
  to: string;
  is_active: boolean;
  description: string;
  freight: string;
  created_at: string;
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setError(null);
        const response = await fetch('/api/auctions');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch auctions');
        }

        setAuctions(data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Valid Auctions in Progress
            </h1>
            <Link
              href="/auctions/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Auction
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading auctions</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">No auctions found. Create a new auction to get started.</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {auctions.map((auction) => (
                  <li key={auction.auction_id} className="hover:bg-gray-50">
                    <Link href={`/auctions/${auction.auction_id}`} className="block">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <p className="text-sm font-medium text-indigo-600">
                              Auction #{auction.auction_id}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(auction.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-900 font-medium truncate">
                            {auction.description}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Freight: {auction.freight}
                          </p>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex space-x-6">
                            <p className="flex items-center text-sm text-gray-500">
                              <span className="font-medium text-gray-700">From:</span>
                              <span className="ml-1">{auction.from}</span>
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <span className="font-medium text-gray-700">To:</span>
                              <span className="ml-1">{auction.to}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
