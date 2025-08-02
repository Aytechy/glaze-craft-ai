import React, { useEffect } from 'react';
import { useTypingEffect } from '@/hooks/useTypingEffect';

interface TypingMessageProps {
  content: string;
  onComplete?: () => void;
  speed?: number; // Characters per second (default: 50 - fast typing)
  delay?: number; // Initial delay before typing starts
  className?: string;
}

export const TypingMessage: React.FC<TypingMessageProps> = ({
  content,
  onComplete,
  speed = 50, // Fast typing speed
  delay = 100,
  className = ''
}) => {
  const { displayedText, isTyping, startTyping } = useTypingEffect({
    speed,
    delay,
    onComplete
  });

  useEffect(() => {
    if (content) {
      startTyping(content);
    }
  }, [content, startTyping]);

  return (
    <div className={`leading-relaxed whitespace-pre-wrap ${className}`}>
      {displayedText}
      {isTyping && (
        <span className="inline-block w-1 h-4 bg-current ml-1 animate-pulse" />
      )}
    </div>
  );
};