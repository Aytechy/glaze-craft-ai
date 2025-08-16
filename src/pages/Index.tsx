/**
 * Index Page - Chat Interface Only (no layout components)
 * 
 * This component now only handles chat functionality since
 * AppShell provides the Header, Sidebar, and overall layout.
 */

import React, { useState, useEffect } from 'react';
import ResponseArea from '@/components/ResponseArea';
import PromptCard from '@/components/PromptCard';
import { NewChatModal } from '@/components/modals/NewChatModal';
import { ClipboardUpload } from '@/components/ClipboardUpload';
import { useChat } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState<boolean>(false);
  const [promptHeight, setPromptHeight] = useState(0);
  const promptWrapRef = React.useRef<HTMLDivElement | null>(null);
  
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

  const hasConversation = messageCount > 0;
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  /**
   * Handle new chat
   */
  const handleNewChat = () => {
    clearMessages();
    setIsNewChatModalOpen(false);
  };

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

  return (
    <div className="h-full flex flex-col relative">
      <ClipboardUpload onImagePaste={(file) => {
        if (document.querySelector('[data-prompt-card]')) {
          const event = new CustomEvent('pastedImage', { detail: file });
          document.dispatchEvent(event);
        }
      }}>
        {/* Chat messages area - takes remaining space above prompt */}
        <div className="flex-1 min-h-0 relative">
          <div
            ref={scrollRef}
            className={`absolute inset-0 transition-all duration-300 ease-out touch-pan-y
                        ${hasConversation ? 'overflow-y-scroll' : 'overflow-y-hidden'}`}
            style={{
              bottom: Math.max(80, promptHeight + 20), // Add some padding above prompt
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

        {/* Input prompt card - fixed at bottom */}
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
};

export default Index;