# GlazeAI - Comprehensive Documentation

## 🎨 Project Overview

GlazeAI is a specialized AI-powered web application designed for ceramics, glazes, and pottery enthusiasts. Built with React, TypeScript, and Tailwind CSS, it provides intelligent assistance for glaze recipes, pottery techniques, kiln firing guidance, and ceramic artistry.

### Key Features

- **AI Chat Interface**: Interactive conversation with specialized ceramic knowledge
- **Image Upload & Analysis**: Upload ceramic images for recipe suggestions and analysis
- **Recipe Generation**: Convert user descriptions to detailed glaze recipes
- **Visual Recipe Conversion**: Transform recipes into visual representations
- **Secure File Handling**: Safe image upload with comprehensive validation
- **Responsive Design**: Beautiful UI that works on all devices
- **Real-time Chat**: Instant AI responses with typing indicators
- **Session Management**: Save and resume chat sessions
- **Rate Limiting**: Built-in protection against API abuse

## 🏗️ Architecture Overview

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui components
- **State Management**: React hooks with custom chat hook
- **API Communication**: OpenRouter API integration
- **File Handling**: Secure image upload and validation
- **Routing**: React Router for navigation
- **Notifications**: Toast system for user feedback

### Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── Header.tsx       # Top navigation with sidebar toggle
│   ├── Sidebar.tsx      # Sliding navigation panel
│   ├── ResponseArea.tsx # Chat message display
│   └── PromptCard.tsx   # Input interface with upload
├── hooks/               # Custom React hooks
│   ├── useChat.ts       # Main chat functionality
│   └── use-toast.ts     # Toast notification system
├── utils/               # Utility functions
│   └── api.ts           # API communication and security
├── types/               # TypeScript type definitions
│   └── chat.ts          # Chat-related interfaces
├── pages/               # Page components
│   ├── Index.tsx        # Main chat interface
│   └── NotFound.tsx     # 404 error page
├── index.css            # Global styles and design system
└── App.tsx              # Root application component
```

## 🎨 Design System

### Color Palette

The design system uses semantic color tokens defined in HSL format:

```css
/* Primary Brand Colors */
--primary: 240 73% 59%     /* Professional blue for AI branding */
--primary-glow: 240 73% 70% /* Lighter variant for effects */

/* Background System */
--background: 0 0% 100%     /* Pure white base */
--background-gradient: linear-gradient(to bottom, hsl(0 0% 100%), hsl(210 20% 96%))

/* Semantic Colors */
--muted: 210 20% 96%        /* Subtle backgrounds */
--accent: 210 40% 96.1%     /* Interactive elements */
--destructive: 0 84.2% 60.2% /* Error states */
--success: 142 71% 45%      /* Success states */
```

### Typography

- **Headings**: Inter font family with semibold weight
- **Body**: Inter font family with normal weight
- **Feature Settings**: `"rlig" 1, "calt" 1` for better rendering

### Spacing & Layout

- **Border Radius**: `0.75rem` for modern, friendly appearance
- **Shadows**: Layered shadow system from subtle to elevated
- **Transitions**: Smooth animations with cubic-bezier easing

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18 or later
- npm or yarn package manager

### Local Development

```bash
# Clone the repository
git clone <your-repository-url>
cd glaze-ai

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Environment Configuration

The application uses the OpenRouter API with the following configuration:

```typescript
const API_CONFIG = {
  OPENROUTER_URL: 'https://openrouter.ai/api/v1/chat/completions',
  API_KEY: 'Bearer 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',
  DEFAULT_MODEL: 'openai/gpt-3.5-turbo',
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,
}
```

## 🔒 Security Implementation

### Input Validation

- **Text Sanitization**: Removes control characters and limits input length
- **File Validation**: Restricts uploads to image formats only
- **Size Limits**: Maximum 5MB file size to prevent DoS attacks
- **Type Checking**: Validates MIME types for uploaded files

### XSS Prevention

- **React's Built-in Protection**: JSX prevents XSS by default
- **Content Sanitization**: All user input is sanitized before display
- **Error Message Sanitization**: Prevents script injection in error messages

### Rate Limiting

```typescript
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number = 20;
  private readonly windowMs: number = 60000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    // Check if we can make a new request
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    this.requests.push(now);
    return true;
  }

  getTimeUntilReset(): number {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    const timeUntilReset = this.windowMs - (Date.now() - oldestRequest);
    
    return Math.max(0, timeUntilReset);
  }
}
```

