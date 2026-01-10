
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");

    const mutation = useMutation(endpoints.auth.forgotPassword());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(email);
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/login">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
                    </div>
                    <CardDescription>
                        Entrez votre adresse email pour recevoir un lien de réinitialisation
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {match(mutation)
                        .with({ isSuccess: true }, () => (
                            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-700 dark:text-green-300">
                                    Si cet email existe dans notre système, vous recevrez un lien de
                                    réinitialisation dans quelques instants. Pensez à vérifier vos spams.
                                </AlertDescription>
                            </Alert>
                        ))
                        .otherwise(() => null)}

                    {mutation.isError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>
                                {mutation.error?.message || "Une erreur est survenue"}
                            </AlertDescription>
                        </Alert>
                    )}

                    {!mutation.isSuccess && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={mutation.isPending}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Envoyer le lien de réinitialisation
                            </Button>
                        </form>
                    )}

                    {mutation.isSuccess && (
                        <div className="space-y-4 mt-4">
                            <Button
                                onClick={() => router.push("/login")}
                                variant="outline"
                                className="w-full"
                            >
                                Retour à la connexion
                            </Button>
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Vous vous souvenez ? </span>
                        <Link
                            href="/login"
                            className="text-primary hover:underline font-medium"
                        >
                            Se connecter
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}