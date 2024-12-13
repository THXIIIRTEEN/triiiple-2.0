import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";
import { IUser } from '@/types/user';

export const saveToken = (token: string) => {
    Cookies.set('token', token, { expires: 30, secure: window.location.protocol === 'https:', sameSite: 'strict' });
};

export const getToken = () => {
    return Cookies.get('token'); 
};

export const removeToken = () => {
    Cookies.remove('token');
};

export const getUserFromCookies = () => {
    const token = getToken();
    if (token) {
        const decodedUser = jwtDecode<IUser>(token);
        return decodedUser;
    }
    else {
        return null;
    }
};

