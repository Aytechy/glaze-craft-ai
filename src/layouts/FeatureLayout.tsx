
import React from 'react';
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
  return (
    <div className="relative">
      <Outlet />
      <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-card/90 backdrop-blur">
        <ul className="grid grid-cols-4">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={[
                    'flex flex-col items-center justify-center py-3 gap-1',
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  ].join(' ')}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
