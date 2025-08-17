import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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

  // Handle new chat - navigate to home page and trigger chat reset
  const handleNewChat = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    // Trigger a custom event to reset chat in the Index component
    window.dispatchEvent(new CustomEvent('newChatRequested'));
  };

  const hasBottomTabs = ['/', '/recipes-to-image', '/image-to-recipes', '/umf-calculator'].includes(location.pathname);
  
  // Calculate leftOffset for Header and HybridLayout
  const leftOffset = isDesktop ? (isSidebarOpen ? sidebarWidth : railWidth) : 0;

  return (
    <div className="h-[100svh] overflow-hidden bg-background text-foreground">
      {/* Fixed Header */}
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} 
        leftOffset={leftOffset} 
        isDesktop={isDesktop} 
      />

      {/* Single Sidebar that handles both expanded and collapsed states */}
      <div
        className="hidden md:block fixed top-0 left-0 z-40 h-screen overflow-hidden transition-[width] duration-300 ease-out"
        style={{ width: leftOffset }}
      >
        <Sidebar 
          isOpen={true}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={!isSidebarOpen}
          onToggleCollapsed={() => setIsSidebarOpen(prev => !prev)}
          onNewChat={handleNewChat}
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
              onNewChat={handleNewChat}
              width={256}
            />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          marginLeft: leftOffset,
          paddingTop: '3.5rem',         // header is fixed, keep visual spacing if you want
          paddingBottom: 0,             // remove extra 6rem padding that made root taller
          height: 'calc(100svh - 56px)' // 56px header height
        }}
      >
        <Outlet context={{ leftOffset, isDesktop }} />
      </main>
    </div>
  );
}