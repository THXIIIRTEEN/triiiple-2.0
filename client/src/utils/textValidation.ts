import { Dispatch, SetStateAction } from 'react';

export const verifyCorrectSymbols = (dataObject: object, setError?: Dispatch<SetStateAction<string | null>>): boolean => {
    const unicodeRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\s.,?!:;-@"#№$%^&*()_=+'`~<>{}[]|\/]+$/;
    const regex = /\s+/g;

    Object.entries(dataObject).forEach(([key, value]) => {
        if (typeof value !== 'string') {
            setError!(`Используйте только текст`);
        }
        else if (value.trim().length <= 0 ) {
            setError!(`Кажется вы ничего не написали`);
        }
        else if (unicodeRegex.test(value) === false) {
            setError!(`Используйте только цифры, буквы, нижние подчёркивания и точки`);
        }
        else if (key != 'username' && regex.test(value)) {
            setError!(`Не используйте пробелы`);
        }
        else if ((key === 'username' || key === 'tag') && value.trim().length < 4 ) {
            setError!(`Не должно быть короче 4 символов`);
        }
        else if ((key === 'password') && value.trim().length < 6 ) {
            setError!(`Не должно быть короче 6 символов`); 
        }
        else if ((key === 'username' || key === 'tag') && value.trim().length > 16 ) {
            setError!(`Не должно быть длиннее 16 символов`); 
        }
        else if ((key === 'password') && value.trim().length > 32 ) {
            setError!(`Не должно быть длиннее 32 символов`); 
        }
        else {
            if (setError) setError!(null);
        }
    });
    return true
}