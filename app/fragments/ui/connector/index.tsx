"use client"
import { notifier } from "@/components/notifier";
import { useEffect } from "react";


export default function ConnectionListener() {
    useEffect(() => {
        const handleOnline = () => {
            notifier.connectionEstablished('Your internet connection has been restored.', 'Network Restored', undefined)
        };

        const handleOffline = () => {
            notifier.connectionDropped(`Reconnect to the internet and try again.`, "Connection Disrupted")
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    return null;
}