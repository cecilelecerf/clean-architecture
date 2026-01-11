"use client"

import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { MenuLink } from './MenuLink';
import { SignOutButton } from '@/components/SignOutButton';
import { CircleX, Home, Menu, MessageSquare, CreditCard, ClockFading, Newspaper, User } from 'lucide-react';
import { LangageSwitcher } from '@/components/LangageSwitcher';
import { Flex } from '@radix-ui/themes';
import { ThemeToggleSwitch } from '@/components/ThemeToogleButton';
import { ReactNode } from "react";

const menuItems: { icon: ReactNode, labelKey: string, href: string, basePath?: string }[] = [
    { icon: <Home size={18} />, labelKey: "accounts", href: "/accounts", basePath: "/accounts" },
    { icon: <MessageSquare size={18} />, labelKey: "messaging", href: "/threads", basePath: "/threads" },
    { icon: <Newspaper size={18} />, labelKey: "news", href: "/feeds", basePath: "/feeds" },
    { icon: <ClockFading size={18} />, labelKey: "loan", href: "/credits", basePath: "/credits" },
    { icon: <CreditCard size={18} />, labelKey: "stocks", href: "/actions", basePath: "/actions" },
    { icon: <User size={18} />, labelKey: "profile", href: "/profil", basePath: "/profil" }
];

export const MenuDrawer = () => (
    <Drawer direction="right">
        <DrawerTrigger asChild>
            <Button
                variant="outline"
                size="icon"
                aria-label="Ouvrir le menu"
            >
                <Menu className="h-5 w-5" />
            </Button>
        </DrawerTrigger>
        <DrawerContent className="h-full w-[300px] sm:w-[350px]">
            <DrawerHeader className="flex justify-between items-start flex-row">
                <div className="space-y-1">
                    <DrawerTitle className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        A.V.E.N.I.R
                    </DrawerTitle>
                    <DrawerDescription className="text-sm">
                        Menu principal
                    </DrawerDescription>
                    <Flex className='gap-8'>
                        <LangageSwitcher />
                        <ThemeToggleSwitch />
                    </Flex>

                </div>
                <DrawerClose asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        aria-label="Fermer le menu"
                    >
                        <CircleX className="h-5 w-5" />
                    </Button>
                </DrawerClose>
            </DrawerHeader>

            <Separator className="my-2" />

            <nav className="flex-1 overflow-y-auto px-4 py-2" aria-label="Menu principal">
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <li key={item.href}>
                            <MenuLink {...item} />
                        </li>
                    ))}
                </ul>
            </nav>

            <Separator className="my-2" />

            <DrawerFooter className="pt-4">
                <SignOutButton />
            </DrawerFooter>
        </DrawerContent>
    </Drawer>
);