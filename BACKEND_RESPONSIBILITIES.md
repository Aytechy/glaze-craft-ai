# Backend Responsibilities for GlazeAI

This document outlines what functionality requires backend implementation versus what can be handled on the frontend.

## Backend Required Features

### 1. Dynamic Text Suggestions
**Current State**: Static hardcoded suggestions in ResponseArea.tsx
**Backend Needed**:
- API endpoint: `GET /api/suggestions/popular` - Returns trending/popular search queries
- API endpoint: `GET /api/suggestions/recent` - Returns user's recent searches
- Database: Track user search patterns and global popularity metrics
- Real-time analytics to determine what's trending

### 2. Chat History Management
**Current State**: localStorage only (temporary)
**Backend Needed**:
- API endpoints: 
  - `GET /api/chat/sessions` - Get user's chat history
  - `POST /api/chat/sessions` - Create new chat session
  - `PUT /api/chat/sessions/:id` - Update chat session
  - `DELETE /api/chat/sessions/:id` - Delete chat session
- Database: Persistent storage for chat sessions
- User authentication to associate chats with users

### 3. Notes System
**Backend Needed**:
- API endpoints:
  - `GET /api/notes` - Get user's notes
  - `POST /api/notes` - Create new note
  - `PUT /api/notes/:id` - Update note
  - `DELETE /api/notes/:id` - Delete note
- Database: Store notes with formatting, timestamps, and metadata
- File storage: For any embedded images or attachments

### 4. User Authentication & Profiles
**Backend Needed**:
- Authentication API (login, register, logout, token refresh)
- User profile management
- Session management
- Password reset functionality

### 5. AI Response Processing
**Current State**: Basic API call to OpenRouter
**Backend Needed**:
- Enhanced prompt processing and context management
- Response caching for common queries
- Usage tracking and rate limiting per user
- Model selection and optimization

## Frontend Only Features

### 1. UI State Management
- Sidebar open/close state
- Form input validation
- Loading states and animations
- Component interactions

### 2. Local Preferences
- Theme selection (dark/light mode)
- UI preferences (font size, layout)
- Temporary form state

### 3. Client-side Routing
- Navigation between pages
- URL state management
- Browser history

### 4. Real-time UI Updates
- Typing indicators
- Auto-scrolling
- Form auto-resize
- Animations and transitions

## Mixed Responsibilities

### 1. File Uploads
**Frontend**: File validation, preview, drag-and-drop
**Backend**: File storage, security scanning, size limits

### 2. Search Functionality
**Frontend**: Search UI, instant filtering of cached results
**Backend**: Full-text search, indexing, relevance scoring

### 3. Analytics
**Frontend**: Basic interaction tracking (clicks, time spent)
**Backend**: Data aggregation, reporting, trend analysis

## Current Implementation Status

### ✅ Frontend Complete
- Basic chat interface
- Message display
- File upload UI
- Responsive design
- Basic form handling

### 🚧 Needs Backend Integration
- Dynamic suggestions (currently static)
- Persistent chat history (currently localStorage)
- User authentication (not implemented)
- Notes system (to be implemented)

### 📋 Priority Order for Backend Implementation
1. User authentication system
2. Persistent chat history storage
3. Notes system with rich text formatting
4. Dynamic suggestions based on usage analytics
5. Enhanced AI context and response caching

## Data Models

### Chat Session
```typescript
interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    messageCount: number;
    totalTokens: number;
    lastActivity: Date;
  };
}
```

### Note
```typescript
interface Note {
  id: string;
  userId: string;
  title: string;
  content: string; // Rich text HTML
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    wordCount: number;
    tags: string[];
  };
}
```

### User Analytics
```typescript
interface UserAnalytics {
  userId: string;
  searchQueries: string[];
  popularTopics: string[];
  sessionDuration: number;
  lastActive: Date;
}
```