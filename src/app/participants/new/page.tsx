'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';

// Validation schema
const participantSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email format'),
  contactName: z.string().min(1, 'Contact name is required'),
  phone: z.string().min(1, 'Phone number is required'),
});

type ParticipantFormData = z.infer<typeof participantSchema>;

export default function NewParticipantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
  });

  const onSubmit = async (data: z.infer<typeof participantSchema>) => {
    // Remove any non-numeric characters from phone
    const cleanedPhone = data.phone.replace(/\D/g, '');
    setIsSubmitting(true);
    try {
      console.log('Submitting form data:', data);
      
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          phone: cleanedPhone
        }),
      });

      const responseData = await response.json();
      console.log('Server response:', {
        status: response.status,
        data: responseData
      });

      if (!response.ok) {
        if (responseData.details) {
          // Handle validation errors
          const errorMessages = Object.values(responseData.details)
            .map((error: any) => error.message)
            .join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(responseData.error || 'Failed to create participant');
      }

      toast({
        title: 'Success',
        description: 'Participant created successfully',
        variant: 'success',
      });

      router.push('/participants');
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create participant',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">Register New Participant</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <Input
                id="name"
                type="text"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                Contact Name
              </label>
              <Input
                id="contactName"
                type="text"
                {...register('contactName')}
                className={errors.contactName ? 'border-red-500' : ''}
              />
              {errors.contactName && (
                <p className="mt-1 text-sm text-red-600">{errors.contactName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </div>
                ) : (
                  'Register'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
}
