
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
  const [isDesktop, setIsDesktop] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Detect desktop screen size
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Read sidebar state from localStorage
  useEffect(() => {
    const sidebarState = localStorage.getItem('sidebar-open');
    setIsSidebarOpen(sidebarState === 'true');
  }, []);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleStorageChange = () => {
      const sidebarState = localStorage.getItem('sidebar-open');
      setIsSidebarOpen(sidebarState === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const sidebarWidth = 250;
  const railWidth = 64;
  const leftOffset = isDesktop ? (isSidebarOpen ? sidebarWidth : railWidth) : 0;

  return (
    <div className="relative">
      <Outlet />
      <nav 
        className="fixed bottom-0 z-50 border-t bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-all duration-300"
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
