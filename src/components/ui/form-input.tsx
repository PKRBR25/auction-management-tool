import React from 'react';
import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  pattern?: {
    value: RegExp;
    message: string;
  };
  validate?: (value: string) => boolean | string;
  placeholder?: string;
}

export function FormInput({
  id,
  label,
  type = 'text',
  required = false,
  register,
  errors,
  pattern,
  validate,
  placeholder,
}: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <input
          id={id}
          type={type}
          autoComplete={id}
          {...register(id, {
            required: required ? 'This field is required' : false,
            pattern,
            validate,
          })}
          className={`appearance-none block w-full px-3 py-2 border ${
            errors[id] ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          placeholder={placeholder}
        />
        {errors[id] && (
          <p className="mt-2 text-sm text-red-600">
            {errors[id]?.message as string}
          </p>
        )}
      </div>
    </div>
  );
}
