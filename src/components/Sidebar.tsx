import React, { useState } from 'react';
import { X, Home, History, Settings, User, Plus, FileText, ChevronLeft, ChevronRight, MessageSquare, Image as ImgIcon, FlaskConical, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useLocation } from 'react-router-dom';
import { ProfilePopup } from '@/components/ProfilePopup';
import { SettingsModal } from '@/components/modals/SettingsModal';

interface EnhancedSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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
  onNewChat, 
  isCollapsed = false,
  onToggleCollapsed,
  width = 280,
  collapsedWidth = 64
}) => {
  const location = useLocation();
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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

  // Enhanced navigation with feature sections
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

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      if (location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    if (!isCollapsed) onClose();
  };

  const currentWidth = isCollapsed ? collapsedWidth : width;

  return (
    <>
      <div 
        data-sidebar="true"
        className={`
          fixed top-0 left-0 flex flex-col h-full bg-sidebar border-r border-sidebar-border
          transform transition-all duration-300 ease-in-out z-[200]
          shadow-elevated
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: currentWidth }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!isCollapsed ? (
            <>
              <h2 className="text-lg font-semibold text-sidebar-foreground font-heading">
                GlazionStudio
              </h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCollapsed}
                  className="text-sidebar-foreground hover:bg-sidebar-accent"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapsed}
              className="text-sidebar-foreground hover:bg-sidebar-accent mx-auto"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 py-4 flex flex-col overflow-hidden">
          {/* New Chat Button */}
          <div className="px-4 mb-6">
            <Button
              onClick={handleNewChat}
              className={`w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity ${
                isCollapsed ? 'px-0' : ''
              }`}
              size="sm"
              title={isCollapsed ? "New Chat" : undefined}
            >
              <Plus className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">New Chat</span>}
            </Button>
          </div>

          {/* Main Features Section */}
          <nav className="px-4 space-y-1 mb-6">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2">
                Features
              </h3>
            )}
            {mainFeatures.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => !isCollapsed && onClose()}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center w-full ${
                    isCollapsed ? 'justify-center px-2' : 'justify-start px-3'
                  } py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {!isCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Utility Pages */}
          <nav className="px-4 space-y-1 mb-6">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2">
                Tools
              </h3>
            )}
            {utilityPages.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => !isCollapsed && onClose()}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center w-full ${
                    isCollapsed ? 'justify-center px-2' : 'justify-start px-3'
                  } py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-accent/50 text-primary border border-primary/20 shadow-sm' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {!isCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Chat History Section */}
          {!isCollapsed && (
            <div className="flex-1 px-4 py-4 overflow-y-auto">
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3">
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
                                  truncate group-hover:text-sidebar-accent-foreground">
                      {chat.title}
                    </div>
                    <div className="text-xs text-sidebar-foreground/60">
                      {chat.timestamp}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-3">
          <div 
            onClick={() => setIsProfilePopupOpen(true)}
            title={isCollapsed ? user.name : undefined}
            className={`flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent 
                      transition-colors cursor-pointer mb-2 ${
                        isCollapsed ? 'justify-center' : ''
                      }`}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </div>
                <div className="text-xs text-sidebar-foreground/60 truncate">
                  {user.email}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={() => setIsSettingsModalOpen(true)}
            variant="ghost"
            className={`w-full ${
              isCollapsed ? 'justify-center px-0' : 'justify-start'
            } text-sidebar-foreground hover:bg-sidebar-accent`}
            size="sm"
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span className="ml-3">Settings</span>}
          </Button>
        </div>
      </div>

      {/* Modals */}
      <ProfilePopup
        isOpen={isProfilePopupOpen}
        onClose={() => setIsProfilePopupOpen(false)}
        user={user}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </>
  );
};

export default EnhancedSidebar;