"use client"

import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import clsx from "clsx";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";

interface MenuLinkProps {
    icon: ReactNode;
    labelKey: string;
    href: string;
    basePath?: string 
}

export const MenuLink = ({ icon, labelKey, href, basePath }: MenuLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    const t = useTranslations("client.menu");

    return (
        <DrawerClose asChild>
            <Button
                variant="ghost"
                asChild
                className={clsx(
                    'w-full justify-start gap-3 h-11 px-3',
                    'transition-all duration-200',
                    'hover:bg-accent hover:text-accent-foreground',
                    'active:scale-[0.98]',
                    isActive && 'bg-accent text-accent-foreground font-medium'
                )}
            >
                <Link href={href}>
                    {icon}
                    <span className="truncate">{t(labelKey)}</span>
                    {isActive && (
                        <span
                            className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                            aria-hidden="true"
                        />
                    )}
                </Link>
            </Button>
        </DrawerClose>
    );
};