import { transliterate } from 'transliteration';
import crypto from 'crypto'

export const generateRandomPassword = (length = 12) => {
    return crypto.randomBytes(length).toString('hex');
}

export const convertTextToTag = (text: string) => {
    let tag = transliterate(text.replace(/\s+/g, '')).toLowerCase();
    return tag;
}
