import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTypingEffect } from '@/hooks/useTypingEffect';

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
    if (content && content !== prevContent.current) {
      startTyping(content);
      prevContent.current = content;
    }
  }, [content, startTyping]);

  const textToShow = isTyping ? displayedText : content;

  if (useMarkdown) {
    return (
      <div className={`leading-relaxed ${className} chat-markdown`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mb-3 mt-4 text-foreground">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground">{children}</h3>
            ),
            // Proper lists: no manual bullets here
            ol: ({ children }) => (
              <ol className="mb-4 list-decimal pl-6 space-y-1">{children}</ol>
            ),
            ul: ({ children }) => (
              <ul className="mb-4 list-disc pl-6 space-y-1">{children}</ul>
            ),
            li: ({ children }) => (
              <li className="text-foreground leading-relaxed">{children}</li>
            ),
            // Paragraphs: lighter margin so they don't push under the marker
            p: ({ children }) => (
              <p className="mb-3 text-foreground leading-relaxed">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">{children}</strong>
            ),
          }}
        >
          {textToShow}
        </ReactMarkdown>
      </div>
    );
  }

  return <div className={`leading-relaxed whitespace-pre-wrap ${className}`}>{textToShow}</div>;
};
