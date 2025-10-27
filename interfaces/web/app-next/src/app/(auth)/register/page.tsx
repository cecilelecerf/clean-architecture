'use client';
import { useState } from 'react';
import AuthForm from '../AuthFromWrapper';
import { useMutation } from '@tanstack/react-query';
import { RegisterPayload, RegisterResponse } from '@/app/api/auth/register/route';
import { post } from '@/lib/apiClient';


export default function RegisterPage() {
    const [register, setRegister] = useState<RegisterPayload>({
        email: '',
        firstname: '',
        lastname: '',
        plainedPassword: '',
    });
    const mutate = useMutation<RegisterResponse, Error, RegisterPayload>({
        mutationFn: (data: RegisterPayload) => post<RegisterResponse, RegisterPayload>("/auth/register", data)
    });
    return (
        <form onSubmit={(e) => { e.preventDefault(); mutate.mutate(register) }}>
            <AuthForm
                title="S'inscrire"
                fields={[
                    {
                        get: register.email,
                        set: (e) => setRegister((prev) => ({ ...prev, email: e })),
                        label: 'Email',
                        type: 'email',
                    },
                    {
                        get: register.firstname,
                        set: (e) => setRegister((prev) => ({ ...prev, firstname: e })),
                        label: 'Prénom',
                    },
                    {
                        get: register.lastname,
                        set: (e) => setRegister((prev) => ({ ...prev, lastname: e })),
                        label: 'Nom',
                    },
                    {
                        get: register.plainedPassword,
                        set: (e) => setRegister((prev) => ({ ...prev, plainedPassword: e })),
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
