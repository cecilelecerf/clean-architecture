"use client";
import { SignOutButton } from "@/components/SignOutButton";
import { Button } from "@/components/ui/button";
import { Flex } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter()
  const handleSubmit = async (e: React.FormEvent, email: string, password: string) => {
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
      .with('client', () => router.push('/threads'))
      .with('conseiller', () => router.push('/admin'))
      .with('directeur', () => router.push('/director'))
      .otherwise(() => router.push('/unauthorized'));

  };
  return (
    <div >
      <h1>Bonjour {session && session && (
        session.user.name
      )}</h1>

      {session ? <>
        <div>
          Accéder à l'espace
          <Flex justify="center" gap="6">
            <Button onClick={() => router.push("/threads")}>Client</Button>
            <Button onClick={() => router.push("/admin")}>Conseiller</Button>
            <Button onClick={() => router.push("/director")}>Directeur</Button>
          </Flex>
        </div>
        <SignOutButton />
      </> : <>

        <div>
          Se connecter à l'espace
          <Flex justify="center" gap="6">
            <Button onClick={(e) => handleSubmit(e, "client@example.com", "password123")}>Client</Button>
            <Button onClick={(e) => handleSubmit(e, "advisors@example.com", "password123")}>Conseiller</Button>
            <Button onClick={(e) => handleSubmit(e, "director@example.com", "password123")}>Directeur</Button>
          </Flex>
        </div></>}
    </div>
  );
}
