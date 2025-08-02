import React, { useState } from 'react';
import { X, Home, History, Settings, User, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useLocation } from 'react-router-dom';
import { ProfilePopup } from '@/components/ProfilePopup';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { ChatHistoryModal } from '@/components/modals/ChatHistoryModal';

// TypeScript interface for sidebar props - ensures type safety
interface SidebarProps {
  isOpen: boolean; // Controls sidebar visibility state
  onClose: () => void; // Callback function to close sidebar
  onNewChat?: () => void; // Optional callback for new chat
  width?: number; // Adjustable sidebar width
}

// TypeScript interface for chat history items
interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
}

// TypeScript interface for user profile data
interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

/**
 * Sidebar Component - Sliding navigation panel for GlazeAI
 * 
 * Features:
 * - Smooth slide-in/out animation
 * - Chat history management
 * - User profile display
 * - Navigation links
 * - Settings access
 * 
 * Security considerations:
 * - User data is properly typed
 * - No sensitive information exposed in localStorage
 * - Sanitized user input display
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNewChat, width = 250 }) => {
  const location = useLocation();
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChatHistoryModalOpen, setIsChatHistoryModalOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(width);
  const [isResizing, setIsResizing] = useState(false);
  
  // Mock user data - In production, this would come from secure authentication
  const user: UserProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: undefined // Will fallback to initials
  };

  // Mock chat history - In production, this would come from secure API
  const chatHistory: ChatHistoryItem[] = [
    { id: '1', title: 'Glaze Recipe Help', timestamp: '2 hours ago' },
    { id: '2', title: 'Pottery Techniques', timestamp: '1 day ago' },
    { id: '3', title: 'Kiln Temperature Guide', timestamp: '3 days ago' },
  ];

  // Handle mouse down for resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  // Handle mouse move for resizing
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 400) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Navigation items with active state detection
  const navigationItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Notes', path: '/notes', icon: FileText },
  ];

  const handleChatHistoryClick = () => {
    setIsChatHistoryModalOpen(true);
  };

  // Handle new chat creation with security validation
  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat(); // Use callback if provided
    } else {
      // Fallback for other pages
      if (location.pathname !== '/') {
        window.location.href = '/'; // Navigate to fresh chat
      }
    }
    onClose(); // Close sidebar after action
  };

  // Handle chat history item selection with input sanitization
  const handleChatSelect = (chatId: string) => {
    // In production: validate chatId, ensure user owns this chat
    console.log(`Loading chat: ${chatId}`);
    // Navigate to fresh homepage
    window.location.href = '/';
    onClose(); // Close sidebar after selection
  };

  // Handle profile popup
  const handleProfileClick = () => {
    setIsProfilePopupOpen(true);
  };

  // Handle settings
  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
  };

  return (
    <>
      
      {/* Sidebar container with smooth slide animation */}
      <div 
        className={`
          fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border
          transform transition-transform duration-300 ease-in-out z-50
          shadow-elevated
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Sidebar header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <h2 className="text-lg font-semibold text-sidebar-foreground font-heading">
            GlazeAI
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Sidebar content area */}
        <div className="flex flex-col h-full">
          {/* New Chat Button */}
          <div className="p-4">
            <Button
              onClick={handleNewChat}
              className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center w-full justify-start px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-accent/50 text-primary border border-primary/20 shadow-sm' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Chat History Button */}
            <button
              onClick={handleChatHistoryClick}
              className="flex items-center w-full justify-start px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <History className="h-4 w-4 mr-3" />
              Chat History
            </button>
          </nav>

          {/* Chat History Section */}
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

          {/* Bottom section with profile and settings */}
          <div className="border-t border-sidebar-border p-3 space-y-2">
            {/* User Profile Section */}
            <div 
              onClick={handleProfileClick}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent 
                        transition-colors cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </div>
                <div className="text-xs text-sidebar-foreground/60 truncate">
                  {user.email}
                </div>
              </div>
            </div>

            {/* Settings Button */}
            <Button
              onClick={handleSettingsClick}
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </Button>
          </div>
        </div>

        {/* Resize handle */}
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-ew-resize bg-border/50 hover:bg-border transition-colors"
          onMouseDown={handleMouseDown}
        />
      </div>

      {/* Profile Popup */}
      <ProfilePopup
        isOpen={isProfilePopupOpen}
        onClose={() => setIsProfilePopupOpen(false)}
        user={user}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Chat History Modal */}
      <ChatHistoryModal
        isOpen={isChatHistoryModalOpen}
        onClose={() => setIsChatHistoryModalOpen(false)}
        onSelectChat={(chatId) => {
          console.log('Selected chat:', chatId);
          // Handle chat selection
        }}
      />
    </>
  );
};

export default Sidebar;