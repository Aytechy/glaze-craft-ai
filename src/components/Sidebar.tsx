import React, { useState } from 'react';
import { Home, History, Settings, User, Plus, FileText, PanelLeft, PanelRight, MessageSquare, Image as ImgIcon, FlaskConical, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ProfilePopup } from '@/components/ProfilePopup';

interface EnhancedSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFastClose?: () => void;
  onNewChat?: () => void;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
  width?: number;
  collapsedWidth?: number;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
}

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ 
  isOpen, 
  onClose, 
  onFastClose,
  onNewChat, 
  isCollapsed = false,
  onToggleCollapsed,
  width = 280,
  collapsedWidth = 64
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  
  // Add internal animation state to control content visibility
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(!isCollapsed);
  
  // For mobile: handle mount/unmount with animation
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isMobileAnimating, setIsMobileAnimating] = useState(false);
  const [transitionSpeed, setTransitionSpeed] = useState(400);
  
  // Detect if this is mobile or desktop usage
  const isMobileUsage = window.innerWidth < 768;

  const handleSettings = () => {
    navigate('/settings');
  };

  // Handle desktop collapse/expand animation timing
  React.useEffect(() => {
    if (isMobileUsage) return; // Only for desktop
    
    if (isCollapsed) {
      // Closing: Start fade out immediately, content will fade during width collapse
      setShowContent(false);
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 150); // Match CSS transition duration
    } else {
      // Opening: Start width expansion, content will fade in during expansion
      setIsAnimating(true);
      setTimeout(() => {
        setShowContent(true); // Start fade in after small delay
        setTimeout(() => {
          setIsAnimating(false);
        }, 50);
      }, 30); // Start content fade very early in the opening animation
    }
  }, [isCollapsed, isMobileUsage]);

  // Handle mobile mounting/unmounting with proper timing for animations
  React.useEffect(() => {
    if (!isMobileUsage) return; // Only for mobile
    
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsMobileAnimating(true), 10);
    } else {
      setTimeout(() => {
        setIsMobileAnimating(false);
        setTimeout(() => setShouldRender(false), 400);
      }, 10);
    }
  }, [isOpen, isMobileUsage]);

  // For desktop, always render (no mount/unmount)
  if (isMobileUsage && !shouldRender) return null;

  const handleClose = (fast = false) => {
    if (isMobileUsage) {
      setTransitionSpeed(fast ? 200 : 400);
      setIsMobileAnimating(false);
      setTimeout(() => {
        setShouldRender(false);
        onClose();
      }, fast ? 200 : 400);
    } else {
      // For desktop, use collapse functionality
      onToggleCollapsed?.();
    }
  };

  // Listen for fast close events from outside clicks
  React.useEffect(() => {
    const handleFastClose = () => {
      handleClose(true);
    };
    
    if (onFastClose) {
      window.addEventListener('closeSidebarFast', handleFastClose);
      return () => window.removeEventListener('closeSidebarFast', handleFastClose);
    }
  }, [onFastClose]);

  const user: UserProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: undefined
  };

  const chatHistory: ChatHistoryItem[] = [
    { id: '1', title: 'Glaze Recipe Help', timestamp: '2 hours ago' },
    { id: '2', title: 'Pottery Techniques', timestamp: '1 day ago' },
    { id: '3', title: 'Kiln Temperature Guide', timestamp: '3 days ago' },
  ];

  const mainFeatures = [
    { name: 'Chat Assistant', path: '/', icon: MessageSquare },
    { name: 'Recipes → Image', path: '/recipes-to-image', icon: FlaskConical },
    { name: 'Image → Recipes', path: '/image-to-recipes', icon: ImgIcon },
    { name: 'UMF Calculator', path: '/umf-calculator', icon: Calculator },
  ];

  const utilityPages = [
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'History', path: '/history', icon: History },
  ];

  // Updated handleNewChat to trigger the modal properly
  const handleNewChat = () => {
    // Navigate to chat page if not already there
    if (location.pathname !== '/') {
      navigate('/');
    }
    
    // Dispatch event to open the new chat modal
    window.dispatchEvent(new CustomEvent('openNewChatModal'));
    
    // Close sidebar on mobile
    if (!isCollapsed && isMobileUsage) {
      onClose();
    }
  };

  const currentWidth = isCollapsed ? collapsedWidth : width;
  
  // Use showContent for desktop content visibility instead of isCollapsed directly
  const shouldShowContent = isMobileUsage ? true : showContent;

  return (
    <>
      <div 
        data-sidebar="true"
        className="fixed top-0 left-0 flex flex-col h-full bg-sidebar border-r border-sidebar-border z-[200] shadow-elevated"
        style={{ 
          width: currentWidth,
          transform: isMobileUsage 
            ? (isMobileAnimating ? 'translateX(0px)' : 'translateX(-100%)')
            : 'translateX(0px)',
          transition: `transform ${transitionSpeed}ms ease-in-out, width 150ms ease-in-out`,
          willChange: 'transform, width',
          backfaceVisibility: 'hidden'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 p-4 border-b border-sidebar-border">
          {shouldShowContent ? (
            <div 
              className="flex items-center justify-between w-full"
              style={{
                opacity: shouldShowContent ? 1 : 0,
                transition: 'opacity 150ms ease-in-out'
              }}
            >
              <h2 className="text-lg font-semibold text-sidebar-foreground font-heading">
                GlazionStudio
              </h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClose(false)}
                  className="text-sidebar-foreground hover:bg-sidebar-accent p-2"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeft strokeWidth={1} style={{ width: '27px', height: '27px', minWidth: '27px', minHeight: '27px' }} />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapsed}
              className="text-sidebar-foreground hover:bg-sidebar-accent mx-auto p-2"
              style={{ marginLeft: '-5px' }}
              aria-label="Expand sidebar"
            >
              <PanelRight strokeWidth={1} style={{ width: '27px', height: '27px', minWidth: '27px', minHeight: '27px' }} />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 py-2 flex flex-col overflow-hidden">
          {/* New Chat Button */}
          <div className="px-3 mb-2">
            <Button
              onClick={handleNewChat}
              className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity justify-start px-3"
              size="sm"
              title={!shouldShowContent ? "New Chat" : undefined}
            >
              <Plus className="h-4 w-4 flex-shrink-0" />
              <span 
                className="ml-3 whitespace-nowrap"
                style={{
                  opacity: shouldShowContent ? 1 : 0,
                  transition: 'opacity 150ms ease-in-out'
                }}
              >
                New Chat
              </span>
            </Button>
          </div>

          {/* Main Features Section */}
          <nav className="px-3 space-y-0.5 mb-3">
            <h3 
              className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2 whitespace-nowrap"
              style={{
                opacity: shouldShowContent ? 1 : 0,
                transition: 'opacity 150ms ease-in-out'
              }}
            >
              Features
            </h3>
            {mainFeatures.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => shouldShowContent && onClose()}
                  title={!shouldShowContent ? item.name : undefined}
                  className={`flex items-center w-full justify-start px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span 
                    className="ml-3 whitespace-nowrap"
                    style={{
                      opacity: shouldShowContent ? 1 : 0,
                      transition: 'opacity 150ms ease-in-out'
                    }}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Utility Pages */}
          <nav className="px-3 space-y-0.5 mb-3">
            <h3 
              className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2"
              style={{
                opacity: shouldShowContent ? 1 : 0,
                transition: 'opacity 150ms ease-in-out'
              }}
            >
              Tools
            </h3>
            {utilityPages.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => shouldShowContent && onClose()}
                  title={!shouldShowContent ? item.name : undefined}
                  className={`flex items-center w-full justify-start px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-accent/50 text-primary border border-primary/20 shadow-sm' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span 
                    className="ml-3 whitespace-nowrap"
                    style={{
                      opacity: shouldShowContent ? 1 : 0,
                      transition: 'opacity 150ms ease-in-out'
                    }}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Chat History Section */}
          <div 
            className="flex-1 px-3 py-4 overflow-y-auto"
            style={{
              opacity: shouldShowContent ? 1 : 0,
              transition: 'opacity 150ms ease-in-out'
            }}
          >
            <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3 whitespace-nowrap">
              Recent Chats
            </h3>
            <div className="space-y-1">
              {chatHistory.map((chat) => (
                <Link
                  key={chat.id}
                  to="/"
                  onClick={onClose}
                  className="block w-full text-left p-2.5 rounded-lg hover:bg-sidebar-accent 
                           transition-colors group"
                >
                  <div className="text-sm font-medium text-sidebar-foreground mb-1 
                                truncate group-hover:text-sidebar-accent-foreground whitespace-nowrap">
                    {chat.title}
                  </div>
                  <div className="text-xs text-sidebar-foreground/60 whitespace-nowrap">
                    {chat.timestamp}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="border-t border-sidebar-border px-1.5 py-3">
          <div 
            onClick={() => setIsProfilePopupOpen(true)}
            title={!shouldShowContent ? user.name : undefined}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent 
                      transition-colors cursor-pointer mb-2"
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div 
              className="flex-1 min-w-0"
              style={{
                opacity: shouldShowContent ? 1 : 0,
                transition: 'opacity 150ms ease-in-out'
              }}
            >
              <div className="text-sm font-medium text-sidebar-foreground truncate whitespace-nowrap">
                {user.name}
              </div>
              <div className="text-xs text-sidebar-foreground/60 truncate whitespace-nowrap">
                {user.email}
              </div>
            </div>
          </div>

          <Button
            onClick={handleSettings}
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent px-4"
            size="sm"
            title={!shouldShowContent ? "Settings" : undefined}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            <span 
              className="ml-3"
              style={{
                opacity: shouldShowContent ? 1 : 0,
                transition: 'opacity 150ms ease-in-out',
                visibility: shouldShowContent ? 'visible' : 'hidden'
              }}
            >
              Settings
            </span>
          </Button>
        </div>
      </div>

      {/* Modals */}
      <ProfilePopup
        isOpen={isProfilePopupOpen}
        onClose={() => setIsProfilePopupOpen(false)}
        user={user}
      />
    </>
  );
};

export default EnhancedSidebar;