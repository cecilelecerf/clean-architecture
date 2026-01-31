"use client"

import { useEffect } from 'react';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
                console.log('🔔 Notification permission:', permission);
            });
        }
    }, []);

    return <>{children}</>;
}