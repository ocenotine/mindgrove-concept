import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Video,
} from 'lucide-react';
import { useAuthStore } from "@/store/authStore";

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
}

export default function Sidebar({ className }: SidebarProps) {
  const { pathname } = useLocation();
  const { logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const getLinkClass = (path: string) => {
    return cn(
      "flex items-center gap-2 rounded-md p-2 text-sm font-semibold hover:bg-secondary hover:text-accent-foreground",
      {
        "bg-secondary text-accent-foreground": pathname === path,
      }
    );
  };

  return (
    <aside
      className={cn("border-r bg-background w-[240px] hidden md:block", className)}
      data-state={collapsed ? 'closed' : 'open'}
    >
      <div className="flex items-center border-b px-3 py-4">
        <Link to="/dashboard" className="mr-auto font-bold">
          MindGrove AI
        </Link>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-label="Collapse sidebar"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto py-2 px-3">
        <nav className="grid gap-1">
          <Link to="/dashboard" className={getLinkClass('/dashboard')}>
            <LayoutDashboard className="h-5 w-5 mr-2" />
            Dashboard
          </Link>
          
          <Link to="/documents" className={getLinkClass('/documents')}>
            <FileText className="h-5 w-5 mr-2" />
            Documents
          </Link>
          
          <Link to="/lecture-digest" className={getLinkClass('/lecture-digest')}>
            <Video className="h-5 w-5 mr-2" />
            Lecture Digest
          </Link>
          
          <Link to="/settings" className={getLinkClass('/settings')}>
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </Link>
        </nav>
      </div>
      
      <div className="border-t px-3 py-2">
        <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
