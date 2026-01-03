"use client"

import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuLinkProps {
    icon: LucideIcon;
    label: string;
    href: string;
}

export const MenuLink = ({ icon: Icon, label, href }: MenuLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href;

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
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{label}</span>
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