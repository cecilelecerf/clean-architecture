import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center px-4">
            <Search className="w-12 h-12 text-gray-500 mb-4" />
            <h1 className="text-3xl font-bold mb-2">Page introuvable</h1>
            <p className="text-gray-600 mb-6">
                Désolé, la page que vous recherchez n’existe pas ou a été déplacée.
            </p>

            <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition"
            >
                <Home size={18} />
                Retour à l’accueil
            </Link>
        </div>
    );
}
