"use client"
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";

export const SignOutButton = () => <Button onClick={() => signOut()}>Déconnexion</Button>
