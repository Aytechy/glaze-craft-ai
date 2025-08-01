import React from 'react';
import { X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

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
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="fixed left-[150px] top-0 h-full w-80 bg-card border-r border-border shadow-elevated z-50 
                      transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">Profile</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-card-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Profile Section */}
        <div className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h4 className="text-xl font-semibold text-card-foreground">
                {user.name}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2">
          <Link to="/profile" onClick={onClose}>
            <Button
              variant="ghost"
              className="w-full justify-start text-card-foreground hover:bg-accent"
            >
              <User className="h-4 w-4 mr-3" />
              View Profile
            </Button>
          </Link>
          
          <Link to="/logout" onClick={onClose}>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Log Out
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};