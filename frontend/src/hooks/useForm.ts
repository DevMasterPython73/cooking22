import { useState } from 'react';

interface FormErrors {
    fieldErrors?: { [key: string]: string[] };
    nonFieldErrors?: string[];
}

export const useForm = <T extends object>(initialState: T) => {
    const [formData, setFormData] = useState<T>(initialState);
    const [errors, setErrors] = useState<FormErrors>();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const setFieldError = (field: keyof T, error: string) => {
        setErrors(prev => ({
            ...prev,
            fieldErrors: {
                ...prev?.fieldErrors,
                [field]: [error]
            }
        }));
    };

    const setNonFieldError = (error: string) => {
        setErrors(prev => ({
            ...prev,
            nonFieldErrors: [...(prev?.nonFieldErrors || []), error]
        }));
    };

    const clearErrors = () => {
        setErrors(undefined);
    };

    return {
        formData,
        setFormData,
        errors,
        setErrors,
        handleChange,
        setFieldError,
        setNonFieldError,
        clearErrors
    };
};
