import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTypingEffect } from '@/hooks/useTypingEffect';

interface TypingMessageProps {
  content: string
  speed?: number
  delay?: number
  onComplete?: () => void
  className?: string
  useMarkdown?: boolean
}

export const TypingMessage: React.FC<TypingMessageProps> = ({
  content,
  speed,
  delay,
  onComplete,
  className = '',
  useMarkdown = false,
}) => {
  const { displayedText, isTyping, startTyping } = 
    useTypingEffect({ speed, delay, onComplete });

  const prevContent = useRef<string>('');

  useEffect(() => {
    // only trigger the type effect when content goes from empty → new value
    if (content && content !== prevContent.current) {
      startTyping(content);
      prevContent.current = content;
    }
  }, [content]);

  const textToShow = isTyping ? displayedText : content;

  // If using markdown, render with ReactMarkdown
  if (useMarkdown) {
    return (
      <div className={`leading-relaxed ${className}`}>
        <ReactMarkdown
          components={{
            // Custom styles for markdown elements
            h3: ({children}) => <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground">{children}</h3>,
            h2: ({children}) => <h2 className="text-xl font-semibold mb-3 mt-4 text-foreground">{children}</h2>,
            ul: ({children}) => <ul className="mb-4 space-y-1">{children}</ul>,
            li: ({children}) => <li className="ml-4 text-foreground">• {children}</li>,
            p: ({children}) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
            strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
          }}
        >
          {textToShow}
        </ReactMarkdown>
      </div>
    );
  }

  // Otherwise, render as plain text (for user messages)
  return (
    <div className={`leading-relaxed whitespace-pre-wrap ${className}`}>
      {textToShow}
    </div>
  );
};