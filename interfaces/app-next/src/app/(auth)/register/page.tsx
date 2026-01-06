'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { User, MapPin, Mail, Calendar, Phone } from 'lucide-react';
import { RegisterPayload } from '@/app/api/auth/register/route';
import { endpoints } from '@/utils/endpoint';
import FormWrapper, { FormSection } from '@/components/FromWrapper';

export default function RegisterPage() {

    const [register, setRegister] = useState<RegisterPayload>({
        email: '',
        firstname: '',
        lastname: '',
        plainedPassword: '',
        dateOfBirth: new Date().toISOString(),
        address: {
            postalCode: '',
            address: '',
            city: '',
            country: ''
        },
        sexe: '' as "girl" | "boy" | "other",
        phoneNumber: '',
        confirmPlainedPassword: ""
    });

    const mutation = useMutation(endpoints.auth.register());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ ...register, dateOfBirth: new Date(register.dateOfBirth).toISOString() }, {
            onSuccess: () => toast.success('Email envoyé'),
            onError: () => toast.error('Erreur lors de l’inscription')
        });
    };

    const personalSection: FormSection = {
        title: 'Informations personnelles',
        description: 'Renseignez vos informations de base pour créer votre compte',
        icon: User,
        fields: [
            {
                label: 'Prénom',
                get: register.firstname,
                set: (value) => setRegister(prev => ({ ...prev, firstname: value as string })),
                required: true,
                withIcon: true
            },
            {
                label: 'Nom',
                get: register.lastname,
                set: (value) => setRegister(prev => ({ ...prev, lastname: value as string })),
                required: true,
                withIcon: true
            },
            {
                label: 'Sexe',
                type: "radio",
                get: register.sexe,
                set: (value) => setRegister(prev => ({ ...prev, sexe: value as "girl" | "boy" | "other" })),
                options: [
                    { label: 'Fille', value: 'girl' },
                    { label: 'Garçon', value: 'boy' },
                    { label: 'Autre', value: 'other' }
                ],
                required: true
            },
            {
                label: 'Téléphone',
                get: register.phoneNumber,
                set: (value) => setRegister(prev => ({ ...prev, phoneNumber: value as string })),
                required: true,
                withIcon: true,
                type: "tel"
            },
            {
                label: 'Date de naissance',
                type: 'date',
                get: register.dateOfBirth,
                set: (value) => setRegister(prev => ({ ...prev, dateOfBirth: value as string })),
                required: true,
                withIcon: true
            }
        ]
    };

    const addressSection: FormSection = {
        title: 'Adresse',
        description: 'Indiquez votre adresse complète',
        icon: MapPin,
        fields: [
            {
                label: 'Adresse',
                get: register.address.address,
                set: (value) => setRegister(prev => ({ ...prev, address: { ...prev.address, address: value as string } })),
                required: true
            },
            {
                label: 'Ville',
                get: register.address.city,
                set: (value) => setRegister(prev => ({ ...prev, address: { ...prev.address, city: value as string } })),
                required: true
            },
            {
                label: 'Pays',
                get: register.address.country,
                set: (value) => setRegister(prev => ({ ...prev, address: { ...prev.address, country: value as string } })),
                required: true
            },
            {
                label: 'Code postal',
                get: register.address.postalCode,
                set: (value) => setRegister(prev => ({ ...prev, address: { ...prev.address, postalCode: value as string } })),
                required: true
            }
        ]
    };

    const accountSection: FormSection = {
        title: 'Connexion',
        description: 'Créez vos identifiants pour accéder à votre compte',
        icon: Mail,
        fields: [
            {
                label: 'Email',
                type: 'email',
                get: register.email,
                set: (value) => setRegister(prev => ({ ...prev, email: value as string })),
                required: true,
                withIcon: true
            },
            {
                label: 'Mot de passe',
                type: 'password',
                get: register.plainedPassword,
                set: (value) => setRegister(prev => ({ ...prev, plainedPassword: value as string })),
                required: true,
                withIcon: true
            },
            {
                label: 'Confirmation de mot de passe',
                type: 'password',
                get: register.confirmPlainedPassword,
                set: (value) => setRegister(prev => ({ ...prev, confirmPlainedPassword: value as string })),
                required: true,
                withIcon: true
            }
        ]
    };

    return (
        <FormWrapper
            title="S'inscrire"
            sections={[personalSection, addressSection, accountSection]}
            button="S'inscrire"
            loading={mutation.isPending}
            onSubmit={handleSubmit}
        >
            <div className="text-center text-sm pt-4">
                <span className="text-muted-foreground">Déjà un compte ? </span>
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Se connecter
                </Link>
            </div>
        </FormWrapper>
    );
}
