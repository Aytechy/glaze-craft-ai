
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { MessageSquare, Image as ImgIcon, FlaskConical, Calculator } from 'lucide-react';

const tabs = [
  { to: '/assistant', label: 'GPT Assistant', icon: MessageSquare },
  { to: '/recipes-to-image', label: 'Recipes → Image', icon: FlaskConical },
  { to: '/image-to-recipes', label: 'Image → Recipes', icon: ImgIcon },
  { to: '/umf-calculator', label: 'UMF', icon: Calculator },
];

export default function FeatureLayout() {
  const { pathname } = useLocation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    const handleSidebarChange = () => {
      const sidebar = document.querySelector('[data-sidebar="true"]');
      setIsSidebarOpen(sidebar?.classList.contains('translate-x-0') || false);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('storage', handleSidebarChange);
    
    // Listen for sidebar state changes
    const observer = new MutationObserver(handleSidebarChange);
    const sidebar = document.querySelector('[data-sidebar="true"]');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', handleSidebarChange);
      observer.disconnect();
    };
  }, []);

  const railWidth = isDesktop && isSidebarOpen ? 280 : 0;

  return (
    <div className="relative">
      <Outlet />
      <nav 
        className="fixed bottom-0 z-50 border-t bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/60"
        style={{
          left: railWidth,
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
