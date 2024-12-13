const verifyCorrectSymbols = (dataObject: Record<string, string>): boolean => {
    const unicodeRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\s.,?!:;-@"#№$%^&*()_=+'`~<>{}[]|\/]+$/;
    const regex = /\s+/g;

    Object.entries(dataObject).forEach(([key, value]) => {
        if (typeof value !== 'string') {
            throw new Error(`Используйте только текст`);
        } else if (value.trim().length <= 0) {
            throw new Error(`Кажется вы ничего не написали`);
        } else if (unicodeRegex.test(value) === false) {
            throw new Error(`Используйте только цифры, буквы, нижние подчёркивания и точки`);
        } else if (key !== 'username' && regex.test(value)) {
            throw new Error(`Не используйте пробелы`);
        } else if ((key === 'username' || key === 'tag') && value.trim().length < 4) {
            throw new Error(`Не должно быть короче 4 символов`);
        } else if (key === 'password' && value.trim().length < 6) {
            throw new Error(`Не должно быть короче 6 символов`);
        } else if ((key === 'username' || key === 'tag') && value.trim().length > 16) {
            throw new Error(`Не должно быть длиннее 16 символов`);
        } else if (key === 'password' && value.trim().length > 32) {
            throw new Error(`Не должно быть длиннее 32 символов`);
        }
    });

    return true;
};

export { verifyCorrectSymbols };
