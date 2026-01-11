"use client"
import { signOut } from "next-auth/react";
import { Button, buttonVariants } from "./ui/button";
import { VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";

type Props = {} & React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants>

export const SignOutButton = ({ ...button }: Props) => {
    const t = useTranslations("director.menu")
    return <Button onClick={() => signOut({ callbackUrl: '/' })} {...button}><LogOut className="mr-2 h-4 w-4" />{t("logout")}</Button>
}
