/**
 * Index Page - Main GlazionStudio Chat Interface
 * 
 * Layout behavior:
 * - Fixed body that doesn't scroll
 * - Full-width ResponseArea with centered content
 * - PromptCard starts centered under ResponseArea welcome screen
 * - When conversation starts, PromptCard sticks to bottom, ResponseArea takes remaining space
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

  const handleSendMessage = async (content: string, image?: File) => {
    try {
      await sendUserMessage(content, image);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSuggestionSelect = async (text: string) => {
    try {
      await sendUserMessage(text);
    } catch (error) {
      console.error('Error sending suggestion:', error);
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await editMessage(messageId, content);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

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

  useEffect(() => {
    if (rateLimitTimeRemaining > 0) {
      toast({
        title: "Rate limit active",
        description: `Please wait ${Math.ceil(rateLimitTimeRemaining / 1000)} seconds`,
        variant: "destructive",
      });
    }
  }, [rateLimitTimeRemaining, toast]);

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
    // Fixed container that takes full viewport height minus header and tabs
    <div className="fixed inset-0 flex flex-col" style={{ 
      top: '104px', // 56px header + 52px tabs - adjusted in HybridLayout
      bottom: 0 
    }}>
      <ClipboardUpload onImagePaste={(file) => {
        if (document.querySelector('[data-prompt-card]')) {
          const event = new CustomEvent('pastedImage', { detail: file });
          document.dispatchEvent(event);
        }
      }}>
        
        {!hasConversation && !isLoading ? (
          /* No conversation: Center everything vertically */
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-4xl space-y-8">
              {/* Welcome area - ResponseArea with welcome screen */}
              <div>
                <ResponseArea
                  messages={messages}
                  isTyping={isLoading}
                  onSuggestionSelect={handleSuggestionSelect}
                  onEditMessage={handleEditMessage}
                  bottomPadPx={0}
                />
              </div>
              
              {/* PromptCard centered under welcome area */}
              <div>
                <PromptCard
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading || !canSendMessage}
                  isTyping={isLoading}
                  hasMessages={hasConversation}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Has conversation OR is loading: ResponseArea takes space, PromptCard at bottom */
          <>
            {/* Messages area - scrollable, takes remaining space */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ResponseArea
                messages={messages}
                isTyping={isLoading}
                onSuggestionSelect={handleSuggestionSelect}
                onEditMessage={handleEditMessage}
                bottomPadPx={140} // Space for fixed prompt
                scrollParentRef={scrollRef}
              />
            </div>

            {/* Fixed PromptCard at bottom */}
            <div className="flex-shrink-0 bg-background border-t border-border/40">
              <div className="max-w-4xl mx-auto">
                <PromptCard
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading || !canSendMessage}
                  isTyping={isLoading}
                  hasMessages={hasConversation}
                />
              </div>
            </div>
          </>
        )}
      </ClipboardUpload>

      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onNewChat={handleNewChat}
      />

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isLoading && "AI is processing your message"}
        {rateLimitTimeRemaining > 0 && `Rate limit active, ${Math.ceil(rateLimitTimeRemaining / 1000)} seconds remaining`}
        {error && `Error occurred: ${error}`}
      </div>
    </div>
  );
};

export default Index;