import {
  Home,
  MessageSquare,
  Users
} from "lucide-react";
export const menuItems = [
  { icon: <Home size={18} />, label: "Accueil", href: "/admin" },
  { icon: <Users size={18} />, label: "Utilisateurs", href: "/admin/users" },
  { icon: <MessageSquare size={18} />, label: "Conversations clients", href: "/admin/client-threads" },
  { icon: <MessageSquare size={18} />, label: "Demandes de crédits", href: "/admin/credit-requests" },
  { icon: <MessageSquare size={18} />, label: "Messageries", href: "/admin/threads" },
  { icon: <MessageSquare size={18} />, label: "Actualités", href: "/admin/feeds" },
];