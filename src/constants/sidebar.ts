import { LayoutDashboard, Bot, Presentation, CreditCard, LucideIcon } from "lucide-react";

interface SidebarItemProps {
  title: string;
  url: string;
  icon : LucideIcon
}

export const SIDEBAR_APP_ITEMS: SidebarItemProps[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Presentation,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
];