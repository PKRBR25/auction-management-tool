'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthContainer } from '@/components/ui/auth-container';
import { FormInput } from '@/components/ui/form-input';
import { Button } from '@/components/ui/button';
import { emailPattern } from '@/lib/validations/auth';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'An error occurred');
      }

      setEmailSent(true);
      // Redirect to reset password page after a short delay
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
      }, 3000); // Give user more time to read the success message
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer title="Reset Password Email Confirmation">
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {emailSent ? (
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-green-700">
              If the email exists in our system, you will receive reset instructions shortly. Redirecting...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            <FormInput
              id="email"
              label="Email address"
              type="email"
              required
              register={register}
              errors={errors}
              pattern={emailPattern}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
        )}

        {!emailSent && (
          <div className="flex items-center justify-between">
            <Button 
              type="submit" 
              fullWidth 
              isLoading={isLoading}
              disabled={isLoading}
            >
              Send Reset Instructions
            </Button>
          </div>
        )}

        <div className="text-center mt-4">
          <Link
            href="/login"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Back to Login
          </Link>
        </div>
      </form>
    </AuthContainer>
  );
}
