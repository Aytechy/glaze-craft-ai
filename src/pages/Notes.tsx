/**
 * Notes Page - Rich text note-taking interface
 * 
 * Features:
 * - Rich text editing with formatting options
 * - Note history sidebar
 * - Auto-save functionality
 * - Responsive design
 * - Clean, focused writing experience
 */

import React, { useState, useRef } from 'react';
import { Bold, Italic, Heading2, Heading3, Save, Plus, Upload, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

// TypeScript interfaces
interface Note {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notes Component - Rich text editor with history
 */
const Notes: React.FC = () => {
  // State management
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [fontSize, setFontSize] = useState<string>('16');
  const [textColor, setTextColor] = useState<string>('#000000');
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Glazing Techniques',
      content: 'Basic glazing techniques for beginners...',
      excerpt: 'Basic glazing techniques for beginners and intermediate potters',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Firing Schedule',
      content: 'Cone 10 firing schedule with detailed temperature ramps...',
      excerpt: 'Cone 10 firing schedule with detailed temperature ramps and hold times',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12'),
    }
  ]);
  
  // Editor refs for content manipulation
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  /**
   * Handle text formatting commands
   */
  const handleFormat = (command: string, value?: string) => {
    if (value) {
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command, false);
    }
    editorRef.current?.focus();
  };

  /**
   * Create a new note
   */
  const handleNewNote = () => {
    const newNote: Note = {
      id: `note_${Date.now()}`,
      title: 'Untitled Note',
      content: '',
      excerpt: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setNotes(prev => [newNote, ...prev]);
    setCurrentNote(newNote);
    setNoteTitle('Untitled Note');
  };

  /**
   * Select a note from history
   */
  const handleSelectNote = (note: Note) => {
    setCurrentNote(note);
    setNoteTitle(note.title);
  };

  /**
   * Save current note
   */
  const handleSave = () => {
    if (!currentNote || !editorRef.current) return;

    const content = editorRef.current.innerHTML;
    const plainText = editorRef.current.textContent || '';
    
    // Extract excerpt from first <p> tag
    const firstParagraph = editorRef.current.querySelector('p');
    const excerptText = firstParagraph ? firstParagraph.textContent || '' : plainText;
    const excerpt = excerptText.substring(0, 100) + (excerptText.length > 100 ? '...' : '');

    const updatedNote = {
      ...currentNote,
      content,
      excerpt,
      title: noteTitle || 'Untitled Note',
      updatedAt: new Date(),
    };

    setNotes(prev => 
      prev.map(note => 
        note.id === currentNote.id ? updatedNote : note
      )
    );
    setCurrentNote(updatedNote);
  };

  /**
   * Handle content changes
   */
  const handleContentChange = () => {
    // Auto-save functionality could be implemented here
  };

  /**
   * Handle title changes
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoteTitle(e.target.value);
    if (currentNote) {
      setCurrentNote(prev => prev ? { ...prev, title: e.target.value } : null);
    }
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Handle image upload logic here
      console.log('Uploading image:', file.name);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      <Header onToggleSidebar={handleToggleSidebar} />
      
      {/* Backdrop blur for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
        />
        
        <div className={`flex-1 flex transition-all duration-300 ${
          window.innerWidth >= 768 && isSidebarOpen ? 'ml-[250px]' : 'ml-0'
        }`}
        style={{
          marginLeft: window.innerWidth >= 768 && isSidebarOpen ? '250px' : '0'
        }}>
        {/* Main editor area */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="border-b border-border/40 bg-background/95 backdrop-blur">
            <div className="container flex h-14 items-center justify-between px-4 md:px-6 lg:px-8">
              <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFormat('bold')}
                  className="text-foreground hover:bg-accent flex-shrink-0"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFormat('italic')}
                  className="text-foreground hover:bg-accent"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFormat('formatBlock', 'h2')}
                  className="text-foreground hover:bg-accent"
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFormat('formatBlock', 'h3')}
                  className="text-foreground hover:bg-accent"
                >
                  <Heading3 className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <select 
                  value={fontSize} 
                  onChange={(e) => {
                    setFontSize(e.target.value);
                    handleFormat('fontSize', e.target.value);
                  }}
                  className="px-2 py-1 text-sm border rounded bg-background hidden sm:block"
                >
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                  <option value="24">24px</option>
                </select>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    handleFormat('foreColor', e.target.value);
                  }}
                  className="w-8 h-8 border rounded cursor-pointer hidden sm:block"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor="file-upload">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gradient-primary text-primary-foreground hover:opacity-90 border-primary/20"
                    asChild
                  >
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Upload any Glaze Image</span>
                    </span>
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={handleSave}
                  className="gradient-primary text-primary-foreground hover:opacity-90"
                  size="sm"
                >
                  <Save className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Save</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Editor content */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-4">
              {currentNote ? (
                <>
                  {/* Title Input */}
                  <Input
                    ref={titleRef}
                    value={noteTitle}
                    onChange={handleTitleChange}
                    placeholder="Note title..."
                    className="text-3xl font-bold border-none px-0 bg-transparent focus-visible:ring-0 text-foreground"
                    style={{ fontSize: '32px', color: '#000000' }}
                  />
                  
                  {/* Content Editor */}
                  <div
                    ref={editorRef}
                    contentEditable
                    className="min-h-96 p-6 rounded-lg border border-border/40 bg-card text-card-foreground 
                             focus:outline-none focus:ring-2 focus:ring-ring text-base leading-relaxed"
                    style={{ minHeight: 'calc(100vh - 300px)' }}
                    dangerouslySetInnerHTML={{ __html: currentNote.content }}
                    onInput={handleContentChange}
                    data-placeholder="Start writing your note..."
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Welcome to Notes
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Create and organize your pottery notes, glazing recipes, and firing schedules.
                  </p>
                  <Button
                    onClick={handleNewNote}
                    className="gradient-primary text-primary-foreground hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Note
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Notes history sidebar */}
        <aside className="w-80 lg:w-96 border-l border-border/40 bg-background/50 backdrop-blur hidden lg:block">
          <div className="p-4 border-b border-border/40">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Notes</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewNote}
                className="text-foreground hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            {notes.map((note) => (
              <Card
                key={note.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-moderate ${
                  currentNote?.id === note.id 
                    ? 'bg-accent/50 border-primary/50 shadow-moderate' 
                    : 'hover:bg-accent/20'
                }`}
                onClick={() => handleSelectNote(note)}
              >
                <CardContent className="p-4">
                  <h4 className="font-medium text-foreground text-sm mb-2 line-clamp-1">
                    {note.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {note.excerpt}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {note.updatedAt.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </aside>
        </div>
      </div>
    </div>
  );
};

export default Notes;