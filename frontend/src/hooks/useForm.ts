import { useState } from 'react';

interface FormError {
  message: string;
  type?: string;
}

interface FormErrors {
  fieldErrors?: Record<string, FormError[]>;
  nonFieldErrors?: FormError[];
}

export const useForm = <T extends Record<string, any>>(initialState: T) => {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const setFieldError = (field: keyof T, message: string, type: string = 'validation') => {
    setErrors(prev => ({
      ...prev,
      fieldErrors: {
        ...prev.fieldErrors,
        [field as string]: [{ message, type }]
      }
    }));
  };

  const setNonFieldError = (message: string, type: string = 'generic') => {
    setErrors(prev => ({
      ...prev,
      nonFieldErrors: [...(prev.nonFieldErrors || []), { message, type }]
    }));
  };

  const clearErrors = (field?: keyof T) => {
    if (field) {
      setErrors(prev => {
        const { [field as string]: _, ...rest } = prev.fieldErrors || {};
        return { ...prev, fieldErrors: rest };
      });
    } else {
      setErrors({});
    }
  };

  const getFieldErrors = (field: keyof T): FormError[] => {
    return errors.fieldErrors?.[field as string] || [];
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    handleChange,
    setFieldError,
    setNonFieldError,
    clearErrors,
    getFieldErrors
  };
};