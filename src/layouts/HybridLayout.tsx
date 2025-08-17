import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { MessageSquare, Image as ImgIcon, FlaskConical, Calculator } from 'lucide-react';

const featureTabs = [
  { to: '/', label: 'Chat Assistant', icon: MessageSquare },
  { to: '/recipes-to-image', label: 'Recipes → Image', icon: FlaskConical },
  { to: '/image-to-recipes', label: 'Image → Recipes', icon: ImgIcon },
  { to: '/umf-calculator', label: 'UMF Calculator', icon: Calculator },
];

export default function HybridLayout() {
  const { pathname } = useLocation();
  const [leftOffset, setLeftOffset] = useState(0);

  // Only show feature tabs on feature pages
  const isFeaturePage = ['/', '/recipes-to-image', '/image-to-recipes', '/umf-calculator'].includes(pathname);

  useEffect(() => {
    const updateLeftOffset = () => {
      // Check if we're on desktop
      const isDesktop = window.innerWidth >= 768;
      
      if (!isDesktop) {
        setLeftOffset(0);
        return;
      }

      // Get the main content area to determine its left margin
      const mainElement = document.querySelector('main');
      if (mainElement) {
        const styles = window.getComputedStyle(mainElement);
        const marginLeft = parseInt(styles.marginLeft, 10) || 0;
        setLeftOffset(marginLeft);
      }
    };

    // Update on mount
    updateLeftOffset();

    // Listen for resize events
    window.addEventListener('resize', updateLeftOffset);

    // Use MutationObserver to watch for sidebar changes
    const observer = new MutationObserver(() => {
      // Slight delay to allow transitions to complete
      setTimeout(updateLeftOffset, 50);
    });

    // Watch the main element for style changes (margin-left changes when sidebar toggles)
    const mainElement = document.querySelector('main');
    if (mainElement) {
      observer.observe(mainElement, {
        attributes: true,
        attributeFilter: ['style'],
      });
    }

    return () => {
      window.removeEventListener('resize', updateLeftOffset);
      observer.disconnect();
    };
  }, []);

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
          {/* Centered navigation container */}
          <div className="h-full flex items-center justify-center px-4">
            <nav className="w-full max-w-4xl mx-auto">
              <ul className="flex h-full items-center justify-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                {featureTabs.map(({ to, label, icon: Icon }) => {
                  const active = pathname === to;
                  return (
                    <li key={to} className="flex-shrink-0">
                      <Link
                        to={to}
                        className={[
                          'flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap',
                          active 
                            ? 'text-primary bg-primary/10 border border-primary/20 shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        ].join(' ')}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {/* Responsive text display */}
                        <span className="hidden sm:inline">{label}</span>
                        {/* Show abbreviated text on very small screens */}
                        <span className="sm:hidden text-xs">
                          {label.includes('→') ? label.split(' ')[0] : label.split(' ')[0]}
                        </span>
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