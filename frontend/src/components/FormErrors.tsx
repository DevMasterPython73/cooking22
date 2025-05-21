import React from 'react';

interface FormError {
  message: string;
  type?: 'validation' | 'required' | 'server' | 'warning' | 'info';
  field?: string;
}

interface FormErrorsProps {
  errors?: {
    fieldErrors?: Record<string, FormError[]>;
    nonFieldErrors?: FormError[];
  };
  fieldName?: string;
  className?: string;
  errorClassName?: string;
  maxErrors?: number;
}

export const FormErrors = ({
  errors,
  fieldName,
  className = 'form-errors',
  errorClassName = 'error-message',
  maxErrors = 5
}: FormErrorsProps) => {
  if (!errors) return null;

  // Получаем соответствующие ошибки
  const getRelevantErrors = (): FormError[] => {
    if (fieldName && errors.fieldErrors?.[fieldName]) {
      return errors.fieldErrors[fieldName];
    }
    if (!fieldName && errors.nonFieldErrors) {
      return errors.nonFieldErrors;
    }
    return [];
  };

  const errorList = getRelevantErrors();

  if (errorList.length === 0) return null;

  // Ограничиваем количество отображаемых ошибок
  const displayedErrors = maxErrors > 0 
    ? errorList.slice(0, maxErrors)
    : errorList;

  return (
    <div className={className} role="alert" aria-live="polite">
      {displayedErrors.map((error, index) => (
        <div 
          key={`${error.field || 'generic'}-${index}`}
          className={`${errorClassName} ${error.type || 'validation'}`}
          data-testid={`error-${error.type || 'generic'}`}
        >
          {error.message}
        </div>
      ))}
      {maxErrors > 0 && errorList.length > maxErrors && (
        <div className={`${errorClassName} info`}>
          +{errorList.length - maxErrors} more errors
        </div>
      )}
    </div>
  );
};

// Пример использования стилей
FormErrors.defaultProps = {
  className: 'form-errors',
  errorClassName: 'error-message'
};