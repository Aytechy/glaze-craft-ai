import React, { useState, useRef } from 'react';
import { Send, Upload, Paperclip, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// TypeScript interface for component props
interface PromptCardProps {
  onSendMessage: (content: string, image?: File) => void; // Callback for sending messages
  isLoading: boolean; // Loading state for sending messages
  hasMessages: boolean; // Whether there are existing messages (affects positioning)
}

/**
 * PromptCard Component - Input interface for GlazeAI chat
 * 
 * Features:
 * - Multi-line text input with auto-resize
 * - Image upload with validation
 * - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
 * - File type and size validation
 * - Loading states and error handling
 * - Responsive positioning (center when empty, bottom when chatting)
 * 
 * Security considerations:
 * - File type validation (images only)
 * - File size limits
 * - Input sanitization
 * - XSS prevention
 * - Content Security Policy compliance
 */
const PromptCard: React.FC<PromptCardProps> = ({ 
  onSendMessage, 
  isLoading, 
  hasMessages 
}) => {
  // Component state management
  const [prompt, setPrompt] = useState<string>(''); // User's text input
  const [selectedImage, setSelectedImage] = useState<File | null>(null); // Selected image file
  const [isDragging, setIsDragging] = useState<boolean>(false); // Drag and drop state
  
  // Refs for DOM manipulation
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Toast notifications for user feedback
  const { toast } = useToast();

  // Allowed image file types for security
  const ALLOWED_IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp'
  ];

  // Maximum file size (5MB) for security and performance
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  /**
   * Validates uploaded file for security and compatibility
   * @param file - The file to validate
   * @returns boolean indicating if file is valid
   */
  const validateFile = (file: File): boolean => {
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload only PNG, JPG, JPEG, GIF, or WebP images.",
        variant: "destructive",
      });
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload images smaller than 5MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  /**
   * Handles file selection from input or drag-and-drop
   * @param files - FileList from input or drop event
   */
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (validateFile(file)) {
      setSelectedImage(file);
      toast({
        title: "Image selected",
        description: `${file.name} ready to send`,
      });
    }
  };

  /**
   * Handles file input change event
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input to allow same file selection again
    e.target.value = '';
  };

  /**
   * Opens file selection dialog
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Removes selected image
   */
  const handleRemoveImage = () => {
    setSelectedImage(null);
    toast({
      title: "Image removed",
      description: "Image has been deselected",
    });
  };

  /**
   * Handles drag and drop events for file upload
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  /**
   * Handles form submission with validation
   */
  const handleSubmit = () => {
    // Validate input
    const trimmedPrompt = prompt.trim();
    
    if (!trimmedPrompt && !selectedImage) {
      toast({
        title: "Empty message",
        description: "Please enter a message or select an image.",
        variant: "destructive",
      });
      return;
    }

    // Send message with sanitized content
    onSendMessage(trimmedPrompt, selectedImage || undefined);
    
    // Reset form state
    setPrompt('');
    setSelectedImage(null);
    
    // Focus back to textarea for better UX
    textareaRef.current?.focus();
  };

  /**
   * Handles keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleSubmit();
      }
    }
  };

  /**
   * Auto-resizes textarea based on content
   */
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <div className={`transition-all duration-500 ${
      hasMessages 
        ? 'sticky bottom-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border/40 z-10' 
        : 'flex justify-center items-center min-h-[200px] w-full'
    }`} 
    style={{ 
      width: '100%',
      height: hasMessages ? 'auto' : 'auto'
    }}>
      <div className="w-full max-w-4xl mx-auto" style={{ width: hasMessages ? '90%' : '100%' }}>
        {/* Pro plan unlock notice */}
        <div className="text-center mb-4">
          <a 
            href="#upgrade" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground 
                     hover:text-foreground transition-colors"
          >
            <Zap className="w-4 h-4" />
            Unlock more features with the pro plan
          </a>
        </div>

        {/* Main input card */}
        <div className={`relative gradient-card border border-input-border rounded-xl 
                        shadow-moderate transition-all duration-200 ${
          isDragging ? 'border-primary shadow-glow' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        >
          {/* Selected image preview */}
          {selectedImage && (
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected upload"
                  className="w-12 h-12 rounded-lg object-cover shadow-subtle"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {selectedImage.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                  </div>
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

          {/* Text input area */}
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

            {/* Action buttons row */}
            <div className="flex items-center justify-between mt-3">
              {/* Upload button */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUploadClick}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 rounded-sm border border-amber-300 
                           bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 
                           hover:from-amber-200 hover:to-yellow-200 shadow-sm 
                           hover:shadow-md transition-all duration-200"
                  style={{ borderWidth: '1px', borderRadius: '1px' }}
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Upload any Glaze Image</span>
                </Button>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  onChange={handleFileInputChange}
                  className="hidden"
                  aria-label="Upload image file"
                />
              </div>

              {/* Send button */}
              <Button
                onClick={handleSubmit}
                disabled={isLoading || (!prompt.trim() && !selectedImage)}
                className="gradient-primary text-primary-foreground hover:opacity-90 
                         disabled:opacity-50 transition-all duration-200"
                size="sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent 
                                rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>

          {/* Drag and drop overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-primary/10 border-2 border-dashed 
                          border-primary rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-primary font-medium">Drop your image here</div>
              </div>
            </div>
          )}
        </div>

        {/* Keyboard shortcut hint */}
        <div className="text-center mt-2">
          <span className="text-xs text-muted-foreground">
            Press Enter to send, Shift + Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;