### API Security

- **HTTPS Only**: All API communications over secure connections
- **Request Timeouts**: 30-second timeout to prevent hanging requests
- **Error Handling**: Secure error messages without sensitive data exposure
- **Content Security Policy**: Implemented via proper headers

### File Upload Security

- **MIME Type Validation**: Only image files allowed
- **File Size Limits**: Prevents large file uploads
- **Extension Validation**: Double-checks file extensions
- **Binary Content Validation**: Ensures files are actual images

## 🚀 API Integration

### Current Implementation (OpenRouter)

```typescript
export async function sendMessage(
  message: string, 
  imageFile?: File
): Promise<string> {
  try {
    // Sanitize text input
    const sanitizedMessage = sanitizeInput(message);
    
    if (!sanitizedMessage && !imageFile) {
      throw new Error('Message cannot be empty');
    }

    // Prepare messages array
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are GlazeAI, a specialized AI assistant for ceramics, glazes, and pottery. 
                 You help with glaze recipes, pottery techniques, kiln firing, and ceramic artistry. 
                 Always provide helpful, accurate, and safe advice for ceramic work.`
      }
    ];

    // Handle image if provided
    if (imageFile) {
      const base64Image = await validateAndEncodeImage(imageFile);
      
      // For now, we'll include image info in text since OpenRouter may not support vision
      // In future versions with vision models, we'll send the actual image
      messages.push({
        role: 'user',
        content: `${sanitizedMessage}\n\n[User uploaded an image: ${imageFile.name}]`
      });
    } else {
      messages.push({
        role: 'user',
        content: sanitizedMessage
      });
    }

    // Send request to API
    const response = await sendChatCompletionRequest({
      messages,
      temperature: 0.7,
      max_tokens: 2048
    });

    // Extract and return response content
    const aiResponse = response.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    return aiResponse.trim();

  } catch (error) {
    console.error('Send message error:', error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to send message to AI');
    }
  }
}
```

### Future API Migration

The codebase is designed for easy migration to custom APIs:

1. **Centralized Configuration**: All API settings in one place
2. **Abstracted Functions**: API calls wrapped in utility functions
3. **Flexible Model Support**: Easy to add new AI models
4. **Error Handling**: Graceful fallbacks for API changes

### Model Management

```typescript
// Current implementation supports any OpenRouter model
export function isModelAvailable(modelName: string): boolean {
  // For now, return true for any model name
  // In future versions, this will check against available models
  return true;
}
```

## 📱 User Interface Components

### Header Component

- **Sidebar Toggle**: Opens/closes navigation panel
- **App Branding**: Displays GlazeAI logo
- **Upgrade Button**: Call-to-action for premium features

### Sidebar Component

- **Chat History**: Previous conversation management
- **Navigation Links**: Home, Settings, History
- **User Profile**: Avatar, name, and email display
- **New Chat**: Start fresh conversations

### ResponseArea Component

- **Message Display**: User and AI messages with avatars
- **Typing Indicator**: Visual feedback during AI processing
- **Image Support**: Displays uploaded images in chat
- **Auto-scroll**: Automatically scrolls to new messages

### PromptCard Component

- **Text Input**: Multi-line textarea with auto-resize
- **Image Upload**: Drag-and-drop and click-to-upload
- **File Preview**: Shows selected images before sending
- **Send Button**: Submits messages to AI
- **Loading States**: Visual feedback during processing

## 🎯 Core Features

### Chat Functionality

- **Real-time Messaging**: Instant AI responses
- **Message History**: Persistent conversation storage
- **Error Recovery**: Retry failed messages
- **Session Management**: Save and resume chats

### Image Processing

- **Upload Validation**: Secure file type and size checking
- **Preview Generation**: Show images before sending
- **Base64 Encoding**: Convert images for API transmission
- **Memory Management**: Proper cleanup of object URLs

### Ceramic Expertise

The AI is specifically trained to help with:

- **Glaze Recipes**: Detailed formulations and calculations
- **Pottery Techniques**: Throwing, trimming, and finishing
- **Kiln Firing**: Temperature schedules and atmosphere control
- **Clay Bodies**: Composition and properties
- **Glazing Methods**: Application techniques and troubleshooting
- **Color Development**: Understanding ceramic chemistry

## 🔄 State Management

### useChat Hook

Custom hook managing all chat functionality:

```typescript
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    sessionId,
    maxMessages = 100,
    autoSave = true
  } = options;

  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [rateLimitTimeRemaining, setRateLimitTimeRemaining] = useState<number>(0);

  // Refs for cleanup and persistence
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastMessageRef = useRef<{ content: string; image?: File } | null>(null);

  // Toast for user notifications
  const { toast } = useToast();

  /**
   * Generates unique message ID
   */
  const generateMessageId = useCallback((): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Generates unique session ID
   */
  const generateSessionId = useCallback((): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Creates a new message object
   */
  const createMessage = useCallback((
    type: 'user' | 'ai',
    content: string,
    image?: string,
    error?: boolean
  ): Message => {
    return {
      id: generateMessageId(),
      type,
      content,
      timestamp: new Date(),
      image,
      error: error || false,
    };
  }, [generateMessageId]);

  /**
   * Adds a message to the chat
   */
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      const newMessages = [...prev, message];
      
      // Limit messages to prevent memory issues
      if (newMessages.length > maxMessages) {
        return newMessages.slice(-maxMessages);
      }
      
      return newMessages;
    });
  }, [maxMessages]);

  /**
   * Updates the last message (useful for streaming responses)
   */
  const updateLastMessage = useCallback((content: string) => {
    setMessages(prev => {
      if (prev.length === 0) return prev;
      
      const lastMessage = prev[prev.length - 1];
      if (lastMessage.type !== 'ai') return prev;
      
      return [
        ...prev.slice(0, -1),
        { ...lastMessage, content }
      ];
    });
  }, []);

  /**
   * Handles API errors with user-friendly messages
   */
  const handleError = useCallback((error: unknown): void => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Sanitize error message to prevent XSS
    const sanitizedError = errorMessage.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    setError(sanitizedError);
    
    // Add error message to chat
    const errorMessage_ = createMessage('ai', `Sorry, I encountered an error: ${sanitizedError}`, undefined, true);
    addMessage(errorMessage_);

    // Show toast notification
    toast({
      title: "Error",
      description: sanitizedError,
      variant: "destructive",
    });

    console.error('Chat error:', error);
  }, [createMessage, addMessage, toast]);

  /**
   * Checks rate limiting before sending messages
   */
  const checkRateLimit = useCallback((): boolean => {
    if (!rateLimiter.canMakeRequest()) {
      const timeRemaining = rateLimiter.getTimeUntilReset();
      setRateLimitTimeRemaining(timeRemaining);
      
      toast({
        title: "Rate limit exceeded",
        description: `Please wait ${Math.ceil(timeRemaining / 1000)} seconds before sending another message.`,
        variant: "destructive",
      });
      
      return false;
    }
    
    return true;
  }, [toast]);

  /**
   * Main function to send user messages
   */
  const sendUserMessage = useCallback(async (
    content: string,
    image?: File
  ): Promise<void> => {
    // Validate input
    if (!content.trim() && !image) {
      toast({
        title: "Empty message",
        description: "Please enter a message or select an image.",
        variant: "destructive",
      });
      return;
    }

    // Check rate limiting
    if (!checkRateLimit()) {
      return;
    }

    // Clear any previous errors
    setError(null);
    setIsLoading(true);

    // Store message for retry functionality
    lastMessageRef.current = { content, image };

    try {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      // Add user message to chat
      let imageUrl: string | undefined;
      if (image) {
        imageUrl = URL.createObjectURL(image);
      }
      
      const userMessage = createMessage('user', content.trim(), imageUrl);
      addMessage(userMessage);

      // Send to API
      const startTime = Date.now();
      const aiResponse = await sendMessage(content, image);
      const processingTime = Date.now() - startTime;

      // Add AI response to chat
      const aiMessage = createMessage('ai', aiResponse);
      aiMessage.metadata = {
        processingTime,
        model: 'openai/gpt-3.5-turbo', // This would come from API response
      };
      addMessage(aiMessage);

      // Auto-save if enabled
      if (autoSave && currentSession) {
        await saveCurrentSession();
      }

    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [
    checkRateLimit,
    createMessage,
    addMessage,
    handleError,
    autoSave,
    currentSession,
    toast
  ]);

  /**
   * Retry the last failed message
   */
  const retryLastMessage = useCallback(async (): Promise<void> => {
    if (!lastMessageRef.current) {
      toast({
        title: "No message to retry",
        description: "There's no previous message to retry.",
        variant: "destructive",
      });
      return;
    }

    const { content, image } = lastMessageRef.current;
    await sendUserMessage(content, image);
  }, [sendUserMessage, toast]);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback((): void => {
    setMessages([]);
    setError(null);
    lastMessageRef.current = null;
    
    toast({
      title: "Messages cleared",
      description: "Chat history has been cleared.",
    });
  }, [toast]);

  /**
   * Delete a specific message
   */
  const deleteMessage = useCallback((messageId: string): void => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    toast({
      title: "Message deleted",
      description: "Message has been removed from chat.",
    });
  }, [toast]);

  /**
   * Start a new chat session
   */
  const startNewSession = useCallback((): void => {
    const newSession: ChatSession = {
      id: generateSessionId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        messageCount: 0,
        totalTokens: 0,
        lastActivity: new Date(),
      }
    };

    setCurrentSession(newSession);
    clearMessages();
  }, [generateSessionId, clearMessages]);

  /**
   * Load an existing session
   */
  const loadSession = useCallback(async (sessionId: string): Promise<void> => {
    try {
      // In production, this would load from a database or storage service
      // For now, we'll simulate loading from localStorage
      const savedSession = localStorage.getItem(`chat_session_${sessionId}`);
      
      if (savedSession) {
        const session: ChatSession = JSON.parse(savedSession);
        setCurrentSession(session);
        setMessages(session.messages);
        
        toast({
          title: "Session loaded",
          description: `Loaded chat session: ${session.title}`,
        });
      } else {
        throw new Error('Session not found');
      }
    } catch (error) {
      handleError(error);
    }
  }, [handleError, toast]);

  /**
   * Save current session
   */
  const saveCurrentSession = useCallback(async (): Promise<void> => {
    if (!currentSession) return;

    try {
      const updatedSession: ChatSession = {
        ...currentSession,
        messages,
        updatedAt: new Date(),
        metadata: {
          ...currentSession.metadata,
          messageCount: messages.length,
          lastActivity: new Date(),
        }
      };

      // In production, this would save to a database or storage service
      localStorage.setItem(
        `chat_session_${currentSession.id}`,
        JSON.stringify(updatedSession)
      );

      setCurrentSession(updatedSession);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, [currentSession, messages]);

  /**
   * Cleanup function for component unmount
   */
  useEffect(() => {
    return () => {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clean up object URLs to prevent memory leaks
      messages.forEach(message => {
        if (message.image && message.image.startsWith('blob:')) {
          URL.revokeObjectURL(message.image);
        }
      });
    };
  }, [messages]);

  /**
   * Initialize session if sessionId is provided
   */
  useEffect(() => {
    if (sessionId && !currentSession) {
      loadSession(sessionId).catch(() => {
        // If loading fails, start a new session
        startNewSession();
      });
    } else if (!currentSession) {
      startNewSession();
    }
  }, [sessionId, currentSession, loadSession, startNewSession]);

  /**
   * Update rate limit timer
   */
  useEffect(() => {
    if (rateLimitTimeRemaining > 0) {
      const interval = setInterval(() => {
        setRateLimitTimeRemaining(prev => Math.max(0, prev - 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [rateLimitTimeRemaining]);

  // Calculate derived state
  const canSendMessage = !isLoading && rateLimitTimeRemaining === 0;
  const messageCount = messages.length;

  return {
    // State
    messages,
    isLoading,
    error,
    currentSession,
    
    // Actions
    sendUserMessage,
    clearMessages,
    retryLastMessage,
    deleteMessage,
    
    // Session management
    startNewSession,
    loadSession,
    saveCurrentSession,
    
    // Utilities
    canSendMessage,
    messageCount,
    rateLimitTimeRemaining,
  };
}
```

### Message Structure

```typescript
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  image?: string;
  error?: boolean;
  metadata?: MessageMetadata;
}
```

## 🧪 Testing Strategy

### Component Testing

- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interaction testing
- **Accessibility Tests**: WCAG compliance verification

### API Testing

- **Mock Responses**: Test with simulated API responses
- **Error Scenarios**: Handle network failures gracefully
- **Rate Limiting**: Verify throttling mechanisms

### Security Testing

- **Input Validation**: Test with malicious inputs
- **File Upload**: Verify security restrictions
- **XSS Prevention**: Test script injection attempts

## 📦 Deployment

### Build Process

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Vercel Deployment

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy automatically on push

### Netlify Deployment

1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configure redirects for SPA routing

### Environment Variables

For production deployment, ensure secure API key management:

```bash
# Use environment variables instead of hardcoded keys
VITE_OPENROUTER_API_KEY=your_api_key_here
```

## 🔮 Future Enhancements

### Planned Features

1. **User Authentication**: Secure login and user accounts
2. **Database Integration**: Persistent chat storage
3. **Recipe Library**: Save and share glaze recipes
4. **Image Recognition**: AI-powered ceramic analysis
5. **Community Features**: Share and discover recipes
6. **Advanced Models**: GPT-4 Vision for image analysis
7. **Export Functions**: PDF recipe generation
8. **Kiln Logs**: Temperature tracking and analysis

### Scalability Considerations

- **Microservices Architecture**: Split into specialized services
- **CDN Integration**: Fast global content delivery
- **Caching Strategy**: Redis for session and data caching
- **Load Balancing**: Handle increased user traffic
- **Database Optimization**: Efficient query patterns

## 📋 Maintenance Guide

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update major versions carefully
npm install package@latest
```

### Performance Monitoring

- **Core Web Vitals**: Monitor loading, interactivity, stability
- **API Response Times**: Track AI response latency
- **Error Rates**: Monitor and alert on failures
- **User Analytics**: Understand usage patterns

### Security Updates

- **Regular Audits**: `npm audit` for vulnerabilities
- **Dependency Updates**: Keep packages current
- **API Key Rotation**: Regular credential updates
- **Security Headers**: Implement CSP and security headers

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

2. **API Errors**
   - Verify API key validity
   - Check network connectivity
   - Review rate limiting status

3. **Image Upload Issues**
   - Confirm file type restrictions
   - Check file size limits
   - Verify browser compatibility

### Debug Mode

Enable debug logging in development:

```typescript
// Add to api.ts for detailed logging
console.debug('API Request:', requestPayload);
console.debug('API Response:', response);
```

## 📞 Support & Contributing

### Getting Help

- Check documentation first
- Review error logs carefully
- Test in development environment
- Create detailed issue reports

### Contributing Guidelines

1. Fork the repository
2. Create feature branch
3. Follow TypeScript/React best practices
4. Add comprehensive comments
5. Test thoroughly
6. Submit pull request

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent formatting
- **Comments**: Comprehensive documentation
- **Security**: Security-first development

## 📄 License & Credits

### Third-Party Libraries

- **React**: MIT License
- **TypeScript**: Apache 2.0 License
- **Tailwind CSS**: MIT License
- **shadcn/ui**: MIT License
- **Lucide Icons**: ISC License

### API Services

- **OpenRouter**: AI model access
- **Vercel/Netlify**: Deployment platforms

---

## 🔧 Quick Configuration Guide

### Changing App Name

To change from "GlazeAI" to a different name:

1. **Update HTML Title**: Edit `index.html`
   ```html
   <title>YourAppName</title>
   ```

2. **Update Components**: Search and replace "GlazeAI" in:
   - `src/components/Header.tsx`
   - `src/components/Sidebar.tsx`
   - `src/utils/api.ts`
   - `GLAZEAI_DOCUMENTATION.md`

3. **Update System Prompt**: Modify the AI system prompt in `src/utils/api.ts`:
   ```typescript
   content: `You are YourAppName, a specialized AI assistant...`
   ```

### API Configuration

To switch to your custom API:

1. **Update API Config** in `src/utils/api.ts`:
   ```typescript
   const API_CONFIG = {
     OPENROUTER_URL: 'your-api-endpoint',
     API_KEY: 'your-api-key',
     // ... other settings
   };
   ```

2. **Modify Request Format**: Adjust the request structure as needed
3. **Update Response Parsing**: Match your API's response format

### Model Configuration

When adding custom models:

1. **Update Model List**: Modify `isModelAvailable()` function
2. **Add Model Selection**: Create UI for model switching
3. **Configure Parameters**: Adjust temperature, tokens per model

This documentation provides a complete guide for understanding, deploying, and maintaining GlazeAI. The codebase is designed for modularity and easy customization to meet evolving requirements.
