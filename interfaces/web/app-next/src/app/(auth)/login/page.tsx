'use client';
import FormWrapper from '../../../components/FromWrapper';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { match } from 'ts-pattern';

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
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
      .with('client', () => router.push('/accounts'))
      .with('conseiller', () => router.push('/admin'))
      .with('directeur', () => router.push('/admin'))
      .otherwise(() => router.push('/unauthorized'));

  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <FormWrapper
        title="Se connecter"
        fields={[
          { get: email, set: (e) => setEmail(e), label: 'Email', type: 'email' },
          { get: password, set: (e) => setPassword(e), label: 'Mot de passe', type: 'password' },
        ]}
        button="Connexion"
        loading={false}
      />
    </form>
  );
}
