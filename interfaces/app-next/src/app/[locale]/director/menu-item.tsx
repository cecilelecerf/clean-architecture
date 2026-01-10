import {
  Home,
  MessageSquare,
  Users,
  Percent,
  FileChartLine
} from "lucide-react";
import { ReactNode } from "react";

interface MenuItem {
  icon: ReactNode;
  labelKey: string;
  href: string;
  basePath?: string;
}

export const menuItems: MenuItem[] = [
  {
    icon: <Home size={18} />,
    labelKey: "home",
    href: "/director",
    basePath: "/director"
  },
  {
    icon: <Users size={18} />,
    labelKey: "profile",
    href: "/director/profile",
    basePath: "/director/profile"
  },
  {
    icon: <Users size={18} />,
    labelKey: "advisors",
    href: "/director/users?role=advisor",
    basePath: "/director/users"
  },
  {
    icon: <Users size={18} />,
    labelKey: "directors",
    href: "/director/users?role=director",
    basePath: "/director/users"
  },
  {
    icon: <MessageSquare size={18} />,
    labelKey: "messages",
    href: "/director/threads",
    basePath: "/director/threads"
  },
  {
    icon: <Percent size={18} />,
    labelKey: "rates",
    href: "/director/savings-rate",
    basePath: "/director/savings-rate"
  },
  {
    icon: <FileChartLine size={18} />,
    labelKey: "formulas",
    href: "/director/formules",
    basePath: "/director/formules"
  },
  {
    icon: <FileChartLine size={18} />,
    labelKey: "stocks",
    href: "/director/actions",
    basePath: "/director/actions"
  },
  {
    icon: <FileChartLine size={18} />,
    labelKey: "currencies",
    href: "/director/currencies",
    basePath: "/director/currencies"
  }
];