import { useEffect } from 'react';
import { useSocketListenersStore } from './store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSocketEvent = (event: string, handler: (data: any) => void) => {
    const addListener = useSocketListenersStore((s) => s.addListener);
    const removeListener = useSocketListenersStore((s) => s.removeListener);

    useEffect(() => {
        addListener(event, handler);
        return () => removeListener(event, handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event, handler]);
};
