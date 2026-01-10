'use client';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { match } from 'ts-pattern';
import Link from 'next/link';
import FormWrapper, { DataInfo } from '@/components/FormWrapper';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { createClientSchema } from '@infrastructure/types/user';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = createClientSchema.pick({ email: true, passwordHash: true })
type Login = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const form = useForm<Login>({
    resolver: zodResolver(loginSchema),
  })
  const handleSubmit = async (values: Login) => {
    const res = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.passwordHash,
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
  const data: DataInfo<Login> = { email: { label: "Email", type: "email" }, passwordHash: { label: "Mot de passe", type: "password" } }

  return (
    <>
      <Link href="/">ACCUEIL</Link>
      <FormWrapper<Login>
        title="Se connecter"
        form={form}
        data={data}
        onSubmit={handleSubmit}
        labelButton="Connexion"
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

    </>
  );
}
