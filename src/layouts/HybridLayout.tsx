import React from 'react';
import { Outlet, useLocation, Link, useOutletContext } from 'react-router-dom';
import { MessageSquare, Image as ImgIcon, FlaskConical, Calculator } from 'lucide-react';

interface OutletContextType {
  leftOffset: number;
  isDesktop: boolean;
}

const featureTabs = [
  { to: '/', label: 'Chat Assistant', icon: MessageSquare, short: 'Chat' },
  { to: '/recipes-to-image', label: 'Recipes → Image', icon: FlaskConical, short: 'R→I' },
  { to: '/image-to-recipes', label: 'Image → Recipes', icon: ImgIcon, short: 'I→R' },
  { to: '/umf-calculator', label: 'UMF Calculator', icon: Calculator, short: 'UMF' },
];

export default function HybridLayout() {
  const { pathname } = useLocation();
  const { leftOffset = 0, isDesktop = false } = useOutletContext<OutletContextType>();

  // Only show feature tabs on feature pages
  const isFeaturePage = ['/', '/recipes-to-image', '/image-to-recipes', '/umf-calculator'].includes(pathname);

  return (
    <div className="relative">
      {/* Top Feature Tabs - Only show on feature pages */}
      {isFeaturePage && (
        <div 
          className="fixed top-14 z-39 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300"
          style={{
            // Use exact same positioning logic as Header component  
            left: isDesktop ? leftOffset : 0,
            right: 0,
            height: '52px'
          }}
        >
          <div className="h-full flex items-center justify-center px-4">
            <nav className="w-full max-w-4xl mx-auto">
              <ul className="flex h-full items-center justify-center gap-2">
                {featureTabs.map(({ to, label, icon: Icon, short }) => {
                  const active = pathname === to;
                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        className={[
                          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium',
                          active 
                            ? 'text-primary bg-primary/10 border border-primary/20 shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        ].join(' ')}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className="h-4 w-4" />
                        {/* Full label on desktop, short on mobile */}
                        <span className="hidden sm:inline">{label}</span>
                        <span className="sm:hidden">{short}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Content - Uses same approach as RecipesToImage, etc. */}
      <div style={{ paddingTop: isFeaturePage ? '52px' : '0px' }}>
        <Outlet />
      </div>
    </div>
  );
}