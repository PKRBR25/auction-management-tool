'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Participant = {
  id: number;
  name: string;
  email: string;
  contactName: string;
  phone: string;
  isActive: boolean;
};

export default function AuctionParticipantsPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch('/api/participants');
        if (!response.ok) {
          throw new Error('Failed to fetch participants');
        }
        const data = await response.json();
        setParticipants(data.filter((p: Participant) => p.isActive));
      } catch (error) {
        console.error('Error fetching participants:', error);
        setError('Failed to load participants');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  const handleParticipantToggle = (participantId: number) => {
    setSelectedParticipants(prev => {
      if (prev.includes(participantId)) {
        return prev.filter(id => id !== participantId);
      } else {
        return [...prev, participantId];
      }
    });
  };

  const handleContinue = async () => {
    try {
      // Validate minimum participants
      if (selectedParticipants.length < 3) {
        setError('Please select at least 3 participants');
        return;
      }

      // Get auction ID
      const auctionId = sessionStorage.getItem('currentAuctionId');
      console.log('Assigning participants - Current auction ID:', auctionId);
      
      if (!auctionId || isNaN(Number(auctionId))) {
        console.error('Invalid or missing auction ID:', auctionId);
        setError('Invalid auction ID. Please start over.');
        router.push('/auctions/new');
        return;
      }

      // First check if we have the auction data in session storage
      const storedAuctionData = sessionStorage.getItem('currentAuctionData');
      if (!storedAuctionData) {
        console.error('No auction data found in session storage');
        setError('Auction data not found. Please start over.');
        router.push('/auctions/new');
        return;
      }

      // Verify if the auction exists and is accessible
      try {
        console.log('Verifying auction exists:', auctionId);
        const verifyAuctionResponse = await fetch(`/api/auctions/${auctionId}`);
        const verifyAuctionData = await verifyAuctionResponse.json();
        
        if (!verifyAuctionResponse.ok) {
          console.error('Auction verification failed:', {
            status: verifyAuctionResponse.status,
            statusText: verifyAuctionResponse.statusText,
            error: verifyAuctionData.error || 'Unknown error',
            auctionId
          });
          throw new Error(verifyAuctionData.error || 'Auction not found or inaccessible');
        }

        if (!verifyAuctionData || typeof verifyAuctionData.id !== 'number') {
          console.error('Invalid auction data:', verifyAuctionData);
          throw new Error('Invalid auction data received');
        }

        console.log('Auction verified:', {
          id: verifyAuctionData.id,
          description: verifyAuctionData.description,
          isActive: verifyAuctionData.isActive
        });
      } catch (error) {
        console.error('Error verifying auction:', error);
        throw error;
      }

      // Make API request to assign participants
      const participantIds = selectedParticipants.map(id => Number(id));
      console.log('Assigning participants to auction:', {
        auctionId,
        participantIds,
        participantCount: participantIds.length,
        selectedParticipants: participants.filter(p => selectedParticipants.includes(p.id))
      });

      const response = await fetch(`/api/auctions/${auctionId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantIds }),
      });

      // Handle API response
      const data = await response.json();
      console.log('Participant assignment response:', {
        status: response.status,
        ok: response.ok,
        data
      });

      if (!response.ok) {
        const errorMessage = data.details || data.error || 'Failed to assign participants';
        console.error('Participant assignment failed:', errorMessage);
        throw new Error(errorMessage);
      }

      // Verify the assignment was successful
      console.log('Verifying participant assignment...');
      const verifyResponse = await fetch(`/api/auctions/${auctionId}`);
      const verifyData = await verifyResponse.json();
      
      if (!verifyResponse.ok) {
        console.error('Assignment verification failed:', {
          status: verifyResponse.status,
          statusText: verifyResponse.statusText,
          error: verifyData.error
        });
        throw new Error(verifyData.error || 'Failed to verify participant assignment');
      }

      console.log('Assignment verification response:', {
        auctionId,
        status: verifyResponse.status,
        participantCount: verifyData.participants?.length,
        expectedCount: participantIds.length
      });
      
      if (!verifyData.participants || verifyData.participants.length === 0) {
        console.error('No participants found after assignment:', verifyData);
        throw new Error('Participants were not properly assigned. Please try again.');
      }
      
      if (verifyData.participants.length !== participantIds.length) {
        console.error('Participant count mismatch:', {
          expected: participantIds.length,
          actual: verifyData.participants.length
        });
        throw new Error(`Expected ${participantIds.length} participants but found ${verifyData.participants.length}. Please try again.`);
      }

      // Success - redirect to resume page
      console.log('Participant assignment successful:', {
        auctionId,
        assignedCount: participantIds.length
      });
      router.push('/auctions/resume');
    } catch (error) {
      console.error('Error assigning participants:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign participants to auction');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading participants...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Select Auction Participants</h1>
      
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

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {participants.map((participant) => (
            <li key={participant.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedParticipants.includes(participant.id)}
                      onChange={() => handleParticipantToggle(participant.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                      <p className="text-sm text-gray-500">{participant.email}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-900">{participant.contactName}</p>
                    <p className="text-gray-500">{participant.phone}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => router.push('/auctions/confirm')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={selectedParticipants.length < 3}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${selectedParticipants.length >= 3 
              ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              : 'bg-gray-400 cursor-not-allowed'}`}
        >
          Continue
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        {selectedParticipants.length < 3 
          ? `Please select at least 3 participants (${selectedParticipants.length} selected)`
          : `${selectedParticipants.length} participants selected`}
      </div>
    </div>
  );
}
