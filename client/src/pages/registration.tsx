"use client"

import axios from 'axios';
import React, { useState, FormEvent } from 'react';
import AuthorizationInput from '@/components/AuthorizationInput';
import { verifyCorrectSymbols } from '@/utils/textValidation';
import { ServerError, UserData } from '@/types/registration';
import HCaptchaComponent from "@/components/HCaptchaComponent";
import { handleVerifyCaptcha } from "@/utils/captcha";
import { useRouter } from 'next/router';

const RegistrationPage: React.FC = () => {

  const [formValues, setFormValues] = useState<UserData>({
    username: '',
    tag: '',
    email: '',
    password: ''
  });

  const [ serverError, setServerError ] = useState<ServerError | string | null>(null);
  const [ showCaptcha, setShowCaptcha ] = useState<boolean>(false);

  const router = useRouter()

  const clearInputs = () => {
    setFormValues({
      username: '',
      tag: '',
      email: '',
      password: ''
    })
  };

  const convertData = (dataObject: UserData): UserData => {
    const regex = /\s+/g;

    const convertedData: UserData = { ...dataObject };

    Object.entries(convertedData).forEach(([key, value]) => {
      if (regex.test(value)) {
        convertedData[key as keyof UserData] = value.replace(regex, '_');
      }
      if (key === 'tag') {
        convertedData[key as keyof UserData] = '@' + (convertedData[key as keyof UserData] || '').toLowerCase();
      }
    });

    return convertedData;
  };

  const handlePostUserData = async ( event: FormEvent<HTMLFormElement> ) => {
    event.preventDefault();
    setShowCaptcha(true)
  }

  const onCaptchaVerified = async (token: string) => {
    const isCaptchaVerified = await handleVerifyCaptcha(token, setServerError);

    if (verifyCorrectSymbols(formValues) && isCaptchaVerified) {
      clearInputs();
      const convertedUserData = convertData(formValues);

      try {
        const response = await axios.post(`${process.env.API_URI!}/users/registration`, convertedUserData);
        if (response.status === 200) {
          router.push('/login')
        }
      }
      catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                setServerError(error.response.data)
            } 
        } 
      }
    }
  }
  
  return (
    <div>
      <form method="post" autoComplete='off' onSubmit={(event) => handlePostUserData(event)}>
        <AuthorizationInput name='username' placeholder='Отображаемое имя' type='text' minLength={4} maxLength={16} value={formValues.username || ''} autoComplete='new-password' setFormValues={setFormValues} />
        <AuthorizationInput name='tag' placeholder='Имя пользователя' type='text' minLength={4} maxLength={16} value={formValues.tag || ''} autoComplete='new-password' serverError={serverError} setFormValues={setFormValues} />
        <AuthorizationInput name='email' placeholder='Почта' type='text' value={formValues.email} autoComplete='new-password' serverError={serverError} setFormValues={setFormValues}/>
        <AuthorizationInput name='password' placeholder='Пароль' type='password' minLength={6} maxLength={32} value={formValues.password} autoComplete='new-password' setFormValues={setFormValues}/>
        <button type="submit">Отправить</button>
      </form>
      {showCaptcha && (
        <HCaptchaComponent onVerify={onCaptchaVerified} />
      )}
    </div>
  );
}

export default RegistrationPage;