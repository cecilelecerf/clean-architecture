'use client';
import { useState } from 'react';
import AuthForm from '../AuthFromWrapper';
import { useMutation } from '@tanstack/react-query';
import { RegisterPayload, RegisterResponse } from '@/app/api/auth/register/route';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
    const [register, setRegister] = useState<RegisterPayload>({
        email: '',
        firstname: '',
        lastname: '',
        plainedPassword: '',
    });
    const mutate = useMutation<RegisterResponse, Error, RegisterPayload>({
        mutationFn: async () => {
            const res = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(register),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Erreur lors de l’envoi du mail');
            return data;
        },
    });
    return (
        <form onSubmit={() => mutate.mutate(register)}>
            <AuthForm
                title="S'inscrire"
                fields={[
                    {
                        get: register.email,
                        set: (e) => setRegister((prev) => ({ ...prev, [register.email]: e })),
                        label: 'Email',
                        type: 'email',
                    },
                    {
                        get: register.firstname,
                        set: (e) => setRegister((prev) => ({ ...prev, [register.firstname]: e })),
                        label: 'Prénom',
                    },
                    {
                        get: register.lastname,
                        set: (e) => setRegister((prev) => ({ ...prev, [register.lastname]: e })),
                        label: 'Nom',
                    },
                    {
                        get: register.plainedPassword,
                        set: (e) => setRegister((prev) => ({ ...prev, [register.plainedPassword]: e })),
                        label: 'Mot de passe',
                        type: 'password',
                    },
                ]}
                button="Connexion"
                loading={mutate.isPending}
            />
        </form>
    );
}
