import React, { useState } from 'react';
import { Search, MessageCircle, Clock, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  messageCount: number;
  lastActivity: Date;
  tags?: string[];
}

const History: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Glaze Recipe for Stoneware',
      preview: 'I need help creating a cone 10 reduction glaze that...',
      messageCount: 15,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      tags: ['glaze', 'stoneware']
    },
    {
      id: '2',
      title: 'Pottery Wheel Centering',
      preview: 'What are the best techniques for centering clay on the wheel?',
      messageCount: 8,
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      tags: ['wheel', 'technique']
    },
    {
      id: '3',
      title: 'Kiln Temperature Control',
      preview: 'My kiln is firing unevenly. The top shelf reaches cone 10...',
      messageCount: 12,
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      tags: ['kiln', 'firing']
    },
    {
      id: '4',
      title: 'Bisque Firing Issues',
      preview: 'Some pieces are cracking during bisque firing...',
      messageCount: 6,
      lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      tags: ['bisque', 'cracking']
    },
  ]);

  const { toast } = useToast();

  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteSession = (sessionId: string) => {
    toast({
      title: "Chat deleted",
      description: "The chat session has been removed from your history.",
    });
  };

  const handleOpenSession = (sessionId: string) => {
    // Navigate to the chat with this session
    window.location.href = `/assistant?session=${sessionId}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-6xl mx-auto p-4 pt-20 pb-24">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Chat History</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Browse and resume your previous conversations with GlazeAI. Find specific discussions 
              about glazes, firing techniques, and pottery advice.
            </p>
          </div>

          {/* Search Section */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Chat Sessions Grid */}
          {filteredSessions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No conversations found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Try adjusting your search terms or start a new conversation."
                    : "Start your first conversation with GlazeAI to see it here."
                  }
                </p>
                <Button 
                  onClick={() => window.location.href = '/assistant'}
                  className="gradient-primary text-primary-foreground hover:opacity-90"
                >
                  Start New Chat
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSessions.map((session) => (
                <Card 
                  key={session.id}
                  className="group cursor-pointer transition-all hover:shadow-elevated border-border/40"
                  onClick={() => handleOpenSession(session.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-2 mb-1">
                          {session.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(session.lastActivity, { addSuffix: true })}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-2 mb-4">
                      {session.preview}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {session.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {session.tags && session.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{session.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageCircle className="h-3 w-3" />
                        <span>{session.messageCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;