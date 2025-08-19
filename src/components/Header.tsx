import React, { useState, forwardRef } from 'react';
import { PanelRight, Crown, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/modals/UpgradeModal';
import { ProfilePopup } from '@/components/ProfilePopup';
import { useNavigate } from 'react-router-dom';

// TypeScript interface for header component props
interface HeaderProps {
  onToggleSidebar: () => void; // Callback to toggle sidebar visibility
  isDesktop?: boolean;
}

/**
 * Header Component - Top navigation bar for GlazionStudio
 * 
 * Features:
 * - Responsive design using CSS custom properties
 * - Sidebar toggle functionality
 * - Premium upgrade call-to-action
 * - Clean, professional styling
 * - No flash positioning with CSS variables
 * 
 * Security considerations:
 * - Upgrade button would lead to secure payment processing
 * - No sensitive data exposed in header
 */
const Header = forwardRef<HTMLElement, HeaderProps>(({ onToggleSidebar, isDesktop = false }, ref) => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const navigate = useNavigate();

  // Listen for upgrade modal events from profile popup
  React.useEffect(() => {
    const handleUpgradeEvent = () => {
      setIsUpgradeModalOpen(true);
    };
    
    window.addEventListener('openUpgradeModal', handleUpgradeEvent);
    return () => window.removeEventListener('openUpgradeModal', handleUpgradeEvent);
  }, []);

  // Handle upgrade button click
  const handleUpgrade = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleProfile = () => {
    setIsProfilePopupOpen(true);
  };

  return (
    <header
      ref={ref}
      className="fixed top-0 z-30 h-14 border-b border-border/40
                bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
                transition-all duration-300"
      style={{
        // Use CSS custom properties set by AppShell
        left: 'calc(var(--is-desktop, 0) * var(--sidebar-offset, 0px))',
        right: 0
      }}
    >

      <div className="w-full flex h-14 items-center justify-between pl-0 pr-5">
        {/* Left section with sidebar toggle - only show on mobile */}
        <div className="flex items-center gap-4">
          {!isDesktop && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="text-foreground hover:bg-accent"
              aria-label="Toggle sidebar"
            >
              <PanelRight strokeWidth={1} style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px' }} />
            </Button>
          )}
        </div>

        {/* Center section - App title (hidden on mobile to save space) */}
        <div className="hidden md:flex items-center pl-10">
          <h1 className="text-xl font-bold font-heading text-foreground">
            GlazionStudio
          </h1>
        </div>

        {/* Right section with profile, settings and upgrade buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleProfile}
            className="text-foreground hover:bg-accent"
            aria-label="Profile"
          >
            <User className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSettings}
            className="text-foreground hover:bg-accent"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleUpgrade}
            className="gradient-primary text-primary-foreground hover:opacity-90 
                     transition-all duration-200 shadow-glow text-sm font-medium"
            size="sm"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </div>
      </div>
      
      {/* Modals */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
      />
      <ProfilePopup 
        isOpen={isProfilePopupOpen} 
        onClose={() => setIsProfilePopupOpen(false)} 
        user={{
          name: "John Doe",
          email: "john@example.com",
          avatar: undefined
        }}
      />
    </header>
  );
});

Header.displayName = 'Header';

export default Header;