import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ClipboardUploadProps {
  onImagePaste: (file: File) => void;
  children: React.ReactNode;
}

export const ClipboardUpload: React.FC<ClipboardUploadProps> = ({ onImagePaste, children }) => {
  const { toast } = useToast();

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!e.clipboardData) return;

      const items = Array.from(e.clipboardData.items);
      const imageItem = items.find(item => item.type.startsWith('image/'));

      if (imageItem) {
        e.preventDefault();
        
        const file = imageItem.getAsFile();
        if (!file) return;

        // Security checks
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: "Please paste a valid image (JPEG, PNG, GIF, or WebP)",
            variant: "destructive",
          });
          return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: "Image must be smaller than 5MB",
            variant: "destructive",
          });
          return;
        }

        // Sanitize filename
        const sanitizedName = `pasted-image-${Date.now()}.${file.type.split('/')[1]}`;
        const sanitizedFile = new File([file], sanitizedName, { type: file.type });

        onImagePaste(sanitizedFile);
        
        toast({
          title: "Image pasted",
          description: "Image has been added to your message",
        });
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [onImagePaste, toast]);

  return <>{children}</>;
};