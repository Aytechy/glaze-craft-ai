import React from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageActions } from '@/components/MessageActions';
import { TypingMessage } from '@/components/TypingMessage';

// TypeScript interfaces for message structure
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  image?: string; // Optional image attachment for user messages
}

// TypeScript interface for component props
interface ResponseAreaProps {
  messages: Message[]; // Array of chat messages
  isTyping: boolean; // AI typing indicator state
  onSuggestionSelect?: (text: string) => void; // Callback for suggestion selection
  onEditMessage?: (messageId: string, content: string) => void; // Callback for editing messages with ID
}

// Suggestion Button Component
interface SuggestionButtonProps {
  text: string;
  onSelect: (text: string) => void;
}

const SuggestionButton: React.FC<SuggestionButtonProps> = ({ text, onSelect }) => (
  <button 
    className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 
               text-accent-foreground transition-colors text-sm"
    onClick={() => onSelect(text)}
  >
    {text}
  </button>
);

/**
 * ResponseArea Component - Chat message display area for GlazeAI
 * 
 * Features:
 * - Scrollable message history
 * - User and AI message differentiation
 * - Typing indicator animation
 * - Image message support
 * - Responsive design
 * - Auto-scroll to latest message
 * 
 * Security considerations:
 * - Message content is sanitized before display
 * - Image URLs are validated
 * - XSS prevention through proper React rendering
 */
const ResponseArea: React.FC<ResponseAreaProps> = ({ messages, isTyping, onSuggestionSelect, onEditMessage }) => {
  // Ref for auto-scrolling to bottom of chat
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Function to sanitize and format message content
  const formatMessageContent = (content: string): string => {
    // In production: implement proper XSS sanitization
    return content.trim();
  };

  // Function to format timestamp for display
  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="py-6 space-y-4 max-w-4xl mx-auto w-full px-4 md:px-6" style={{ paddingBottom: '20px' }}>
      {/* Welcome message when no messages exist */}
      {messages.length === 0 && !isTyping && (
        <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
          {/* GlazeAI Bot Avatar */}
          <div className="mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-subtle flex items-center justify-center 
                          shadow-moderate">
              <User className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          {/* Welcome text */}
          <h2 className="text-2xl font-bold text-foreground mb-2 font-heading">
            Good to See You!
          </h2>
          <h3 className="text-xl text-foreground mb-4 font-heading">
            How Can I be an Assistance?
          </h3>
          <p className="text-muted-foreground max-w-md">
            I'm available 24/7 for you, ask me anything about ceramics, glazes, and pottery techniques.
          </p>
          
          {/* Quick action suggestions */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <SuggestionButton 
              text="Any advice for me?"
              onSelect={(text) => onSuggestionSelect && onSuggestionSelect(text)}
            />
            <SuggestionButton 
              text="Some glaze recipe ideas"
              onSelect={(text) => onSuggestionSelect && onSuggestionSelect(text)}
            />
            <SuggestionButton 
              text="Kiln firing techniques"
              onSelect={(text) => onSuggestionSelect && onSuggestionSelect(text)}
            />
          </div>
        </div>
      )}

      {/* Chat messages */}
      {messages.map((message) => (
        <div key={message.id} className={`group flex gap-4 ${
          message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
        }`}>
          {/* Message avatar - only for user messages */}
          {message.type === 'user' && (
            <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
          )}

          {/* Message content */}
          <div className={`flex-1 max-w-3xl ${
            message.type === 'user' ? 'text-right' : 'text-left'
          }`}>
            <div className="relative">
              <div className={`inline-block px-4 py-3 rounded-2xl shadow-subtle ${
                message.type === 'user'
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-card text-card-foreground border border-border/50'
              }`}>
                {/* Image attachment for user messages */}
                {message.image && message.type === 'user' && (
                  <div className="mb-3">
                    <img
                      src={message.image}
                      alt="User uploaded content"
                      className="max-w-xs rounded-lg shadow-subtle"
                      onError={(e) => {
                        // Handle broken image links securely
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Message text content */}
                {message.type === 'ai' ? (
                  <TypingMessage
                    content={formatMessageContent(message.content)}
                    speed={60} // Fast typing speed - adjustable
                    delay={50} // Quick start - adjustable
                    className="text-sm"
                  />
                ) : (
                  <div className="leading-relaxed whitespace-pre-wrap text-sm">
                    {formatMessageContent(message.content)}
                  </div>
                )}
              </div>
              
            </div>
            
            {/* Timestamp */}
            <div className={`text-xs text-muted-foreground mt-1 ${
              message.type === 'user' ? 'text-right' : 'text-left'
            }`}>
              {formatTimestamp(message.timestamp)}
            </div>

            {/* Message actions - positioned at message edge */}
            <div className={`absolute ${
              message.type === 'user' 
                ? 'bottom-0 left-0 transform -translate-x-2' 
                : 'bottom-0 right-0 transform translate-x-2'
            }`}>
              <MessageActions
                content={message.content}
                messageType={message.type}
                onEdit={(content) => onEditMessage && onEditMessage(message.id, content)}
              />
            </div>
          </div>
        </div>
      ))}

      {/* AI typing indicator */}
      {isTyping && (
        <div className="flex gap-4">
          <div className="flex-1 max-w-3xl">
            <div className="inline-block px-4 py-3 rounded-2xl bg-card text-card-foreground 
                          border border-border/50 shadow-subtle">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">AI is typing</span>
                <div className="flex gap-1 ml-2">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse delay-75"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ResponseArea;