import React, { useState } from 'react';
import { X, Home, History, Settings, User, Plus, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useLocation } from 'react-router-dom';
import { ProfilePopup } from '@/components/ProfilePopup';
import { SettingsModal } from '@/components/modals/SettingsModal';

// TypeScript interface for sidebar props
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat?: () => void;
  isCollapsed: boolean; // NEW: collapsed state
  onToggleCollapsed: () => void; // NEW: toggle function
  width?: number;
  collapsedWidth?: number; // NEW: collapsed width
}

// ... other interfaces remain the same
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

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onNewChat, 
  isCollapsed,
  onToggleCollapsed,
  width = 250,
  collapsedWidth = 64
}) => {
  const location = useLocation();
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Mock data remains the same
  const user: UserProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: undefined
  };

  const chatHistory: ChatHistoryItem[] = [
    { id: '1', title: 'Glaze Recipe Help', timestamp: '2 hours ago' },
    { id: '2', title: 'Pottery Techniques', timestamp: '1 day ago' },
    { id: '3', title: 'Kiln Temperature Guide', timestamp: '3 days ago' },
    // ... more items
  ];

  const navigationItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Notes', path: '/notes', icon: FileText },
  ];

  // Event handlers remain mostly the same
  const handleChatHistoryClick = () => {
    window.location.href = '/history';
    if (!isCollapsed) onClose();
  };

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

  const handleProfileClick = () => {
    setIsProfilePopupOpen(true);
  };

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
  };

  // Determine current width based on collapsed state
  const currentWidth = isCollapsed ? collapsedWidth : width;

  return (
    <>
      {/* Sidebar container */}
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
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!isCollapsed ? (
            <>
              <h2 className="text-lg font-semibold text-sidebar-foreground font-heading">
                GlazeAI
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

        {/* Sidebar content */}
        <div className="flex-1 py-4 flex flex-col overflow-hidden">
          {/* New Chat Button */}
          <div className="px-4">
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

          {/* Navigation Links */}
          <nav className="px-4 space-y-2 mt-4">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => !isCollapsed && onClose()}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center w-full ${
                    isCollapsed ? 'justify-center px-0' : 'justify-start px-3'
                  } py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
            
            {/* Chat History Button */}
            <button
              onClick={handleChatHistoryClick}
              title={isCollapsed ? "Chat History" : undefined}
              className={`flex items-center w-full ${
                isCollapsed ? 'justify-center px-0' : 'justify-start px-3'
              } py-2 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}
            >
              <History className="h-4 w-4" />
              {!isCollapsed && <span className="ml-3">Chat History</span>}
            </button>
          </nav>

          {/* Chat History Section - only show when expanded */}
          {!isCollapsed && (
            <div className="flex-1 px-4 py-4 overflow-y-auto">
              <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
                Recent Chats
              </h3>
              <div className="space-y-2">
                {chatHistory.map((chat) => (
                  <Link
                    key={chat.id}
                    to="/"
                    onClick={onClose}
                    className="block w-full text-left p-3 rounded-lg hover:bg-sidebar-accent 
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
          {/* User Profile Section */}
          <div 
            onClick={handleProfileClick}
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

          {/* Settings Button */}
          <Button
            onClick={handleSettingsClick}
            variant="ghost"
            className={`w-full ${
              isCollapsed ? 'justify-center px-0' : 'justify-start'
            } text-sidebar-foreground hover:bg-sidebar-accent mt-2`}
            size="sm"
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span className="ml-3">Settings</span>}
          </Button>
        </div>
      </div>

      {/* Modals remain the same */}
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

export default Sidebar;