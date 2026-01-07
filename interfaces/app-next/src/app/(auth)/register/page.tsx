'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { User, MapPin, Mail, Calendar, Phone } from 'lucide-react';
import { RegisterPayload } from '@/app/api/auth/register/route';
import { endpoints } from '@/utils/endpoint';
import FormWrapper, { Section } from '@/components/erfer';
import { useForm } from 'react-hook-form';
import { CreateClientPayload, createClientSchema } from '@infrastructure/types/user';
import { zodResolver } from '@hookform/resolvers/zod';

export default function RegisterPage() {

    const mutation = useMutation(endpoints.auth.register());
    const form = useForm<CreateClientPayload>({
        resolver: zodResolver(createClientSchema),
    })
    const handleSubmit = (values: CreateClientPayload) => {
        mutation.mutate({ ...values, dateOfBirth: new Date(values.dateOfBirth).toISOString() }, {
            onSuccess: () => toast.success('Email envoyé'),
            onError: () => toast.error('Erreur lors de l’inscription')
        });
    };

    const personalSection: Section<CreateClientPayload> = {
        title: 'Informations personnelles',
        description: 'Renseignez vos informations de base pour créer votre compte',
        icon: User,
        data: {
            firstname: {
                label: 'Prénom',
                withIcon: true,
                type: "text"
            },
            lastname: {
                label: 'Nom',
                withIcon: true,
                type: "text"
            },
            sexe: {
                label: 'Sexe',
                type: "radio",
                options: [
                    { label: 'Fille', value: 'girl' },
                    { label: 'Garçon', value: 'boy' },
                    { label: 'Autre', value: 'other' }
                ],
            },
            phoneNumber: {
                label: 'Téléphone',
                withIcon: true,
                type: "phone"
            },
            dateOfBirth: {
                label: 'Date de naissance',
                type: 'date',
                withIcon: true
            }
        }
    }


    const addressSection: Section<CreateClientPayload> = {
        title: 'Adresse',
        description: 'Indiquez votre adresse complète',
        icon: MapPin,
        data: {
            "address": { label: 'Adresse', type: 'text', notRequired: false },
            "city": { label: 'Ville', type: 'text', notRequired: false },
            "country": { label: 'Pays', type: 'text', notRequired: false },
            "postalCode": { label: 'Code postal', type: 'text', notRequired: false },
        },
    };
    const accountSection: Section<CreateClientPayload> = {
        title: 'Connexion',
        description: 'Créez vos identifiants pour accéder à votre compte',
        icon: Mail,
        data: {
            email: { label: 'Email', type: 'email', withIcon: true },
            passwordHash: { label: 'Mot de passe', type: 'password', withIcon: true },
            confirmPassword: { label: 'Confirmation mot de passe', type: 'password', withIcon: true },
        },
    };

    return (
        <FormWrapper<CreateClientPayload>
            title="S'inscrire"
            form={form}
            data={[personalSection, addressSection, accountSection]}
            labelButton="S'inscrire"
            loading={mutation.isPending}
            onSubmit={handleSubmit}
            showBackButton
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
