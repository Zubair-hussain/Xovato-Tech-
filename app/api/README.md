# ⚡ Backend API Routes

This directory contains the server-side API endpoints for the Next.js application.

## 🔌 Endpoints

### `POST /api/chat`
Handles conversation with the AI Agent.
- **Input:** `{ messages: Message[] }`
- **Output:** Streaming text response from the AI model.
- **Logic:**
  1.  Receives user message.
  2.  Injects system prompt (defining the AI as a helpful Xovato assistant).
  3.  Calls the AI provider (Google Gemini / OpenAI).
  4.  Returns a streaming response.

## 🔒 Security
- These routes run on the server, ensuring API keys (like the AI Provider Key) are never exposed to the client.
- Rate limiting should be considered for production.
