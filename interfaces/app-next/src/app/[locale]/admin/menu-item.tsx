import {
  Home,
  MessageSquare,
  Users,
  CreditCard,
  Inbox,
  Newspaper,
  Wallet,
} from "lucide-react";
import { ReactNode } from "react";

interface MenuItem {
  icon: ReactNode;
  labelKey: string;
  href: string;
  basePath?: string;
}

export const menuItemsClients: MenuItem[] = [
  {
    icon: <Users size={18} />,
    labelKey: "users",
    href: "/admin/users",
    basePath: "/admin/users"
  },
  {
    icon: <MessageSquare size={18} />,
    labelKey: "conversations",
    href: "/admin/client-threads",
    basePath: "/admin/client-threads"
  },
  {
    icon: <Wallet size={18} />,
    labelKey: "account",
    href: "/admin/accounts",
    basePath: "/admin/accounts"
  },
]

export const menuItems: MenuItem[] = [
  {
    icon: <Home size={18} />,
    labelKey: "home",
    href: "/admin",
    basePath: "/admin"
  },
  {
    icon: <Users size={18} />,
    labelKey: "profile",
    href: "/admin/profile",
    basePath: "/admin/profile"
  },
  {
    icon: <Inbox size={18} />,
    labelKey: "messaging",
    href: "/admin/threads",
    basePath: "/admin/threads"
  },
  {
    icon: <Newspaper size={18} />,
    labelKey: "news",
    href: "/admin/feeds",
    basePath: "/admin/feeds"
  },
  {
    icon: <Wallet size={18} />,
    labelKey: "bank",
    href: "/admin/bank-accounts",
    basePath: "/admin/bank-accounts"
  },
  {
    icon: <CreditCard size={18} />,
    labelKey: "loan",
    href: "/admin/credits?label=pending",
    basePath: "/admin/credits?label=pending"
  }
]


