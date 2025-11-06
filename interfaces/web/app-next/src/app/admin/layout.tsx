"use client";

import { Home, LogOutIcon, MessageSquare, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import React from 'react';

const menuItems = [
  { icon: <Home size={18} />, label: 'Accueil', href: '/admin' },
  { icon: <Users size={18} />, label: 'Utilisateurs', href: '/admin/users' },
  { icon: <MessageSquare size={18} />, label: 'Conversations clients', href: '/admin/client-threads' },
  { icon: <MessageSquare size={18} />, label: 'Demandes de crédits', href: '/admin/credit-requests' },
  { icon: <MessageSquare size={18} />, label: 'Messageries', href: '/admin/threads' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col justify-between">
        <div className="p-6 flex flex-col justify-between h-full">
          <div className='space-y-6'>
            <h1 className="text-xl font-bold">Conseiller</h1>
            <nav className="space-y-3">
              {menuItems.map((item) => (
                <MenuLink
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={pathname === item.href || pathname.startsWith(item.href + '/')}
                />
              ))}
            </nav>
          </div>
          <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition bg-gray-800 hover:bg-gray-700 text-white`} onClick={() => signOut()}>
            <LogOutIcon />  Déconnexion

          </div>
        </div>
      </aside>
      <main className="px-4 py-6 xl:py-8 md:px-13 xl:px-30 ml-64">
        {children}
      </main>
    </>
  )
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
        ? 'bg-gray-800 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
