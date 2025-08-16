/**
 * Index Page - Main GlazionStudio Chat Interface
 * 
 * This component detects if it's running within AppShell layout
 * and adjusts accordingly to avoid duplicate headers/sidebars
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

const Index: React.FC = () => {
  // Detect if we're running inside AppShell by checking for existing header
  const [isInAppShell, setIsInAppShell] = useState(false);
  
  // Sidebar state management (only used if not in AppShell)
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

  const { toast } = useToast();

  // Detect if we're inside AppShell by checking for existing headers
  useEffect(() => {
    const checkAppShell = () => {
      // Look for existing header in the DOM (from AppShell)
      const existingHeader = document.querySelector('header');
      const isWrapped = existingHeader && !headerRef.current;
      setIsInAppShell(isWrapped);
    };
    
    // Check immediately and after a short delay
    checkAppShell();
    const timer = setTimeout(checkAppShell, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Listen for new chat requests from AppShell
  useEffect(() => {
    const handleNewChatRequest = () => {
      clearMessages();
    };
    
    window.addEventListener('newChatRequested', handleNewChatRequest);
    return () => window.removeEventListener('newChatRequested', handleNewChatRequest);
  }, [clearMessages]);

  /**
   * Toggle sidebar visibility
   */
  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const newState = !prev;
      localStorage.setItem('sidebar-open', String(newState));
      return newState;
    });
  };

  /**
   * Close sidebar
   */
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    localStorage.setItem('sidebar-open', 'false');
  };

  /**
   * Handle message sending with validation
   */
  const handleSendMessage = async (content: string, image?: File) => {
    try {
      await sendUserMessage(content, image);
    } catch (error) {
      console.error('Error sending message:', error);
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

  const RAIL_W = 64;

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

  // Initialize sidebar state from localStorage (only if not in AppShell)
  useEffect(() => {
    if (!isInAppShell) {
      const sidebarState = localStorage.getItem('sidebar-open');
      if (sidebarState !== null) {
        setIsSidebarOpen(sidebarState === 'true');
      }
    }
  }, [isInAppShell]);

  /**
   * Handle keyboard shortcuts (only if not in AppShell)
   */
  useEffect(() => {
    if (isInAppShell) return; // AppShell handles this
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
      
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        handleToggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, isInAppShell]);

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

  // Measure PromptCard height
  useEffect(() => {
    const el = promptWrapRef.current;
    if (!el) return;

    if (typeof window.ResizeObserver === 'undefined') {
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

  // Measure header height (only if we have our own header)
  useEffect(() => {
    if (isInAppShell) return; // Don't measure AppShell's header
    
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
  }, [isInAppShell]);

  // Calculate layout offsets
  const leftOffset = !isInAppShell && isDesktop ? (isSidebarOpen ? sidebarWidth : RAIL_W) : 0;

  // If running inside AppShell, render simplified chat-only version
  if (isInAppShell) {
    return (
      <div className="h-full flex flex-col relative">
        <ClipboardUpload onImagePaste={(file) => {
          if (document.querySelector('[data-prompt-card]')) {
            const event = new CustomEvent('pastedImage', { detail: file });
            document.dispatchEvent(event);
          }
        }}>
          {/* Chat messages area */}
          <div className="flex-1 min-h-0 relative">
            <div
              ref={scrollRef}
              className={`absolute inset-0 transition-all duration-300 ease-out touch-pan-y
                          ${hasConversation ? 'overflow-y-scroll' : 'overflow-y-hidden'}`}
              style={{
                bottom: Math.max(80, promptHeight + 20),
                ...(hasConversation ? { scrollbarGutter: 'stable' } : {}),
              }}
            >
              <ResponseArea
                messages={messages}
                isTyping={isLoading}
                onSuggestionSelect={handleSuggestionSelect}
                onEditMessage={handleEditMessage}
                bottomPadPx={0}
                scrollParentRef={scrollRef}
              />
            </div>
          </div>

          {/* Input prompt card */}
          <div
            ref={promptWrapRef}
            className="absolute bottom-0 left-0 right-0 z-10 pb-4"
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
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
  }

  // If NOT in AppShell, render the full standalone version (your original code)
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
            width={256}
          />
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex relative">
        {/* Desktop sidebar */}
        <div
          className="hidden md:block fixed top-0 left-0 z-40 h-screen overflow-hidden transition-[width] duration-300 ease-out"
          style={{ width: isSidebarOpen ? `${sidebarWidth}px` : `${RAIL_W}px` }}
        >
          <Sidebar
            isOpen={true}
            onClose={handleCloseSidebar}
            onNewChat={() => setIsNewChatModalOpen(true)}
            isCollapsed={!isSidebarOpen}
            onToggleCollapsed={() => setIsSidebarOpen(prev => !prev)}
            width={sidebarWidth}
            collapsedWidth={RAIL_W}
          />
        </div>

        {/* Chat content */}
        <div
          className="fixed bottom-0 right-0 flex flex-col transition-all duration-300 ease-out"
          style={{
            top: '56px',
            left: leftOffset,
            bottom: 0,
          }}
        >
          <ClipboardUpload onImagePaste={(file) => {
            if (document.querySelector('[data-prompt-card]')) {
              const event = new CustomEvent('pastedImage', { detail: file });
              document.dispatchEvent(event);
            }
          }}>
            <div className="flex-1 min-h-0 relative">
              <div
                ref={scrollRef}
                className={`absolute left-0 right-0 transition-all duration-300 ease-out touch-pan-y
                            ${hasConversation ? 'overflow-y-scroll' : 'overflow-y-hidden'}`}
                style={{
                  top: 0,
                  bottom: Math.max(80, promptHeight + 10),
                  ...(hasConversation ? { scrollbarGutter: 'stable' } : {}),
                }}
              >
                <div className="w-full max-w-3xl md:mx-auto md:px-0 pl-0 pr-0">
                  <ResponseArea
                    messages={messages}
                    isTyping={isLoading}
                    onSuggestionSelect={handleSuggestionSelect}
                    onEditMessage={handleEditMessage}
                    bottomPadPx={0}
                    scrollParentRef={scrollRef}
                  />
                </div>
              </div>
            </div>

            <div
              ref={promptWrapRef}
              className="fixed z-30 mx-auto w-full max-w-3xl transition-all duration-300 ease-out"
              style={{
                left: leftOffset,
                right: 0,
                bottom: '96px',
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