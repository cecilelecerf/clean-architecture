'use client';
import "./globals.css"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        console.error('Erreur attrapée par ErrorPage :', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center px-4">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Une erreur est survenue</h1>
            <p className="text-gray-600 mb-6">
                {error.message || "Quelque chose s'est mal passé."}
            </p>

            <div className="flex gap-3">
                <Button onClick={() => reset()}>Réessayer</Button>
                <Button variant="outline" onClick={() => router.push('/')}>
                    Retour à l’accueil
                </Button>
            </div>
        </div>
    );
}
