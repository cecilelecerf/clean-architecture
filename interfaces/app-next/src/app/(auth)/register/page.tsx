'use client';
import { useState } from 'react';
import FormWrapper from '../../../components/FromWrapper';
import { useMutation } from '@tanstack/react-query';
import { post } from '@/lib/apiClient';
import { RegisterPayload } from '@/app/api/auth/register/route';
import { toast } from 'sonner';
import { endpoints } from '@/utils/endpoint';


export default function RegisterPage() {
    const [register, setRegister] = useState<RegisterPayload>({
        email: '',
        firstname: '',
        lastname: '',
        plainedPassword: '',
    });
    const mutate = useMutation(endpoints.auth.register())
    return (
        <form onSubmit={(e) => { e.preventDefault(); mutate.mutate(register, { onSuccess: () => toast.success("Email envoyé") }) }}>
            <FormWrapper
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
