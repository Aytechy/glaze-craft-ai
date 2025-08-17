import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { MessageSquare, Image as ImgIcon, FlaskConical, Calculator } from 'lucide-react';

const featureTabs = [
  { to: '/', label: 'Chat Assistant', icon: MessageSquare, short: 'Chat' },
  { to: '/recipes-to-image', label: 'Recipes → Image', icon: FlaskConical, short: 'R→I' },
  { to: '/image-to-recipes', label: 'Image → Recipes', icon: ImgIcon, short: 'I→R' },
  { to: '/umf-calculator', label: 'UMF Calculator', icon: Calculator, short: 'UMF' },
];

export default function HybridLayout() {
  const { pathname } = useLocation();
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarWidth = 280;
  const railWidth = 64;

  // Only show feature tabs on feature pages
  const isFeaturePage = ['/', '/recipes-to-image', '/image-to-recipes', '/umf-calculator'].includes(pathname);

  useEffect(() => {
    const updateLayout = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      
      if (!desktop) {
        setSidebarOpen(false);
        return;
      }

      // Get the main content area to determine sidebar state
      const mainElement = document.querySelector('main');
      if (mainElement) {
        const styles = window.getComputedStyle(mainElement);
        const marginLeft = parseInt(styles.marginLeft, 10) || 0;
        // If margin is greater than rail width, sidebar is open
        setSidebarOpen(marginLeft > railWidth + 10);
      }
    };

    // Update on mount and resize
    updateLayout();
    window.addEventListener('resize', updateLayout);

    // Watch for sidebar changes via MutationObserver
    const observer = new MutationObserver(() => {
      setTimeout(updateLayout, 50);
    });

    const mainElement = document.querySelector('main');
    if (mainElement) {
      observer.observe(mainElement, {
        attributes: true,
        attributeFilter: ['style'],
      });
    }

    return () => {
      window.removeEventListener('resize', updateLayout);
      observer.disconnect();
    };
  }, []);

  // Calculate left offset based on sidebar state
  const leftOffset = isDesktop ? (sidebarOpen ? sidebarWidth : railWidth) : 0;

  return (
    <div className="relative">
      {/* Top Feature Tabs - Only show on feature pages */}
      {isFeaturePage && (
        <div 
          className="fixed top-14 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300"
          style={{
            left: leftOffset,
            right: 0,
            height: '52px'
          }}
        >
          <div className="h-full flex items-center justify-center px-2 sm:px-4">
            <nav className="w-full max-w-4xl mx-auto">
              <ul className="flex h-full items-center justify-center gap-1">
                {featureTabs.map(({ to, label, icon: Icon, short }) => {
                  const active = pathname === to;
                  return (
                    <li key={to} className="flex-shrink-0">
                      <Link
                        to={to}
                        className={[
                          'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-200 text-sm font-medium',
                          active 
                            ? 'text-primary bg-primary/10 border border-primary/20 shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        ].join(' ')}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {/* Responsive text - full label on sm+, short on mobile */}
                        <span className="hidden sm:inline">{label}</span>
                        <span className="sm:hidden text-xs font-medium">{short}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Content with proper spacing */}
      <div style={{ paddingTop: isFeaturePage ? '52px' : '0px' }}>
        <Outlet />
      </div>
    </div>
  );
}