/**
 * Index Page - Main GlazeAI Chat Interface
 * 
 * This is the primary user interface for GlazeAI, featuring:
 * - Responsive chat layout
 * - Sliding sidebar navigation
 * - Message display area
 * - Interactive prompt input
 * - Real-time AI responses
 * 
 * Security features:
 * - Input validation and sanitization
 * - File upload restrictions
 * - Rate limiting
 * - Error boundary protection
 * - XSS prevention
 */

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ResponseArea from '@/components/ResponseArea';
import PromptCard from '@/components/PromptCard';
import { NewChatModal } from '@/components/modals/NewChatModal';
import { useChat } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';

/**
 * Main Index Component - GlazeAI Chat Interface
 */
const Index: React.FC = () => {
  // Sidebar state management
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState<boolean>(false);
  
  // Chat functionality from custom hook
  const {
    messages,
    isLoading,
    error,
    sendUserMessage,
    canSendMessage,
    messageCount,
    rateLimitTimeRemaining,
    clearMessages,
  } = useChat({
    maxMessages: 100,
    autoSave: true,
  });

  // Toast for user notifications
  const { toast } = useToast();

  /**
   * Toggle sidebar visibility
   */
  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  /**
   * Close sidebar
   */
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  /**
   * Handle message sending with validation
   */
  const handleSendMessage = async (content: string, image?: File) => {
    try {
      await sendUserMessage(content, image);
    } catch (error) {
      console.error('Error sending message:', error);
      // Error is already handled by the useChat hook
    }
  };

  /**
   * Handle suggestion selection - auto-type and send
   */
  const handleSuggestionSelect = async (text: string) => {
    try {
      await sendUserMessage(text);
    } catch (error) {
      console.error('Error sending suggestion:', error);
    }
  };

  /**
   * Handle edit message - populate the input with content
   */
  const handleEditMessage = (content: string) => {
    // This would populate the input field with the message content
    // For now, we'll show a toast
    toast({
      title: "Edit feature",
      description: "Edit functionality would populate the input field with this message.",
    });
  };

  /**
   * Handle new chat
   */
  const handleNewChat = () => {
    clearMessages();
    setIsNewChatModalOpen(false);
  };

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to close sidebar
      if (event.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
      
      // Ctrl/Cmd + K to toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        handleToggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  /**
   * Show rate limit notifications
   */
  useEffect(() => {
    if (rateLimitTimeRemaining > 0) {
      toast({
        title: "Rate limit active",
        description: `Please wait ${Math.ceil(rateLimitTimeRemaining / 1000)} seconds`,
        variant: "destructive",
      });
    }
  }, [rateLimitTimeRemaining, toast]);

  /**
   * Show error notifications
   */
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header with navigation and upgrade button */}
      <Header onToggleSidebar={handleToggleSidebar} />
      
      {/* Main content area */}
      <div className="flex-1 flex relative">
        {/* Sliding sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
          onNewChat={() => setIsNewChatModalOpen(true)}
        />
        
        {/* Main chat container with sidebar-aware layout */}
        <main className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'ml-[150px]' : 'ml-0'
        }`} style={{ height: 'calc(100vh - 56px)' }}>
          {/* Chat messages area */}
          <ResponseArea
            messages={messages}
            isTyping={isLoading}
            onSuggestionSelect={handleSuggestionSelect}
            onEditMessage={handleEditMessage}
          />
          
          {/* Input prompt card */}
          <PromptCard
            onSendMessage={handleSendMessage}
            isLoading={isLoading || !canSendMessage}
            hasMessages={messageCount > 0}
          />
        </main>
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onNewChat={handleNewChat}
      />

      {/* Accessibility announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isLoading && "AI is processing your message"}
        {rateLimitTimeRemaining > 0 && `Rate limit active, ${Math.ceil(rateLimitTimeRemaining / 1000)} seconds remaining`}
        {error && `Error occurred: ${error}`}
      </div>
    </div>
  );
};

export default Index;
