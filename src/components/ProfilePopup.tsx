import React, { useEffect, useRef, useState } from 'react';
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
  triggerRef?: React.RefObject<HTMLElement>;
}

export const ProfilePopup: React.FC<ProfilePopupProps> = ({ isOpen, onClose, user, triggerRef }) => {
  const navigate = useNavigate();
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, bottom: 'auto' });
  
  useEffect(() => {
    if (isOpen && triggerRef?.current && popupRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Position above the trigger element with some margin
      const preferredTop = triggerRect.top - popupRect.height - 8;
      const preferredLeft = triggerRect.left;
      
      // Check if popup fits above trigger
      if (preferredTop >= 0) {
        setPosition({
          top: preferredTop,
          left: Math.min(preferredLeft, viewportWidth - popupRect.width - 16),
          bottom: 'auto'
        });
      } else {
        // If not enough space above, position below
        setPosition({
          top: triggerRect.bottom + 8,
          left: Math.min(preferredLeft, viewportWidth - popupRect.width - 16),
          bottom: 'auto'
        });
      }
    }
  }, [isOpen, triggerRef]);
  
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
      <div className="fixed inset-0 z-[300]" onClick={onClose} />
      
      {/* Popup */}
      <div 
        ref={popupRef}
        className="fixed z-[301] w-64 bg-card border border-border shadow-elevated rounded-lg
                  transform transition-all duration-200 ease-out"
        style={{
          top: position.top,
          left: position.left,
          bottom: position.bottom
        }}
      >
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