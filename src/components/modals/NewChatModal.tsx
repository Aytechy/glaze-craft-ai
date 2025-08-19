import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ 
  isOpen, 
  onClose, 
  onNewChat 
}) => {
  const { toast } = useToast();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreateNewChat = () => {
    onNewChat();
    onClose();
    toast({
      title: "New chat started",
      description: "You can now start a fresh conversation.",
    });
  };

  const chatTemplates = [
    {
      title: "General Pottery Help",
      description: "Ask questions about pottery techniques, tools, and processes",
      icon: MessageSquare,
    },
    {
      title: "Glaze Recipes",
      description: "Get help with glaze formulations and combinations",
      icon: MessageSquare,
    },
    {
      title: "Firing Techniques",
      description: "Learn about kiln firing, temperatures, and schedules",
      icon: MessageSquare,
    },
    {
      title: "Troubleshooting",
      description: "Solve problems with cracking, warping, and other issues",
      icon: MessageSquare,
    },
  ];

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 99998 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal container */}
      <div 
        className="bg-background border border-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Plus className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Start New Chat</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-muted-foreground mb-6">
            Begin a fresh conversation with GlazeAI. Your current chat will be saved automatically.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chatTemplates.map((template) => (
                <Button
                  key={template.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent/50 transition-colors"
                  onClick={handleCreateNewChat}
                >
                  <div className="flex items-center gap-2 w-full">
                    <template.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium text-left">{template.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground text-left">
                    {template.description}
                  </span>
                </Button>
              ))}
            </div>

            <div className="border-t pt-4">
              <Button
                onClick={handleCreateNewChat}
                className="w-full gradient-primary text-primary-foreground hover:opacity-90"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start Fresh Conversation
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-accent/20 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Your current conversation will be automatically saved to your chat history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Use createPortal to render modal outside the component tree
  return createPortal(modalContent, document.body);
};