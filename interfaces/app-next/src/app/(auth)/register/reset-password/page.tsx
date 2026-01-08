"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const mutation = useMutation(endpoints.auth.resetPassword());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return;
        }

        if (!token) {
            return;
        }

        mutation.mutate({ token, password }, {
            onSuccess: () => {
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            },
        });
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Lien invalide</CardTitle>
                        <CardDescription>
                            Le lien de réinitialisation est manquant ou invalide.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push("/forgot-password")} className="w-full">
                            Demander un nouveau lien
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {match(mutation)
                            .with({ isSuccess: true }, () => "Mot de passe réinitialisé !")
                            .otherwise(() => "Nouveau mot de passe")}
                    </CardTitle>
                    <CardDescription>
                        {match(mutation)
                            .with({ isSuccess: true }, () => "Votre mot de passe a été modifié avec succès")
                            .otherwise(() => "Choisissez un nouveau mot de passe sécurisé")}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {match(mutation)
                        .with({ isSuccess: true }, () => (
                            <div className="space-y-4">
                                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-700 dark:text-green-300">
                                        Redirection automatique vers la page de connexion...
                                    </AlertDescription>
                                </Alert>
                                <Button
                                    onClick={() => router.push("/login")}
                                    className="w-full"
                                >
                                    Se connecter maintenant
                                </Button>
                            </div>
                        ))
                        .otherwise(() => (
                            <>
                                {mutation.isError && (
                                    <Alert variant="destructive" className="mb-4">
                                        <AlertDescription>
                                            {mutation.error?.message || "Une erreur est survenue"}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Nouveau mot de passe</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 pr-10"
                                                required
                                                minLength={8}
                                                disabled={mutation.isPending}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Minimum 8 caractères
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">
                                            Confirmer le mot de passe
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="pl-10 pr-10"
                                                required
                                                minLength={8}
                                                disabled={mutation.isPending}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {password !== confirmPassword && confirmPassword && (
                                        <p className="text-sm text-destructive">
                                            Les mots de passe ne correspondent pas
                                        </p>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={
                                            mutation.isPending ||
                                            password !== confirmPassword ||
                                            password.length < 8
                                        }
                                    >
                                        {mutation.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Réinitialiser le mot de passe
                                    </Button>
                                </form>
                            </>
                        ))}
                </CardContent>
            </Card>
        </div>
    );
}