/**
 * Index Page - Main GlazionStudio Chat Interface
 * 
 * This component now works within the AppShell layout:
 * - No duplicate headers or sidebars
 * - Uses AppShell's layout structure
 * - Focuses only on chat functionality
 * - Works with bottom tabs navigation
 * - PromptCard is centered when no messages, fixed when chatting
 * 
 * Security features:
 * - Input validation and sanitization
 * - File upload restrictions
 * - Rate limiting
 * - Error boundary protection
 * - XSS prevention
 */

import React, { useState, useEffect } from 'react';
import ResponseArea from '@/components/ResponseArea';
import PromptCard from '@/components/PromptCard';
import { NewChatModal } from '@/components/modals/NewChatModal';
import { ClipboardUpload } from '@/components/ClipboardUpload';
import { useChat } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';

/**
 * Main Index Component - GlazionStudio Chat Interface
 */
const Index: React.FC = () => {
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
    editMessage,
  } = useChat({
    maxMessages: 100,
    autoSave: true,
  });

  // Tracks the actual height of the PromptCard wrapper
  const [promptHeight, setPromptHeight] = useState(0);
  const promptWrapRef = React.useRef<HTMLDivElement | null>(null);

  const hasConversation = messageCount > 0;
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Toast for user notifications
  const { toast } = useToast();

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

  /**
   * Handle new chat - listen for events from AppShell
   */
  const handleNewChat = () => {
    clearMessages();
    setIsNewChatModalOpen(false);
  };

  // Listen for new chat events from AppShell
  useEffect(() => {
    const handleNewChatEvent = () => {
      clearMessages();
    };

    window.addEventListener('newChatRequested', handleNewChatEvent);
    return () => window.removeEventListener('newChatRequested', handleNewChatEvent);
  }, [clearMessages]);

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

  return (
    <div className="h-full relative">
      <ClipboardUpload onImagePaste={(file) => {
        // Don't auto-send on paste, pass to PromptCard for preview
        if (document.querySelector('[data-prompt-card]')) {
          const event = new CustomEvent('pastedImage', { detail: file });
          document.dispatchEvent(event);
        }
      }}>
        
        {/* When no messages: Center everything vertically */}
        {!hasConversation ? (
          <div className="h-full flex flex-col items-center justify-center px-4 pb-24">
            <div className="w-full max-w-4xl mx-auto space-y-8">
              {/* Welcome area */}
              <div className="flex-1 flex items-center justify-center">
                <ResponseArea
                  messages={messages}
                  isTyping={isLoading}
                  onSuggestionSelect={handleSuggestionSelect}
                  onEditMessage={handleEditMessage}
                  bottomPadPx={0}
                />
              </div>
              
              {/* Centered prompt card */}
              <div ref={promptWrapRef}>
                <PromptCard
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading || !canSendMessage}
                  isTyping={isLoading}
                  hasMessages={messageCount > 0}
                />
              </div>
            </div>
          </div>
        ) : (
          /* When has messages: Normal layout with fixed prompt at bottom */
          <>
            {/* Chat messages area - takes remaining space */}
            <div 
              className="absolute inset-0"
              style={{
                bottom: Math.max(80, promptHeight + 10) + 96, // Add 96px for bottom tabs
              }}
            >
              <div
                ref={scrollRef}
                className="h-full overflow-y-scroll touch-pan-y"
                style={{ scrollbarGutter: 'stable' }}
              >
                <div className="w-full max-w-4xl mx-auto px-4">
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

            {/* Fixed prompt card at bottom */}
            <div
              ref={promptWrapRef}
              className="fixed bottom-0 left-0 right-0 z-30"
              style={{
                paddingBottom: 'calc(env(safe-area-inset-bottom) + 96px)', // 96px for bottom tabs
              }}
            >
              <PromptCard
                onSendMessage={handleSendMessage}
                isLoading={isLoading || !canSendMessage}
                isTyping={isLoading}
                hasMessages={messageCount > 0}
              />
            </div>
          </>
        )}
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
};

export default Index;