import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { SidebarRail } from '@/components/SidebarRail';

/**
 * AppShell - Main layout component with sidebar functionality
 * - Uses existing Header and Sidebar components
 * - Shows SidebarRail when sidebar is collapsed
 * - Responsive layout that adapts to screen size
 * - Proper spacing for fixed header and bottom tabs
 */
export default function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const sidebarWidth = 280;
  const railWidth = 64;
  const location = useLocation();

  // Detect desktop screen size
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isDesktop]);

  const hasBottomTabs = ['/assistant', '/recipes-to-image', '/image-to-recipes', '/umf-calculator'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed Header */}
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} 
        leftOffset={isDesktop ? (isSidebarOpen ? sidebarWidth : railWidth) : 0} 
        isDesktop={isDesktop} 
      />

      {/* Sidebar Rail (always visible on desktop when sidebar is closed) */}
      {isDesktop && !isSidebarOpen && <SidebarRail />}

      {/* Full Sidebar (overlay on mobile, fixed on desktop) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        width={sidebarWidth}
      />

      {/* Main Content Area */}
      <main 
        className="transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isDesktop ? (isSidebarOpen ? sidebarWidth : railWidth) : 0,
          paddingTop: '3.5rem', // 56px for fixed header
          paddingBottom: hasBottomTabs ? '6rem' : '1.5rem', // 96px for bottom tabs, 24px otherwise
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}