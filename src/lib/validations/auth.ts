export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: 'Please enter a valid email address',
};

export const passwordPattern = {
  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  message:
    'Password must be at least 12 characters and include uppercase, lowercase, number, and special character',
};

export const validatePasswordMatch = (password: string) => (value: string) =>
  value === password || 'Passwords do not match';

export const validateVerificationCode = (value: string) => {
  const sixDigitCode = /^\d{6}$/;
  return sixDigitCode.test(value) || 'Please enter a valid 6-digit code';
};
