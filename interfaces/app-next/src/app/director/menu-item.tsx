import {
  Home,
  MessageSquare,
  Users,
  Percent,
  FileChartLine 
} from "lucide-react";
export const menuItems = [
  { icon: <Home size={18} />, label: "Accueil", href: "/director" },
  { icon: <Users size={18} />, label: "Conseillers", href: "/director/users?role=advisor" },
  { icon: <Users size={18} />, label: "Directeurs", href: "/director/users?role=director" },
  { icon: <MessageSquare size={18} />, label: "Messageries", href: "/director/threads" },
  { icon: <Percent size={18} />, label: "Taux d'interêt", href: "/director/savings-rate" },
  { icon: <FileChartLine  size={18} />, label: "Formule des crédits", href: "/director/formules" },
];