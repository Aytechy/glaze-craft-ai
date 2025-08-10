/**
 * Index Page - Main GlazionStudio Chat Interface
 * 
 * This is the primary user interface for GlazionStudio, featuring:
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
import { ClipboardUpload } from '@/components/ClipboardUpload';
import { useChat } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';
import { SidebarRail } from "@/components/SidebarRail";



/**
 * Main Index Component - GlazionStudio Chat Interface
 */
const Index: React.FC = () => {
  // Sidebar state management
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(350);
  
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
    editMessage,
  } = useChat({
    maxMessages: 100,
    autoSave: true,
  });

  // Tracks the actual height of the PromptCard wrapper
  const headerRef = React.useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(40);
  const [promptHeight, setPromptHeight] = useState(0);
  const promptWrapRef = React.useRef<HTMLDivElement | null>(null);

  const hasConversation = messageCount > 0;
  const scrollRef = React.useRef<HTMLDivElement>(null);

  
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
   * Handle edit message - edit and resend
   */
  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await editMessage(messageId, content);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const RAIL_W = 64; // keep in sync with w-16 in SidebarRail.tsx

  /**
   * Handle new chat
   */
  const handleNewChat = () => {
    clearMessages();
    setIsNewChatModalOpen(false);
  };
  const [isDesktop, setIsDesktop] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth >= 768 : false);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  // Measure PromptCard height (guarded so it can't crash)
  useEffect(() => {
    const el = promptWrapRef.current;
    if (!el) return;

    // Older browsers: guard ResizeObserver
    if (typeof window.ResizeObserver === 'undefined') {
      // Fallback once on mount
      setPromptHeight(el.getBoundingClientRect().height || 0);
      return;
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = Math.round(entry.contentRect.height);
        if (!Number.isNaN(h)) setPromptHeight(h);
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure header height (updates if it changes)
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = Math.round(entry.contentRect.height);
        if (!Number.isNaN(h)) setHeaderHeight(h);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const leftOffset = isDesktop ? (isSidebarOpen ? sidebarWidth : RAIL_W) : 0;

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
      <Header
        ref={headerRef}
        onToggleSidebar={handleToggleSidebar}
        isDesktop={isDesktop}
        leftOffset={isDesktop ? (isSidebarOpen ? sidebarWidth : RAIL_W) : 0}
      />

      {/* Spacer so content doesn't sit under the fixed header */}
      <div className="h-14" />

      
      {/* Backdrop blur for mobile screens */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Mobile sidebar */}
      {isSidebarOpen && !isDesktop && (
        <div className="fixed top-0 left-0 z-50 h-screen w-64 bg-white shadow-lg md:hidden">
          <Sidebar
            isOpen={true}
            onClose={handleCloseSidebar}
            onNewChat={() => setIsNewChatModalOpen(true)}
            width={256} // or match w-64
          />
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex relative">
        {/* Desktop sidebar shell with smooth width transition */}
        <div
          className="hidden md:block fixed top-0 left-0 z-40 h-screen overflow-hidden transition-[width] duration-300 ease-out"
          style={{ width: isSidebarOpen ? `${sidebarWidth}px` : `${RAIL_W}px` }}
        >
          <div className="absolute inset-0">
            {isSidebarOpen ? (
              <Sidebar
                isOpen={true}
                onClose={handleCloseSidebar}
                onNewChat={() => setIsNewChatModalOpen(true)}
                width={sidebarWidth}
              />
            ) : (
              <SidebarRail />
            )}
          </div>
        </div>

        {/* Main content - full height with global scroll */}
        <div
          className="fixed bottom-0 right-0 flex flex-col transition-all duration-300 ease-out"
          style={{
            top: '56px', // h-14
            left: leftOffset,
          }}
        >

          <ClipboardUpload onImagePaste={(file) => {
            // Don't auto-send on paste, pass to PromptCard for preview
            if (document.querySelector('[data-prompt-card]')) {
              const event = new CustomEvent('pastedImage', { detail: file });
              document.dispatchEvent(event);
            }
          }}>
            {/* Chat messages area - flex column so child absolute scroller can fit */}
            <div className="flex-1 min-h-0 relative">
              <div
                ref={scrollRef}
                className={`absolute left-0 right-0 transition-all duration-300 ease-out touch-pan-y
                            ${hasConversation ? 'overflow-y-scroll' : 'overflow-y-hidden'}`}
                style={{
                  top: 0,
                  bottom: Math.max(0, (promptHeight || 96) - 40),
                  ...(hasConversation ? { scrollbarGutter: 'stable both-edges' } : {}),
                }}
              >
                <div className="w-full max-w-3xl md:mx-auto md:px-0 pl-0 pr-0">
                  <ResponseArea
                    messages={messages}
                    isTyping={isLoading}
                    onSuggestionSelect={handleSuggestionSelect}
                    onEditMessage={handleEditMessage}
                    bottomPadPx={0}
                    scrollParentRef={scrollRef}   // <-- pass parent scroller
                  />
                </div>
              </div>

            </div>

            {/* Input prompt card - properly positioned and shifts with sidebar */}
            <div
              ref={promptWrapRef}
              className="fixed bottom-0 z-30 mx-auto w-full max-w-3xl transition-all duration-300 ease-out"
              style={{
                left: leftOffset,
                right: 0,
                paddingBottom: 'calc(env(safe-area-inset-bottom) + 1px)',
              }}
            >
              <PromptCard
                onSendMessage={handleSendMessage}
                isLoading={isLoading || !canSendMessage}
                isTyping={isLoading}
                hasMessages={messageCount > 0}
              />
            </div>

          </ClipboardUpload>
        </div>
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
