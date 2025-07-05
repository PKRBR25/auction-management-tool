'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema
const auctionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  freight: z.enum(['Truck Load', 'Less than Truck Load'], {
    required_error: 'Please select a freight type'
  }),
  from: z.string().min(1, 'From location is required'),
  to: z.string().min(1, 'To location is required'),
  vehicle: z.enum(['Urban Cargo', 'Rural Cargo', 'Truck', 'Heavy Truck'], {
    required_error: 'Please select a vehicle type'
  }),
  type: z.enum(['Fleet', 'Third Part'], {
    required_error: 'Please select a type'
  }),
  tracking: z.enum(['Real Time', 'No'], {
    required_error: 'Please select a tracking option'
  }),
  insurance: z.enum(['Yes', 'No'], {
    required_error: 'Please select an insurance option'
  })
});

type AuctionFormData = z.infer<typeof auctionSchema>;

export default function NewAuctionPage() {
  const router = useRouter();
  const [useTemplate, setUseTemplate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AuctionFormData>({
    resolver: zodResolver(auctionSchema)
  });

  const onSubmit = async (data: AuctionFormData) => {
    try {
      // Store form data in session storage for the confirmation page
      sessionStorage.setItem('newAuctionData', JSON.stringify(data));
      router.push('/auctions/confirm');
    } catch (error) {
      console.error('Error saving auction data:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/auctions/template/validate', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to validate template');
      }

      // Store the validated data and proceed
      sessionStorage.setItem('newAuctionData', JSON.stringify(result));
      router.push('/auctions/confirm');
    } catch (error: unknown) {
      console.error('Error uploading template:', error);
      if (error instanceof Error) {
        try {
          // Try to parse the error message as JSON
          const errorData = JSON.parse(error.message);
          if (errorData.message) {
            setUploadError(errorData.message);
          } else if (errorData.error && errorData.details) {
            setUploadError(`${errorData.error}: ${JSON.stringify(errorData.details)}`);
          } else {
            setUploadError(error.message);
          }
        } catch {
          // If not JSON, use the error message as is
          setUploadError(error.message);
        }
      } else {
        setUploadError('Failed to process template');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">New Auction</h1>

      <div className="mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useTemplate}
            onChange={(e) => setUseTemplate(e.target.checked)}
            className="form-checkbox"
          />
          <span>Template</span>
        </label>
      </div>

      {useTemplate ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/auctions/template/download');
                    if (!response.ok) {
                      const error = await response.json();
                      throw new Error(error.error || 'Download failed');
                    }
                    
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'auction-template.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    console.error('Error downloading template:', error);
                    setUploadError('Failed to download template');
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Download Template
              </button>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Template
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Excel files only (.xlsx, .xls)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isUploading && (
            <div className="text-center">
              <p>Processing template...</p>
            </div>
          )}

          {uploadError && (
            <div className="text-red-500 text-center">
              {uploadError}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Auction Description
            </label>
            <input
              type="text"
              {...register('description')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Freight
            </label>
            <select
              {...register('freight')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select freight type</option>
              <option value="Truck Load">Truck Load</option>
              <option value="Less than Truck Load">Less than Truck Load</option>
            </select>
            {errors.freight && (
              <p className="mt-1 text-sm text-red-600">{errors.freight.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                From
              </label>
              <input
                type="text"
                {...register('from')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.from && (
                <p className="mt-1 text-sm text-red-600">{errors.from.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                To
              </label>
              <input
                type="text"
                {...register('to')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.to && (
                <p className="mt-1 text-sm text-red-600">{errors.to.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle
            </label>
            <select
              {...register('vehicle')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select vehicle type</option>
              <option value="Urban Cargo">Urban Cargo</option>
              <option value="Rural Cargo">Rural Cargo</option>
              <option value="Truck">Truck</option>
              <option value="Heavy Truck">Heavy Truck</option>
            </select>
            {errors.vehicle && (
              <p className="mt-1 text-sm text-red-600">{errors.vehicle.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              {...register('type')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              <option value="Fleet">Fleet</option>
              <option value="Third Part">Third Part</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tracking
            </label>
            <select
              {...register('tracking')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select tracking option</option>
              <option value="Real Time">Real Time</option>
              <option value="No">No</option>
            </select>
            {errors.tracking && (
              <p className="mt-1 text-sm text-red-600">{errors.tracking.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Insurance
            </label>
            <select
              {...register('insurance')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select insurance option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.insurance && (
              <p className="mt-1 text-sm text-red-600">{errors.insurance.message}</p>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
