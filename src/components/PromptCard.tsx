/**
 * PromptCard Component - Enhanced chat input with global drag-and-drop
 *
 * Enhancements:
 * - Full-screen drag-and-drop overlay
 * - Only the Send button is disabled during AI typing
 * - Upload, paste, and textarea remain usable
 * - Works with or without previous messages
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Paperclip, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { NotesToggle } from '@/components/NotesToggle';

interface PromptCardProps {
  onSendMessage: (content: string, image?: File) => void;
  isLoading: boolean;
  isTyping: boolean; // NEW: AI typing state
  hasMessages: boolean;
}

const PromptCard: React.FC<PromptCardProps> = ({
  onSendMessage,
  isLoading,
  isTyping,
  hasMessages
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false); // Global drag state

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  
  const validateFile = (file: File): boolean => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload only PNG, JPG, JPEG, GIF, or WebP images.",
        variant: "destructive"
      });
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload images smaller than 5MB.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (validateFile(file)) {
      setSelectedImage(file);
      toast({
        title: "Image selected",
        description: `${file.name} ready to send`
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    e.target.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    toast({ title: "Image removed", description: "Image has been deselected" });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 120);
    textarea.style.height = `${newHeight}px`;
  };

  const handleSubmit = () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt && !selectedImage) {
      toast({ title: "Empty message", description: "Please enter a message or select an image.", variant: "destructive" });
      return;
    }
    onSendMessage(trimmedPrompt, selectedImage || undefined);
    setPrompt('');
    setSelectedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !isTyping) {
        handleSubmit();
      }
    }
  };

  // Drag and drop (global overlay)
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer?.files || null);
  };
  
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const onFocus = () => {
      // Small delay so browser finishes keyboard animation before scrolling
      setTimeout(() => {
        el.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }, 50);
    };

    el.addEventListener('focus', onFocus);
    return () => el.removeEventListener('focus', onFocus);
  }, []);
  
  // Global listeners for drag events
  useEffect(() => {
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  
  return (
    <div className="w-full px-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative bg-card border rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 ease-out">
          {/* Left action buttons */}
          <div className="flex items-center gap-2 mb-3">
            <Button
              onClick={handleUploadClick}
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full p-0 hover:bg-muted/80 flex-shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span className="sr-only">Upload image</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-3 py-1 rounded-full text-sm hover:bg-muted/80 flex items-center gap-2"
            >
              <div className="w-4 h-4 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/60" />
              </div>
              Public
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-3 py-1 rounded-full text-sm hover:bg-muted/80 flex items-center gap-2"
            >
              <div className="w-4 h-4 rounded bg-green-500 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              Supabase
              <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>

          {/* Main input area with send button positioned at bottom right */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Lovable to create a dashboard to..."
              className="w-full min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent 
                         focus-visible:ring-0 focus-visible:ring-offset-0 text-base
                         placeholder:text-muted-foreground overflow-y-auto transition-all duration-200
                         leading-relaxed py-1 pr-12"
              disabled={isLoading}
              rows={1}
              style={{ height: '40px' }}
            />
            
            {/* Send button positioned at bottom right */}
            <Button
              onClick={handleSubmit}
              disabled={isTyping || isLoading || !prompt.trim()}
              className="absolute bottom-1 right-1 h-8 w-8 rounded-full p-0 bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all duration-200"
              size="sm"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default PromptCard;
