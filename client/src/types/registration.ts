import { Dispatch, SetStateAction } from 'react';

export interface UserData {
    username?: string;
    tag?: string;
    email: string;
    password: string;
}

export interface ServerError {
    errors?: {
        name?: string;
        message?: string;
    }[];
}


export interface AuthorizationInputProps {
    name: string;
    placeholder: string;
    type: string;
    minLength?: number;
    maxLength?: number;
    value: string;
    autoComplete: string;
    serverError?: ServerError | null | string;
    setFormValues: Dispatch<SetStateAction<UserData>>
}