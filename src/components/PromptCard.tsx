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
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
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
    <>
      {/* Global overlay when dragging files */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-primary font-medium">Drop your image here</div>
          </div>
        </div>
      )}

      {/* Prompt area wrapper */}
      <div className={`w-full transition-all duration-500 ${hasMessages ? 'bottom-0 left-0 right-0 p-3 z-10' : 'flex justify-center items-center min-h-[200px]'}`}>
        <div className="w-full max-w-4xl mx-auto px-0 md:px-0">
          
          {/* Upsell link — centered, with top padding only before conversation starts */}
          <div className={`${hasMessages ? "pt-0" : "pt-1"} text-center`}>
            <a
              href="#upgrade"
              className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Zap className="w-4 h-4" />
              Unlock more features with the pro plan
            </a>
          </div>

          {/* Input card */}
          <div
            className={`relative ${hasMessages ? 'bg-card border-border' : 'gradient-card border-input-border'} 
                       border rounded-xl shadow-moderate transition-all duration-200`}
          >
            {/* Selected image preview */}
            {selectedImage && (
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    className="w-12 h-12 rounded-lg object-cover shadow-subtle"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{selectedImage.name}</div>
                    <div className="text-xs text-muted-foreground">{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}

            {/* Text input */}
            <div className="p-4">
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about ceramics, glazes, and pottery..."
                className="min-h-[60px] max-h-[120px] resize-none border-0 bg-transparent 
                           focus-visible:ring-0 focus-visible:ring-offset-0 text-base
                           placeholder:text-muted-foreground overflow-y-auto"
                disabled={isLoading}
              />

              {/* Bottom row: Upload + Notes + Send */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUploadClick}
                    disabled={isLoading}
                    className="flex items-center gap-2 border-primary/20 text-primary 
                             hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:block">Upload any Glaze Image</span>
                  </Button>

                  <div className="md:hidden">
                    <NotesToggle />
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(',')}
                    onChange={handleFileInputChange}
                    className="hidden"
                    aria-label="Upload image file"
                  />
                </div>

                {/* Send Button - disabled only during typing */}
                <Button
                  onClick={handleSubmit}
                  disabled={isTyping || isLoading || (!prompt.trim() && !selectedImage)}
                  className="gradient-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all duration-200"
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
            </div>
          </div>

          {/* Keyboard shortcut hint */}
          <p className="hidden md:block text-xs text-muted-foreground mt-1 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>

        </div>
      </div>
    </>
  );
};

export default PromptCard;
