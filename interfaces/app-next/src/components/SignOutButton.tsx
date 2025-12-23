"use client"
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export const SignOutButton = () => {
    const router = useRouter()
    return <Button onClick={() => { signOut(); router.push("/") }}>Déconnexion</Button>
}
