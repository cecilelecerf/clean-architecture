"use client"
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const MenuLink = ({
    icon,
    label,
    href,
}: {
    icon: React.ReactNode;
    label: string;
    href: string;
}) => {
    const pathname = usePathname();

    const isActive = pathname === href
    return <Button variant="link" asChild className={clsx('active:translate-y-0.5  w-full justify-start rounded-none transition-all', isActive && "bg-gray-100")}>
        <Link href={href}>{label}</Link>
    </Button>
}