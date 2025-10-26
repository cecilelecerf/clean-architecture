"use client"
import { useMutation } from "@tanstack/react-query";
import AuthForm from "../AuthFromWrapper";
import { useState } from "react";


export default function LoginPage() {
    const [email, setEmail] = useState<string>()
    const [password, setPassword] = useState<string>()
    const mutate = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Erreur lors de l’envoi du mail');
            return data;
        },
    });
    return (
        <form onSubmit={() => mutate.mutate()}>
            <AuthForm title="Se connecter"
                fields={[{ get: email, set: (e) => setEmail(e), label: "Email", type: "email" }, { get: password, set: (e) => setPassword(e), label: "Mot de passe", type: "password" }]}
                button="Connexion"
                loading={mutate.isPending}

            />
        </form>
    );
}
