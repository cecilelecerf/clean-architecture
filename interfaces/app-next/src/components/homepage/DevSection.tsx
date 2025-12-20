"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ChartLine, Users } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { match } from "ts-pattern";
import { useRouter } from "next/navigation";

export const DevSection = () => {
    if (process.env.NODE_ENV !== "development") return
    const router = useRouter()
    const { data: session } = useSession();
    const handleSubmit = async (e: React.FormEvent, email: string, password: string) => {
        e.preventDefault();
        const res = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (!res?.ok) {
            console.error('Erreur de connexion', res?.error);
            return;
        }
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();

        if (!session?.user?.role) {
            console.error('Session invalide ou rôle manquant');
            return;
        }

        match(session.user.role)
            .with('client', () => router.push('/threads'))
            .with('conseiller', () => router.push('/admin'))
            .with('directeur', () => router.push('/director'))
            .otherwise(() => router.push('/unauthorized'));

    };
    return (
        <section className="container mx-auto px-4 py-12 border-t-4 border-yellow-400 bg-yellow-50">
            <div className="max-w-4xl mx-auto">
                <div className=" mb-6">

                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-yellow-500 rounded-full animate-pulse" />
                        <h2 className="text-2xl font-bold text-yellow-900">
                            🔧 Outils de développement
                        </h2>
                    </div>
                    <h3 className="text-xl font-bold text-yellow-900">
                        {session && session.user.email}
                    </h3>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="border-2 border-blue-200 bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                                <Users className="h-5 w-5" />
                                Client
                            </CardTitle>
                            <CardDescription>
                                Accès client avec compte courant et épargne
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={(e) => handleSubmit(e, "client@example.com", "password123")}
                            >
                                Connexion Client
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-200 bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-700">
                                <ChartLine className="h-5 w-5" />
                                Conseiller
                            </CardTitle>
                            <CardDescription>
                                Gestion des clients et communication
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full bg-purple-600 hover:bg-purple-700"
                                onClick={(e) => handleSubmit(e, "advisors@example.com", "password123")}
                            >
                                Connexion Conseiller
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-orange-200 bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-700">
                                <Building2 className="h-5 w-5" />
                                Directeur
                            </CardTitle>
                            <CardDescription>
                                Supervision et gestion globale
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full bg-orange-600 hover:bg-orange-700"
                                onClick={(e) => handleSubmit(e, "director@example.com", "password123")}
                            >
                                Connexion Directeur
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <p className="text-sm text-yellow-900">
                        <strong>Note :</strong> Cette section n'est visible qu'en mode développement.
                        Elle sera automatiquement masquée en production.
                    </p>
                </div>
            </div>
        </section>
    )
}