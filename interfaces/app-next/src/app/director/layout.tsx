"use client";

import {
  LogOutIcon,
  Menu,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent
} from "@/components/ui/sheet";
import { menuItems } from "./menu-item";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* === Desktop Sidebar === */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-pink-950 text-white flex-col justify-between">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* === Mobile Drawer Menu === */}
      <div className="md:hidden fixed z-50 bg-linear-to-b from-gray-50 via-gray-50/90 to-gray-50/10 p-4 w-full  ">
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="bg-pink-950 text-white hover:bg-pink-800">
                <Menu />
              </Button>
              <p className="font-bold text-2xl">Banque</p>
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-pink-950 text-white w-64">
            <SidebarContent pathname={pathname} />
          </SheetContent>
        </Sheet>
      </div>

      {/* === Main content === */}
      <main className="flex-1 px-4 pt-17 md:pt-6 py-6 md:px-12 md:ml-64">
        {children}
      </main>
    </div>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="p-6 flex flex-col justify-between h-full">
      <div >
        <Link href="/admin" >
          <h1 className="text-xl font-bold">Conseiller</h1>
        </Link>
        <nav className="space-y-1 mt-6">
          {menuItems.map((item, i) => (
            <MenuLink
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={
                pathname === item.href ||
                (pathname.startsWith(item.href + "/") && i !== 0)
              }
            />
          ))}
        </nav>
      </div>

      <div
        className="flex items-center gap-3 px-3 py-2 rounded-md transition bg-pink-900 hover:bg-pink-800 text-white cursor-pointer"
        onClick={() => signOut()}
      >
        <LogOutIcon /> Déconnexion
      </div>
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
    <a
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${active
        ? "bg-pink-900 text-pink-50"
        : "text-pink-50 hover:bg-pink-900/50 hover:text-white"
        }`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
