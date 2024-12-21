import { format, isToday, isYesterday } from 'date-fns';

export const formateDate = (date: Date) => {
    if (isToday(date)) {
        return format(date, 'Сегодня, HH:mm')
    }
    if (isYesterday(date)) {
        return format(date, 'Вчера, HH:mm')
    }
    else {
        return format(date, 'dd.MM.yyyy, HH:mm')
    }
}