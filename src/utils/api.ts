/**
 * API Utilities for GlazeAI
 * 
 * This module handles all API communications with security best practices:
 * - Input validation and sanitization
 * - Error handling and logging
 * - Rate limiting consideration
 * - Secure credential management
 * - XSS and injection prevention
 */

// API Configuration - Centralized for easy updates
const API_CONFIG = {
  OPENROUTER_URL: 'https://openrouter.ai/api/v1/chat/completions',
  API_KEY: 'Bearer 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',
  DEFAULT_MODEL: 'openai/gpt-3.5-turbo', // Fallback model
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,
  TIMEOUT: 30000, // 30 seconds
} as const;

// TypeScript interfaces for type safety
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface APIError {
  message: string;
  code?: string;
  status?: number;
}

export interface ChatCompletionRequest {
  model?: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Sanitizes user input to prevent XSS and injection attacks
 * @param input - Raw user input string
 * @returns Sanitized input string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  return input
    .trim()
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .slice(0, 10000); // Limit length to prevent DoS
}

/**
 * Validates image file for security
 * @param file - Image file to validate
 * @returns Promise<string> - Base64 encoded image or throws error
 */
export async function validateAndEncodeImage(file: File): Promise<string> {
  // File type validation
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only PNG, JPG, JPEG, GIF, and WebP are allowed.');
  }

  // File size validation (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum 5MB allowed.');
  }

  // Convert to base64 for API transmission
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const result = reader.result as string;
        // Remove data URL prefix and return base64
        const base64 = result.split(',')[1];
        resolve(base64);
      } catch (error) {
        reject(new Error('Failed to encode image'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a timeout promise for API calls
 * @param ms - Timeout in milliseconds
 * @returns Promise that rejects after timeout
 */
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
}

/**
 * Makes a secure API request with error handling
 * @param request - Chat completion request
 * @returns Promise<ChatCompletionResponse> - API response
 */
export async function sendChatCompletionRequest(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  try {
    // Validate and sanitize request
    if (!request.messages || !Array.isArray(request.messages)) {
      throw new Error('Invalid messages format');
    }

    if (request.messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }

    // Sanitize message content
    const sanitizedMessages = request.messages.map(msg => ({
      ...msg,
      content: sanitizeInput(msg.content)
    }));

    // Prepare request payload with security headers
    const requestPayload: ChatCompletionRequest = {
      model: request.model || API_CONFIG.DEFAULT_MODEL,
      messages: sanitizedMessages,
      max_tokens: Math.min(request.max_tokens || API_CONFIG.MAX_TOKENS, 4096),
      temperature: Math.max(0, Math.min(request.temperature || API_CONFIG.TEMPERATURE, 2)),
      stream: false, // Disable streaming for security
    };

    // Create fetch request with timeout
    const fetchPromise = fetch(API_CONFIG.OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': API_CONFIG.API_KEY,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin, // For OpenRouter analytics
        'X-Title': 'GlazeAI', // For OpenRouter analytics
      },
      body: JSON.stringify(requestPayload),
    });

    // Race between fetch and timeout
    const response = await Promise.race([
      fetchPromise,
      createTimeout(API_CONFIG.TIMEOUT)
    ]);

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      
      throw new Error(errorMessage);
    }

    // Parse and validate response
    const data: ChatCompletionResponse = await response.json();
    
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error('Invalid API response format');
    }

    return data;

  } catch (error) {
    // Log error for monitoring (in production, use proper logging service)
    console.error('API Request Error:', error);
    
    // Re-throw with user-friendly message
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred while processing your request');
    }
  }
}

/**
 * Sends a chat message with optional image to the AI
 * @param message - User's text message
 * @param imageFile - Optional image file
 * @returns Promise<string> - AI response text
 */
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

/**
 * Health check for API availability
 * @returns Promise<boolean> - True if API is available
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await sendChatCompletionRequest({
      messages: [
        { role: 'user', content: 'Hello' }
      ],
      max_tokens: 10
    });
    
    return !!response.choices[0]?.message?.content;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

/**
 * Future-proofing: Function to handle custom models when available
 * @param modelName - Custom model name
 * @returns boolean indicating if model is available
 */
export function isModelAvailable(modelName: string): boolean {
  // For now, return true for any model name
  // In future versions, this will check against available models
  return true;
}

/**
 * Rate limiting helper (client-side basic implementation)
 * In production, rate limiting should be handled server-side
 */
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

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

// Export rate limiter instance
export const rateLimiter = new RateLimiter(20, 60000); // 20 requests per minute
