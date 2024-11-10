"use client";

import { verifyCorrectSymbols } from '@/utils/textValidation';
import { AuthorizationInputProps } from '@/types/registration';
import React, { useState, ChangeEvent } from 'react';

const AuthorizationInput: React.FC<AuthorizationInputProps> = ({
    name,
    placeholder,
    type,
    minLength,
    maxLength,
    value,
    autoComplete,
    serverError,
    setFormValues
}) => {

    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        verifyCorrectSymbols({ [name]: value }, setError);

        setFormValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    }

    const getErrorMessage = () => {
        if (typeof serverError === 'string') {
            return serverError;
        } else if (Array.isArray(serverError?.errors)) {
            const fieldError = serverError.errors.find(err => err.name === name);
            return fieldError ? fieldError.message : null;
        }
        return null;
    }

    const serverErrorMessage = getErrorMessage();

    return (
        <>
            <input
                name={name}
                placeholder={placeholder}
                type={type}
                minLength={minLength}
                maxLength={maxLength}
                value={value}
                autoComplete={autoComplete}
                onChange={handleInputChange}
            />
            {error && <p className="error">{error}</p>}
            {serverErrorMessage && <p className="error">{serverErrorMessage}</p>}
        </>
    );
}

export default AuthorizationInput;
