'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthContainer } from '@/components/ui/auth-container';
import { FormInput } from '@/components/ui/form-input';
import { Button } from '@/components/ui/button';
import { emailPattern, passwordPattern, validatePasswordMatch } from '@/lib/validations/auth';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Server response:', result);
        throw new Error(result.message || result.details || 'Registration failed');
      }

      // Redirect to verification page
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer title="Insert your informations to register">
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
            id="password"
            label="Password"
            type="password"
            required
            register={register}
            errors={errors}
            pattern={passwordPattern}
          />

          <FormInput
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            required
            register={register}
            errors={errors}
            validate={validatePasswordMatch(password)}
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
          Sign up
        </Button>
      </form>
    </AuthContainer>
  );
}
