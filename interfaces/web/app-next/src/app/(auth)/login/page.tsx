'use client';
import { useMutation } from '@tanstack/react-query';
import AuthForm from '../AuthFromWrapper';
import { useState } from 'react';
import { post } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  // const mutate = useMutation<LoginResponse, Error, LoginPayload>({
  //   mutationFn: (data: LoginPayload) => post<LoginResponse, LoginPayload>("/auth/login", data),
  //   onSuccess: () => { router.push("/accounts") }
  // })
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.ok) {
      router.push('/accounts'); // redirection après login
    } else {
      console.error('Erreur de connexion', res?.error);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <AuthForm
        title="Se connecter"
        fields={[
          { get: email, set: (e) => setEmail(e), label: 'Email', type: 'email' },
          { get: password, set: (e) => setPassword(e), label: 'Mot de passe', type: 'password' },
        ]}
        button="Connexion"
        loading={false}
      // loading={mutate.isPending} 
      />
    </form>
  );
}
