"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";

export default function ConfirmEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const mutation = useMutation(endpoints.auth.confirmEmail())
    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            return;
        }

        if (mutation.isPending || mutation.isSuccess || mutation.isError) {
            return;
        }

        mutation.mutate({ token }, ({
            onSuccess: () => {
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            }
        }))

    }, [searchParams, mutation, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        {match(mutation)
                            .with(({ status: "success" }), () => <CheckCircle2 className="h-16 w-16 text-green-500" />)
                            .with(({ status: "error" }), () => <XCircle className="h-16 w-16 text-destructive" />)
                            .otherwise(() => <Loader2 className="h-16 w-16 animate-spin text-primary" />)}
                    </div>

                    <CardTitle className="text-2xl">
                        {match(mutation)
                            .with(({ status: "success" }), () => "Email confirmé !")
                            .with(({ status: "error" }), () => "Erreur de confirmation")
                            .otherwise(() => "Confirmation en cours...")}
                    </CardTitle>

                    <CardDescription className="text-base mt-2">
                        {match(mutation)
                            .with(({ status: "success" }), () => "Votre email a été confirmé avec succès !")
                            .with(({ status: "error" }), () => "Une erreur est survenue")
                            .otherwise(() => "Confirmation en cours...")}
                    </CardDescription>
                </CardHeader>

                <CardContent className="text-center">

                    {match(mutation)
                        .with(({ status: "success" }), () =>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Redirection automatique vers la page de connexion dans quelques secondes...
                                </p>
                                <Button
                                    onClick={() => router.push("/login")}
                                    className="w-full"
                                >
                                    Se connecter maintenant
                                </Button>
                            </div>)
                        .with(({ status: "error" }), () =>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Le lien de confirmation est peut-être expiré ou invalide.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={() => router.push("/register")}
                                        className="w-full"
                                    >
                                        Créer un nouveau compte
                                    </Button>
                                    <Button
                                        onClick={() => router.push("/login")}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Retour à la connexion
                                    </Button>
                                </div>
                            </div>)
                        .otherwise(() =>
                            <p className="text-sm text-muted-foreground">
                                Veuillez patienter pendant que nous vérifions votre email...
                            </p>)}
                </CardContent>
            </Card>
        </div>
    );
}