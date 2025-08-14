import React, { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

/**
 * AppShell
 * - Uses YOUR existing Header and Sidebar components.
 * - Sidebar appears on ALL pages.
 * - Header toggle controls the sidebar (same behavior you had).
 * - No new styles or components added.
 */
export default function AppShell() {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarWidth = 250; // keep in sync with your Sidebar default

  // Detect desktop to offset the fixed header so it doesn't overlap
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
  const leftOffset = isDesktop && isOpen ? sidebarWidth : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Your fixed Header */}
      <Header onToggleSidebar={() => setIsOpen(v => !v)} leftOffset={leftOffset} isDesktop={isDesktop} />

      {/* Your Sidebar (overlays; closes via header toggle or X button) */}
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Page content */}
      <main className="pt-14 pb-24"> {/* top padding for fixed header; bottom padding for tabs */}
        <Outlet />
      </main>
    </div>
  );
}