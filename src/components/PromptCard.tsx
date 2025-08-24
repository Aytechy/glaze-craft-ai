/**
 * PromptCard Component - Clean text input for chat
 *
 * Features:
 * - Auto-resizing textarea
 * - Send on Enter (Shift+Enter for new line)
 * - Disabled during any busy state
 * - Clean, responsive design
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';   

interface PromptCardProps {
  onSendMessage: (content: string) => void;
  isBusy: boolean;
  // ✅ Removed hasMessages - wasn't being used
}

const PromptCard: React.FC<PromptCardProps> = ({
  onSendMessage,
  isBusy
}) => {
  const [prompt, setPrompt] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 250);
    textarea.style.height = `${newHeight}px`;
  };

  const handleSubmit = () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      toast({ title: "Empty message", description: "Please enter a message.", variant: "destructive" });
      return;
    }
    onSendMessage(trimmedPrompt);
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isBusy) {
        handleSubmit();
      }
    }
  };
  
  // ✅ Handle mobile keyboard with Visual Viewport API
  useEffect(() => {
    const handleViewportChange = () => {
      if (window.visualViewport) {
        // Calculate keyboard height
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        setKeyboardHeight(Math.max(0, keyboardHeight));
      }
    };

    // Check if Visual Viewport API is supported
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      
      // Also listen to scroll events (iOS Safari needs this)
      window.visualViewport.addEventListener('scroll', handleViewportChange);
      
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
        window.visualViewport?.removeEventListener('scroll', handleViewportChange);
      };
    } else {
      // Fallback for browsers without Visual Viewport API
      const initialHeight = window.innerHeight;
      
      const handleResize = () => {
        const currentHeight = window.innerHeight;
        const keyboardHeight = initialHeight - currentHeight;
        setKeyboardHeight(Math.max(0, keyboardHeight));
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div 
      className="w-full px-4"
      style={{
        // Move up by keyboard height when keyboard is open
        transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : 'none',
        transition: 'transform 0.3s ease-in-out'
      }}
    >
      <div className="w-full max-w-3xl mx-auto">
        <div className="relative bg-card border rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 ease-out">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Glazion anything"
              className="w-full min-h-[40px] max-h-[250px] resize-none border-0 bg-transparent 
                         focus-visible:ring-0 focus-visible:ring-offset-0 text-base
                         placeholder:text-muted-foreground overflow-y-auto transition-all duration-200
                         leading-relaxed py-1 pr-12 custom-textarea"  
              rows={1}
              style={{ height: '40px' }}
            />
            
            <Button
              onClick={handleSubmit}
              disabled={isBusy || !prompt.trim()}
              className="absolute bottom-1 right-1 h-8 w-8 rounded-full p-0 bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all duration-200"
              size="sm"
            >
              {isBusy ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;