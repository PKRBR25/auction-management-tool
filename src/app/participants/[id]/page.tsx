'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';

// Validation schema
const participantSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email format'),
  contactName: z.string().min(1, 'Contact name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  isActive: z.boolean(),
});

type ParticipantFormData = z.infer<typeof participantSchema>;

interface Props {
  params: {
    id: string;
  };
}

export default function EditParticipantPage({ params }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
  });

  const isActive = watch('isActive');

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/participants/${params.id}`, {
          // Prevent caching to always get fresh data
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch participant');
        }

        const data = await response.json();
        console.log('Fetched participant data:', data); // Debug log

        // Reset form with fetched data
        reset({
          name: data.name,
          email: data.email,
          contactName: data.contactName,
          phone: data.phone.toString(),
          isActive: data.isActive,
        });
      } catch (error) {
        console.error('Error fetching participant:', error); // Debug log
        toast({
          title: 'Error',
          description: 'Failed to load participant data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Safe check for params.id and ensure it's a valid value
    const participantId = params?.id;
    if (participantId && !isNaN(Number(participantId))) {
      fetchParticipant();
    } else {
      setIsLoading(false);
      toast({
        title: 'Error',
        description: 'Invalid participant ID',
        variant: 'destructive',
      });
    }
  }, [params.id, reset]);

  const onSubmit = async (data: ParticipantFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      // Remove any non-numeric characters from phone
      const cleanedPhone = data.phone.replace(/\D/g, '');
      
      const response = await fetch(`/api/participants/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          phone: cleanedPhone
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update participant');
      }

      toast({
        title: 'Success',
        description: 'Participant updated successfully',
        variant: 'success',
      });

      router.push('/participants');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update participant',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this participant?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/participants/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete participant');
      }

      toast({
        title: 'Success',
        description: 'Participant deleted successfully',
        variant: 'success',
      });

      router.push('/participants');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete participant',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">Edit Participant</h1>

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

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="primary"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
}
