"use client";

import { LogOutIcon, Menu } from "lucide-react";
import { usePathname } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { Separator } from "@/components/ui/separator";
import { menuItems, menuItemsClients } from "./menu-item";
import { signOut } from "next-auth/react";
import { LangageSwitcher } from "@/components/LangageSwitcher";
import { ThemeToggleSwitch } from "@/components/ThemeToogleButton";

type Props = {
  children: React.ReactNode;
};

export function AdvisorLayoutClient({ children }: Props) {
  const pathname = usePathname();
  const t = useTranslations("advisor.menu");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex-col justify-between">
        <SidebarContent pathname={pathname} t={t} />
      </aside>

      <div className="md:hidden fixed z-50 bg-linear-to-b from-gray-50 via-gray-50/90 to-gray-50/10 p-4 w-full">
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="bg-gray-900 text-white hover:bg-gray-800">
                <Menu />
              </Button>
              <p className="font-bold text-2xl">Banque</p>
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-gray-900 text-white w-64">
            <SidebarContent pathname={pathname} t={t} />
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
}: {
  pathname: string;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="p-6 flex flex-col justify-between h-full">
      <div className="space-y-6">
        <Link href="/admin">
          <h1 className="text-xl font-bold">{t("title")}</h1>
        </Link>

        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            {t("section.general")}
          </h2>
          <div className="flex justify-between">
            <LangageSwitcher />
            <ThemeToggleSwitch />
          </div>

          <nav className="space-y-1">
            {menuItems.map((item, i) => (
              <MenuLink
                key={`${item.href}-${i}`}
                icon={item.icon}
                label={t(item.labelKey)}
                href={item.href}
                active={
                  pathname === item.href ||
                  (pathname.startsWith(item.href + "/") && i !== 0)
                }
              />
            ))}
          </nav>
        </div>

        <Separator className="bg-gray-700" />

        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            {t("section.relation")}
          </h2>
          <nav className="space-y-1">
            {menuItemsClients.map((item, i) => (
              <MenuLink
                key={`${item.href}-${i}`}
                icon={item.icon}
                label={t(item.labelKey)}
                href={item.href}
                active={
                  pathname === item.href ||
                  (pathname.startsWith(item.href + "/") && i !== 0)
                }
              />
            ))}
          </nav>
        </div>

      </div>

      <Button
        variant="ghost"
        className="flex items-center gap-3 w-full justify-start px-3 py-2 rounded-md transition bg-gray-800 hover:bg-gray-700 text-white"
        onClick={() => signOut({ callbackUrl: '/' })}
      >
        <LogOutIcon size={18} />
        <span>{t("logout")}</span>
      </Button>
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
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      // @ts-expect-error -- href peut contenir des routes dynamiques avec query params
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${active
        ? "bg-gray-800 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}