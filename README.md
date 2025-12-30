# I Suck at Texting

## Concept
A mobile app that helps users generate responses to chat conversations (iMessage, WhatsApp, Email, etc.) by analyzing screenshots of the chat.

## Core Flow
1. **Upload:** User uploads a screenshot of a conversation.
2. **Configure:** User selects a desired "Tone" (e.g., Flirty, Funny, Professional).
3. **Generate:** The app analyzes the image context (who said what) and suggests 3 distinct replies.
4. **Action:** User copies the preferred reply.

## "Tones"
- **Funny:** Humorous, lighthearted.
- **Cool:** Laid back, slang-appropriate but not cringe.
- **Nonchalant:** Low effort, "too cool to care."
- **Flirty:** Rizz-focused, playful.
- **Savage:** Witty comebacks, slightly mean.
- **Professional:** Formal, grammatically perfect (for emails).
- **Empathetic:** Supportive, kind.

## Architecture

### Frontend (Mobile App)
- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **UI Library:** React Native Paper or NativeBase (for fast UI components)
- **Navigation:** Expo Router

### Backend (API)
- **Framework:** Node.js (Express) or Next.js API Routes
- **Function:** 
    - Receives image (base64) + tone.
    - Constructs prompt for LLM.
    - Forward to OpenAI GPT-4o / Gemini 1.5 Pro.
    - Returns JSON suggestions.

### AI Model Strategy
- **Multimodal Approach:** Send the raw image directly to the model.
- **Prompt Engineering:** "Analyze this chat screenshot. You are replying as the person on the RIGHT (usually blue/green bubbles). The tone should be ${tone}. Provide 3 distinct options."










