import React, { useState } from 'react';
import { AlignJustify, Crown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/modals/UpgradeModal';
import { SettingsModal } from '@/components/modals/SettingsModal';

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

  // Handle upgrade button click
  const handleUpgrade = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleSettings = () => {
    setIsSettingsModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 
                     bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
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

        {/* Right section with upgrade and settings buttons */}
        <div className="flex items-center gap-2 mr-2">
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
    </header>
  );
};

export default Header;