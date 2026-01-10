"use client";

import { LogOutIcon, Menu } from "lucide-react";
import { usePathname } from "@/lib/i18n/navigation";
import { signOut } from "next-auth/react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { menuItems } from "./menu-item";
import { Link } from "@/lib/i18n/navigation";
import { LangageSwitcher } from "@/components/LangageSwitcher";
import { useTranslations, useLocale } from "next-intl";
import { Pathname } from "@/lib/i18n/routing";
import { useSearchParams } from "next/navigation";

type Props = {
    children: React.ReactNode;
};

export function DirectorLayoutClient({ children }: Props) {
    const pathname = usePathname();
    const t = useTranslations("director.menu");
    const currentLocale = useLocale();
    return (
        <div className="flex min-h-screen">
            <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-pink-950 text-white flex-col justify-between">
                <SidebarContent pathname={pathname} t={t} locale={currentLocale} />
            </aside>

            <div className="md:hidden fixed z-50  p-4 w-full">
                <Sheet>
                    <SheetTrigger asChild>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="bg-pink-950 text-white hover:bg-pink-800"
                                aria-label={t("title")}
                            >
                                <Menu />
                            </Button>
                            <p className="font-bold text-2xl">Banque</p>
                        </div>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="p-0 bg-pink-950 text-white w-64"
                    >
                        <SidebarContent pathname={pathname} t={t} locale={currentLocale} />
                    </SheetContent>
                </Sheet>
            </div>

            <main className="flex-1 px-4 pt-20 md:pt-6 py-6 md:px-12 md:ml-64">
                {children}
            </main>
        </div>
    );
}

function SidebarContent({
    pathname,
    t,
    locale,
}: {
    pathname: string;
    t: ReturnType<typeof useTranslations>;
    locale: string;
}) {
    const searchParams = useSearchParams();

    return (
        <div className="p-6 flex flex-col justify-between h-full">
            <div className="space-y-6">
                <Link href="/director">
                    <h1 className="text-xl font-bold hover:text-pink-200 transition">
                        {t("title")}
                    </h1>
                </Link>

                <div className="border-t border-pink-800 pt-4">
                    <LangageSwitcher />
                </div>

                <div>
                    <h2 className="text-xs font-semibold text-pink-300 uppercase tracking-wider mb-3 px-3">
                        {t("section.general")}
                    </h2>

                    <nav className="space-y-1">
                        {menuItems.map((item, i) => {
                            console.log(item.href, i);
                            const itemBasePath = item.basePath || item.href.split('?')[0];
                            const itemQueryParams = new URLSearchParams(item.href.split('?')[1] || '');

                            const pathMatches = i !== 0 ? pathname.includes(itemBasePath) : pathname === "/director";

                            const queryMatches = itemQueryParams.size === 0 ||
                                Array.from(itemQueryParams.entries()).every(
                                    ([key, value]) => searchParams.get(key) === value
                                );

                            const isActive = pathMatches && queryMatches;
                            return (
                                <MenuLink
                                    key={`${item.href}-${i}`}
                                    icon={item.icon}
                                    label={t(item.labelKey)}
                                    href={item.href as any}
                                    active={isActive}
                                />
                            );
                        })}
                    </nav>
                </div>
            </div>

            <button
                className="flex items-center gap-3 px-3 py-2 rounded-md transition bg-pink-900 hover:bg-pink-800 text-white cursor-pointer w-full"
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
                aria-label={t("logout")}
            >
                <LogOutIcon className="h-5 w-5" />
                <span>{t("logout")}</span>
            </button>
        </div>
    );
}

function MenuLink({
    icon,
    label,
    href,
    active = false,
}: {
    icon: React.ReactNode;
    label: string;
    href: Pathname;
    active?: boolean;
}) {
    return (
        <Link
            href={href as any}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${active
                ? "bg-pink-900 text-pink-50 font-medium"
                : "text-pink-100 hover:bg-pink-900/50 hover:text-white"
                }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}