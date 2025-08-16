import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

/**
 * AppShell - Main layout component with sidebar functionality
 * - Uses existing Header and Sidebar components with collapse/expand functionality
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

      {/* Single Sidebar that handles both expanded and collapsed states */}
      <div
        className="hidden md:block fixed top-0 left-0 z-40 h-screen overflow-hidden transition-[width] duration-300 ease-out"
        style={{ width: isSidebarOpen ? sidebarWidth : railWidth }}
      >
        <Sidebar 
          isOpen={true}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={!isSidebarOpen}
          onToggleCollapsed={() => setIsSidebarOpen(prev => !prev)}
          width={sidebarWidth}
          collapsedWidth={railWidth}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && !isDesktop && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 z-50 h-screen w-64">
            <Sidebar 
              isOpen={true} 
              onClose={() => setIsSidebarOpen(false)} 
              width={256}
            />
          </div>
        </>
      )}

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