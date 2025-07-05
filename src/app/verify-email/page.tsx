'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthContainer } from '@/components/ui/auth-container';
import { FormInput } from '@/components/ui/form-input';
import { Button } from '@/components/ui/button';
import { emailPattern, validateVerificationCode } from '@/lib/validations/auth';

interface VerifyEmailFormData {
  email: string;
  verificationCode: string;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormData>({
    defaultValues: {
      email: searchParams?.get('email') || '',
    },
  });

  const onSubmit = async (data: VerifyEmailFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          verificationCode: data.verificationCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.message) {
          if (result.message.includes('already verified')) {
            // If email is already verified, redirect to login
            router.push('/login');
            return;
          }
          throw new Error(result.message);
        }
        throw new Error('Verification failed. Please try again.');
      }

      // Show success message and redirect to login page
      setError(null);
      router.push('/login?verified=true');
    } catch (error) {
      console.error('Verification error:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred. Please try again or contact support.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer title="Welcome confirm you information to validate your user">
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <FormInput<VerifyEmailFormData>
            id="email"
            label="Email address"
            type="email"
            required
            register={register}
            errors={errors}
            pattern={emailPattern}
          />

          <FormInput<VerifyEmailFormData>
            id="verificationCode"
            label="Verification Code"
            required
            register={register}
            errors={errors}
            validate={validateVerificationCode}
            placeholder="Enter 6-digit code"
          />
        </div>

        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Back to login
          </Link>
        </div>

        <Button type="submit" fullWidth isLoading={isLoading}>
          Verify Email
        </Button>
      </form>
    </AuthContainer>
  );
}
