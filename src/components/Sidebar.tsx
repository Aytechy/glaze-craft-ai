import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { MessageSquare, Image as ImgIcon, FlaskConical, Calculator } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Chat Assistant', icon: MessageSquare },
  { to: '/recipes-to-image', label: 'Recipes → Image', icon: FlaskConical },
  { to: '/image-to-recipes', label: 'Image → Recipes', icon: ImgIcon },
  { to: '/umf-calculator', label: 'UMF Calculator', icon: Calculator },
];

export default function TopTabLayout() {
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
      const sidebarContainer = document.querySelector('.hidden.md\\:block.fixed.top-0.left-0');
      if (sidebarContainer) {
        const width = sidebarContainer.getBoundingClientRect().width;
        setSidebarOpen(width > railWidth + 10);
      }
    };

    const timer = setTimeout(checkSidebarState, 100);
    window.addEventListener('resize', handleResize);
    
    const observer = new MutationObserver(() => {
      setTimeout(checkSidebarState, 50);
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
      {/* Top Tab Bar */}
      <div 
        className="fixed top-14 z-40 border-b bg-background/95 backdrop-blur"
        style={{
          left: leftOffset,
          right: 0,
          height: '48px'
        }}
      >
        <nav className="h-full px-4">
          <ul className="flex h-full items-center gap-1">
            {tabs.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={[
                      'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium',
                      active 
                        ? 'text-primary bg-primary/10 border border-primary/20' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    ].join(' ')}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Content with proper spacing */}
      <div style={{ paddingTop: '48px' }}>
        <Outlet />
      </div>
    </div>
  );
}