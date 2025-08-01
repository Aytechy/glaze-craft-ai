import React, { useState } from 'react';
import { AlignJustify, Crown, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/modals/UpgradeModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { ProfilePopup } from '@/components/ProfilePopup';

// TypeScript interface for header component props
interface HeaderProps {
  onToggleSidebar: () => void; // Callback to toggle sidebar visibility
}

/**
 * Header Component - Top navigation bar for GlazeAI
 * 
 * Features:
 * - Responsive design
 * - Sidebar toggle functionality
 * - Premium upgrade call-to-action
 * - Clean, professional styling
 * 
 * Security considerations:
 * - Upgrade button would lead to secure payment processing
 * - No sensitive data exposed in header
 */
const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);

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
    setIsSettingsModalOpen(true);
  };

  const handleProfile = () => {
    setIsProfilePopupOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 
                     bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
        {/* Left section with sidebar toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-foreground hover:bg-accent ml-2"
            aria-label="Toggle sidebar"
          >
            <AlignJustify className="h-5 w-5" />
          </Button>
        </div>

        {/* Center section - App title (hidden on mobile to save space) */}
        <div className="hidden md:flex items-center">
          <h1 className="text-xl font-bold font-heading text-foreground">
            GlazeAI
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
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
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
};

export default Header;