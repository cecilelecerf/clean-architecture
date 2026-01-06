'use client';
import FormWrapper from '../../../components/FromWrapper';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { match } from 'ts-pattern';
import Link from 'next/link';

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
      .with('directeur', () => router.push('/director'))
      .otherwise(() => router.push('/unauthorized'));

  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <Link href="/">ACCUEIL</Link>
      <FormWrapper
        title="Se connecter"
        fields={[
          { get: email, set: (e) => setEmail(e as string), label: 'Email', type: 'email', withIcon: true, required: true },
          { get: password, set: (e) => setPassword(e as string), label: 'Mot de passe', type: 'password', withIcon: true, required: true },
        ]}
        button="Connexion"
        loading={false}
      >
        <div className="space-y-2 text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-primary hover:underline block"
          >
            Mot de passe oublié ?
          </Link>
          <div>
            <span className="text-muted-foreground">Pas encore de compte ? </span>
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </FormWrapper>

    </form>
  );
}
