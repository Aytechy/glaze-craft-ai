import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { MessageSquare, Image as ImgIcon, FlaskConical, Calculator } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Chat Assistant', icon: MessageSquare },
  { to: '/recipes-to-image', label: 'Recipes → Image', icon: FlaskConical },
  { to: '/image-to-recipes', label: 'Image → Recipes', icon: ImgIcon },
  { to: '/umf-calculator', label: 'UMF', icon: Calculator },
];

export default function FeatureLayout() {
  const { pathname } = useLocation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarWidth = 280;
  const railWidth = 64;

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    const checkSidebarState = () => {
      if (!isDesktop) {
        setSidebarOpen(false);
        return;
      }

      // Check if there's a desktop sidebar container
      const sidebarContainer = document.querySelector('.hidden.md\\:block.fixed.top-0.left-0');
      if (sidebarContainer) {
        const width = sidebarContainer.getBoundingClientRect().width;
        setSidebarOpen(width > railWidth + 10); // Add buffer for animations
      }
    };

    // Initial check with a small delay to ensure DOM is ready
    const timer = setTimeout(checkSidebarState, 100);

    window.addEventListener('resize', handleResize);
    
    // Listen for sidebar state changes with MutationObserver
    const observer = new MutationObserver(() => {
      setTimeout(checkSidebarState, 50); // Small delay for transition completion
    });
    
    const sidebarContainer = document.querySelector('.hidden.md\\:block.fixed.top-0.left-0');
    if (sidebarContainer) {
      observer.observe(sidebarContainer, { 
        attributes: true, 
        attributeFilter: ['style'],
        subtree: true
      });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [isDesktop, railWidth]);

  const leftOffset = isDesktop ? (sidebarOpen ? sidebarWidth : railWidth) : 0;

  return (
    <div className="relative">
      <Outlet />
      <nav 
        className="fixed bottom-0 z-50 border-t bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/60"
        style={{
          left: leftOffset,
          right: 0
        }}
      >
        <ul className="grid grid-cols-4 px-2 safe-area-padding-bottom">
              {tabs.map(({ to, label, icon: Icon }) => {
                const active = pathname === to;
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      className={[
                        'flex flex-col items-center justify-center py-3 px-2 gap-1 rounded-lg transition-colors min-h-[60px]',
                        active ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      ].join(' ')}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-xs font-medium text-center leading-tight line-clamp-1">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
    </div>
  );
}