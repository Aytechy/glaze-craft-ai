import React from 'react';
import { Plus, MessageSquare, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Plus className="h-6 w-6 text-primary" />
            Start New Chat
          </DialogTitle>
          <DialogDescription>
            Begin a fresh conversation with GlazeAI. Your current chat will be saved automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
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
      </DialogContent>
    </Dialog>
  );
};