import {
  Home,
  MessageSquare,
  Users
} from "lucide-react";
export const menuItems = [
  { icon: <Home size={18} />, label: "Accueil", href: "/director" },
  { icon: <Users size={18} />, label: "Utilisateurs", href: "/director/advisors" },
  { icon: <MessageSquare size={18} />, label: "Messageries", href: "/director/threads" },
];