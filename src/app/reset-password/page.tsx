'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthContainer } from '@/components/ui/auth-container';
import { FormInput } from '@/components/ui/form-input';
import { Button } from '@/components/ui/button';
import { emailPattern, passwordPattern, validatePasswordMatch, validateVerificationCode } from '@/lib/validations/auth';

interface ResetPasswordFormData {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      email: searchParams?.get('email') || '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Ensure consistent handling of special characters in password
      const sanitizedPassword = encodeURIComponent(data.newPassword);

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          verificationCode: data.verificationCode,
          newPassword: sanitizedPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Password reset failed');
      }

      // Redirect to login page on success
      router.push('/login');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer title="Reset your Password">
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <FormInput
            id="email"
            label="Email address"
            type="email"
            required
            register={register}
            errors={errors}
            pattern={emailPattern}
          />

          <FormInput
            id="verificationCode"
            label="Verification Code"
            required
            register={register}
            errors={errors}
            validate={validateVerificationCode}
            placeholder="Enter 6-digit code"
          />

          <FormInput
            id="newPassword"
            label="New Password"
            type="password"
            required
            register={register}
            errors={errors}
            pattern={passwordPattern}
          />

          <FormInput
            id="confirmNewPassword"
            label="Confirm New Password"
            type="password"
            required
            register={register}
            errors={errors}
            validate={validatePasswordMatch(newPassword)}
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
          Reset Password
        </Button>
      </form>
    </AuthContainer>
  );
}
