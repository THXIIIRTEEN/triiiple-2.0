"use client";

import { verifyCorrectSymbols } from '@/utils/textValidation';
import { AuthorizationInputProps } from '@/types/registration';
import React, { useState, ChangeEvent } from 'react';
import styles from './styles/authorization-input.module.scss'

const AuthorizationInput: React.FC<AuthorizationInputProps> = ({
    name,
    placeholder,
    type,
    minLength,
    maxLength,
    value,
    autoComplete,
    serverError,
    setFormValues,
    onFocus,
    setServerError
}) => {

    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        if (serverError && setServerError) {
            setServerError(null)
        }

        if (name === 'tag') {
            setFormValues(prevValues => ({
                ...prevValues,
                ['tag']: value.toLocaleLowerCase()
            }))
        }

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
                onFocus={onFocus}
                className={`${styles.authorizationInput}`}
            />
            {error && <p className="error">{error}</p>}
            {serverErrorMessage && <p className="error">{serverErrorMessage}</p>}
        </>
    );
}

export default AuthorizationInput;
