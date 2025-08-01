import React from 'react';
import { X, User, LogOut, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const ProfilePopup: React.FC<ProfilePopupProps> = ({ isOpen, onClose, user }) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    // Trigger upgrade modal - we'll need to pass this through props or use a global state
    const upgradeEvent = new CustomEvent('openUpgradeModal');
    window.dispatchEvent(upgradeEvent);
  };

  const handleViewProfile = () => {
    onClose();
    navigate('/profile');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="fixed right-4 top-16 w-64 bg-card border border-border shadow-elevated rounded-lg z-50 
                      transform transition-all duration-300 ease-in-out animate-fade-in"
                      style={{ animation: 'fade-in 0.2s ease-out' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="text-sm font-semibold text-card-foreground">Quick Actions</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-card-foreground hover:bg-accent h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Actions */}
        <div className="p-2 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-card-foreground hover:bg-accent text-sm h-8"
            onClick={handleUpgrade}
          >
            <Crown className="h-3 w-3 mr-2" />
            Upgrade
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-card-foreground hover:bg-accent text-sm h-8"
            onClick={handleViewProfile}
          >
            <User className="h-3 w-3 mr-2" />
            View Profile
          </Button>
          
          <Link to="/logout" onClick={onClose}>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10 text-sm h-8"
            >
              <LogOut className="h-3 w-3 mr-2" />
              Log Out
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};