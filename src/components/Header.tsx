import React from 'react';
import { Menu, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  // Handle upgrade button click - would redirect to secure payment page
  const handleUpgrade = () => {
    // In production: redirect to secure payment/subscription page
    console.log('Redirecting to upgrade page...');
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
            className="text-foreground hover:bg-accent"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Center section - App title (hidden on mobile to save space) */}
        <div className="hidden md:flex items-center">
          <h1 className="text-xl font-bold font-heading text-foreground">
            GlazeAI
          </h1>
        </div>

        {/* Right section with upgrade button */}
        <div className="flex items-center">
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
    </header>
  );
};

export default Header;