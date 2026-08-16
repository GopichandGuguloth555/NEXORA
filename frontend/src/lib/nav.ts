import {
  Bell,
  FileText,
  FolderKanban,
  Hash,
  LayoutDashboard,
  ListChecks,
  Paperclip,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: ListChecks },
  { label: "Channels", href: "/channels", icon: Hash },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Files", href: "/files", icon: Paperclip },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];
