import React from 'react';
import { Copy, Edit, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface MessageActionsProps {
  content: string;
  messageType: 'user' | 'ai';
  onEdit?: (content: string) => void;
  className?: string;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  messageType,
  onEdit,
  className = '',
}) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(content);
    }
  };

  return (
    <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
            <Copy className="h-3 w-3 mr-2" />
            Copy
          </DropdownMenuItem>
          {messageType === 'user' && (
            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              <Edit className="h-3 w-3 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};