interface FieldError {
    [key: string]: string[];
}

interface FormErrorsProps {
    errors?: {
        fieldErrors?: FieldError;
        nonFieldErrors?: string[];
    };
}

export const FormErrors = ({ errors }: FormErrorsProps) => {
    if (!errors) return null;

    const { fieldErrors, nonFieldErrors } = errors;

    return (
        <div className="form-error">
            {/* Ошибки для конкретных полей */}
            {fieldErrors && Object.entries(fieldErrors).map(([field, fieldErrorList]) => (
                fieldErrorList.map((error, index) => (
                    <div 
                        key={`${field}-${index}`} 
                        className="alert alert-danger" 
                        role="alert"
                    >
                        {error}
                    </div>
                ))
            ))}

            {/* Общие ошибки формы */}
            {nonFieldErrors && nonFieldErrors.map((error, index) => (
                <div 
                    key={`non-field-${index}`} 
                    className="alert alert-danger" 
                    role="alert"
                >
                    {error}
                </div>
            ))}
        </div>
    );
};
