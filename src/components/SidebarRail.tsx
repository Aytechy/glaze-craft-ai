import React from "react";
import { Home, FileText, History, Settings, Plus, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Collapsed rail that mirrors vertical positions of the full sidebar.
 * - Top offset matches fixed header height (h-14 → 56px) via pt-14
 * - "New Chat" icon sits where the button is in the full sidebar
 * - Nav icons (Home, Notes) keep identical order and spacing
 * - Chat History icon is placed exactly where the section starts in full sidebar
 * - Profile and Settings are anchored at the bottom, identical in both views
 */
const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/notes", icon: FileText, label: "Notes" },
];

export const SidebarRail: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <aside
      className="hidden md:flex fixed top-0 left-0 z-40 h-screen w-16 flex-col border-r bg-background pt-14"
      aria-label="Collapsed navigation"
    >
      {/* Main column uses space-between so bottom items never float */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Upper stack: New Chat + primary nav + history */}
        <div className="flex flex-col">
          {/* New Chat icon aligned with the expanded button block padding (p-4) */}
          <div className="px-3 pt-4 pb-2">
            <Link
              to="/"
              title="New Chat"
              aria-label="New Chat"
              className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              <Plus className="h-5 w-5" />
            </Link>
          </div>

          {/* Primary nav — same order and gap as expanded */}
          <nav className="px-3 flex flex-col gap-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground",
                  pathname === to && "bg-accent text-accent-foreground"
                )}
                title={label}
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </nav>

          {/* Chat History icon — mirrors the position where the list starts */}
          <div className="px-3 pt-3">
            <Link
              to="/history"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground",
                pathname === "/history" && "bg-accent text-accent-foreground"
              )}
              title="Chat History"
              aria-label="Chat History"
            >
              <History className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Bottom cluster: Profile + Settings pinned to bottom */}
        <div className="pb-3 flex flex-col items-center gap-2">
          <Link
            to="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
            title="Profile"
            aria-label="Profile"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            to="/settings"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground",
              pathname === "/settings" && "bg-accent text-accent-foreground"
            )}
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </aside>
  );
};
