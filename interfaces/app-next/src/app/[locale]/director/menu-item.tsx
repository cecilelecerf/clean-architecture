import {
  Home,
  MessageSquare,
  Users,
  Percent,
  FileChartLine
} from "lucide-react";
export const menuItems = [
  { icon: <Home size={18} />, labelKey: "menu.home", href: "/director" },
  { icon: <Users size={18} />, labelKey: "menu.profile", href: "/director/profile" },
  { icon: <Users size={18} />, labelKey: "menu.advisors", href: "/director/users?role=advisor" },
  { icon: <Users size={18} />, labelKey: "menu.directors", href: "/director/users?role=director" },
  { icon: <MessageSquare size={18} />, labelKey: "menu.messages", href: "/director/threads" },
  { icon: <Percent size={18} />, labelKey: "menu.rates", href: "/director/savings-rate" },
  { icon: <FileChartLine size={18} />, labelKey: "menu.formulas", href: "/director/formules" },
  { icon: <FileChartLine size={18} />, labelKey: "menu.stocks", href: "/director/actions" },
  { icon: <FileChartLine size={18} />, labelKey: "menu.currencies", href: "/director/currencies" }
];