import { Dispatch, SetStateAction } from 'react';


export const verifyCorrectSymbols = (
    //@ts-expect-error Полный кошмар с типами
    dataObject, 
    setError?: Dispatch<SetStateAction<string | null>>
): boolean => {
    const unicodeRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\s.,?!:;@\"#№$%^&*()_=+'`~<>{}[\]|\/-]+$/;
    const noSpacesRegex = /\s+/g;

    for (const [key, value] of Object.entries(dataObject)) {
        if (typeof value !== 'string') {
            if (setError) setError(`Используйте только текст`);
            return false;
        }
        if (value.trim().length === 0) {
            if (setError) setError(`Кажется, вы ничего не написали`);
            return false;
        }
        if (!unicodeRegex.test(value)) {
            if (setError) setError(`Используйте только цифры, буквы, нижние подчёркивания и точки`);
            return false;
        }
        if (key !== 'username' && key !== 'tag' && noSpacesRegex.test(value)) {
            if (setError) setError(`Не используйте пробелы`);
            return false;
        }
        if ((key === 'username' || key === 'tag') && value.trim().length < 4) {
            if (setError) setError(`Не должно быть короче 4 символов`);
            return false;
        }
        if (key === 'password' && value.trim().length < 6) {
            if (setError) setError(`Не должно быть короче 6 символов`);
            return false;
        }
        if ((key === 'username' || key === 'tag') && value.trim().length > 16) {
            if (setError) setError(`Не должно быть длиннее 16 символов`);
            return false;
        }
        if (key === 'password' && value.trim().length > 32) {
            if (setError) setError(`Не должно быть длиннее 32 символов`);
            return false;
        }
    }

    if (setError) setError(null);
    return true;
};
