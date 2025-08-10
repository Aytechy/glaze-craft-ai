import React, { useEffect, useRef } from 'react';
import { useTypingEffect } from '@/hooks/useTypingEffect';

interface TypingMessageProps {
  content: string
  speed?: number
  delay?: number
  onComplete?: () => void
  className?: string
}

export const TypingMessage: React.FC<TypingMessageProps> = ({
  content,
  speed,
  delay,
  onComplete,
  className = '',
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

  return (
    <div className={`leading-relaxed whitespace-pre-wrap ${className}`}>
      {isTyping ? displayedText : content}
    </div>
  );
};
