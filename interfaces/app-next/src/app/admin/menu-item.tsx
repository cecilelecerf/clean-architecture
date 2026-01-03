import {
  Home,
  MessageSquare,
  Users,
  CreditCard,
  Inbox,
  Newspaper,
  Wallet,
  ClockFading
} from "lucide-react";

export const menuItemsClients = [
  { icon: <Users size={18} />, label: "Utilisateurs", href: "/admin/users" },
  { icon: <MessageSquare size={18} />, label: "Conversations clients", href: "/admin/client-threads" },
  { icon: <Wallet size={18} />, label: "Comptes clients", href: "/admin/accounts" }
]

export const menuItems = [
  { icon: <Home size={18} />, label: "Accueil", href: "/admin" },
  { icon: <Inbox size={18} />, label: "Messageries", href: "/admin/threads" },
  { icon: <Newspaper size={18} />, label: "Actualités", href: "/admin/feeds" },
  { icon: <Wallet size={18} />, label: "Compte de la banque", href: "/admin/bank-accounts" },
];

export const menuItemsCredit = [
  { icon: <CreditCard size={18} />, label: "Demandes de crédits", href: "/admin/credits?label=pending" },
  { icon: <ClockFading size={18} />, label: "Crédits en cours", href: "/admin/credits?label=accepted" },
]