/**
 * Index Page - Main GlazionStudio Chat Interface
 * 
 * Layout behavior:
 * - PromptCard starts centered under ResponseArea welcome screen
 * - When conversation starts, PromptCard sticks to bottom, ResponseArea takes remaining space
 * - Clean, intuitive UX similar to ChatGPT/Claude
 * - Works within AppShell's main container (no custom positioning needed)
 */

import React, { useState, useEffect } from 'react';
import ResponseArea from '@/components/ResponseArea';
import PromptCard from '@/components/PromptCard';
import { NewChatModal } from '@/components/modals/NewChatModal';
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

  // Listen for new chat events from AppShell and Sidebar
  useEffect(() => {
    const handleNewChatEvent = () => {
      // If there are existing messages, show modal, otherwise just clear
      if (hasConversation) {
        setIsNewChatModalOpen(true);
      } else {
        clearMessages();
      }
    };
    
    // Handle the event from AppShell (when user navigates to chat and needs reset)
    const handleNewChatFromAppShell = () => {
      handleNewChatEvent();
    };
    
    // Handle the event from Sidebar (when user clicks New Chat button)
    const handleNewChatFromSidebar = () => {
      // Always show modal from sidebar, regardless of conversation state
      // This gives user control over whether they want to start fresh
      setIsNewChatModalOpen(true);
    };
    
    window.addEventListener('newChatRequested', handleNewChatFromAppShell);
    window.addEventListener('openNewChatModal', handleNewChatFromSidebar);
    
    return () => {
      window.removeEventListener('newChatRequested', handleNewChatFromAppShell);
      window.removeEventListener('openNewChatModal', handleNewChatFromSidebar);
    };
  }, [clearMessages, hasConversation]);

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
    <div className="h-full overflow-hidden flex flex-col">
      {/* content */}
        
        {!hasConversation && !isLoading ? (
          /* No conversation: Center everything vertically */
          <div className="flex flex-col items-center justify-center h-full pt-16 md:pt-20">
            <div className="w-full max-w-4xl">
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
            <div className="flex-1 min-h-0">
              <div
                ref={scrollRef}
                className="overflow-y-auto overscroll-contain pr-2"
                style={{
                  height: 'calc(100vh - 200px)',
                  paddingBottom: '120px' // Space for fixed prompt
                }}
              >
                <div className="w-full max-w-4xl mx-auto">
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

            {/* Fixed PromptCard at bottom */}
            <div 
              className="fixed bottom-0 z-30 "
              style={{
                // Use CSS custom properties to respect sidebar positioning
                left: 'calc(var(--is-desktop, 0) * var(--sidebar-offset, 0px))',
                right: 0,
                paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
              }}
            >
              <PromptCard
                onSendMessage={handleSendMessage}
                isLoading={isLoading || !canSendMessage}
                isTyping={isLoading}
                hasMessages={hasConversation}
              />
            </div>
          </>
        )}

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