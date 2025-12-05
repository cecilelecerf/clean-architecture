import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { MenuLink } from './MenuLink';
import { SignOutButton } from '@/components/SignOutButton';
import { CircleX, Home, Menu, MessageSquare } from 'lucide-react';

const menuItems = [
    { icon: <Home size={18} />, label: "Account", href: "/accounts" },
    { icon: <MessageSquare size={18} />, label: "Conversations", href: "/threads" },
    { icon: <MessageSquare size={18} />, label: "Actualités", href: "/feeds" },
];

export const MenuDrawer = () => (
    <Drawer direction="right">
        <DrawerTrigger asChild>
            <Button variant="outline" >
                <Menu className="h-5 w-5 text-muted-foreground" />
            </Button>
        </DrawerTrigger>
        <DrawerContent>
            <DrawerHeader className="flex justify-between flex-row">
                <div>
                    <DrawerTitle>A.V.E.N.I.R</DrawerTitle>
                    <DrawerDescription>Menu</DrawerDescription>
                </div>
                <DrawerClose>
                    <CircleX />
                </DrawerClose>
            </DrawerHeader>
            <Separator />
            <div className="flex flex-col items-start">
                {menuItems.map((item, i) => <MenuLink {...item} key={i} />)}
            </div>
            <DrawerFooter>
                <SignOutButton />
            </DrawerFooter>
        </DrawerContent>
    </Drawer>
)