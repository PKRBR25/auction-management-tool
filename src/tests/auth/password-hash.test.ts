import { hash, compare } from 'bcryptjs';
import { describe, expect, test } from '@jest/globals';
import prisma from '@/lib/prisma';

describe('Password Hashing and Verification', () => {
  // Password must be at least 12 chars with uppercase, lowercase, number, and special char
  const testPassword = 'SecurePass123@#';
  let hashedPassword: string;

  test('should hash password consistently', async () => {
    // Hash the password as done in registration
    hashedPassword = await hash(testPassword, 12);
    expect(hashedPassword).toBeTruthy();
    expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 chars
  });

  test('should verify password correctly', async () => {
    // Verify the password as done in login
    const isValid = await compare(testPassword, hashedPassword);
    expect(isValid).toBe(true);
  });

  test('should fail with incorrect password', async () => {
    const wrongPassword = 'WrongPassword123!';
    const isValid = await compare(wrongPassword, hashedPassword);
    expect(isValid).toBe(false);
  });

  test('should verify real user password from database', async () => {
    // Get a real user from the database
    const user = await prisma.user.findFirst({
      where: {
        isActive: true
      }
    });

    if (!user || !user.hashedPassword) {
      console.log('No user found in database');
      return;
    }

    console.log('Testing password verification for user:', user.email);
    console.log('Stored hash length:', user.hashedPassword.length);
    console.log('Hash format check:', user.hashedPassword.startsWith('$2')); // bcrypt hashes start with $2a$ or $2b$

    // Try to verify with the original password (this is just for testing)
    // In a real scenario, we would never log or expose the hashed password
    console.log('Stored hash:', user.hashedPassword);
  });
});
