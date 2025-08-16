/**
 * Index Page - Main GlazionStudio Chat Interface
 * 
 * This component now works within the AppShell layout:
 * - No duplicate headers or sidebars
 * - Uses AppShell's layout structure
 * - Focuses only on chat functionality
 * - Works with bottom tabs navigation
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
    <div className="flex flex-col relative min-h-[calc(100vh-56px)]">
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
            className={`absolute inset-0 transition-all duration-300 ease-out touch-pan-y
                        ${hasConversation ? 'overflow-y-scroll' : 'overflow-y-hidden'}`}
            style={{
              bottom: Math.max(80, promptHeight + 10),
              ...(hasConversation ? { scrollbarGutter: 'stable' } : {}),
            }}
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

        {/* Input prompt card - positioned at bottom */}
        <div
          ref={promptWrapRef}
          className="sticky bottom-0 z-30 pb-24 "
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