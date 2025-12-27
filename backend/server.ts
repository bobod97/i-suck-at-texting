import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log("---------------------------------------------------");
console.log("   STARTING SERVER");
console.log("---------------------------------------------------");

const app = express();
const port = process.env.PORT || 3000;

// Increase limit for base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Initialize Anthropic conditionally
const getAnthropic = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY missing.");
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }
  return new Anthropic({ apiKey });
};

app.post('/generate', async (req, res) => {
  console.log('Received request to /generate'); // LOG 1
  try {
    const anthropic = getAnthropic();
    const { image, tone, mediaType, intensity } = req.body;
    
    console.log(`Tone: ${tone}, Intensity: ${intensity}, Image size: ${image ? image.length : 0} chars, Type: ${mediaType}`); // LOG 2

    if (!image || !tone) {
      console.log('Missing image or tone');
      res.status(400).json({ error: 'Image and tone are required' });
      return;
    }

    let promptTone = tone;
    if (intensity === 'high') {
      promptTone = `EXTREMELY ${tone} (Maximum intensity, 1000% more ${tone})`;
    }

    console.log('Sending to Claude...'); // LOG 3
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Switching to Haiku (Verified Available)
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a helpful communication assistant for a mobile app called "I Suck at Texting". 
              Your goal is to analyze screenshots of chat conversations (iMessage, WhatsApp, Tinder, Email, etc.) and suggest 3 distinct responses based on the user's requested tone.
              
              CRITICAL INSTRUCTIONS FOR WHO IS WHO:
              1. **Analyze the Colors:**
                 - GRAY / WHITE bubbles = OTHER PERSON (Received).
                 - BLUE / GREEN / PURPLE bubbles = USER (Sent).
              
              2. **Locate the Bottom-Most Message:**
                 - If the bottom message is GRAY/WHITE -> The other person just texted. REPLY TO THIS MESSAGE.
                 - If the bottom message is BLUE/GREEN -> The user just texted. Suggest a "Double Text" or a follow-up.

              3. **Context:**
                 - Do NOT reply to the Blue/Green bubbles as if they were sent to the user. That is the user talking!
                 - You are the User (Blue/Green). You are replying to the Other Person (Gray).

              TONE INSTRUCTION: ${promptTone}
              
              Generate 3 short, effective responses in the requested tone.
              Return ONLY a valid JSON array of strings, like this: ["Response 1", "Response 2", "Response 3"]. Do not include markdown formatting or 'json' tags.`
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg", // Use dynamic type
                data: image,
              },
            },
          ],
        }
      ]
    });
    console.log('Received response from Claude'); // LOG 4

    const contentBlock = response.content[0];
    let content = "";
    if (contentBlock.type === 'text') {
        content = contentBlock.text;
    }

    let suggestions: string[] = [];

    try {
      // Clean up potential markdown code blocks
      const cleanedContent = content?.replace(/```json/g, '').replace(/```/g, '').trim();
      suggestions = JSON.parse(cleanedContent || "[]");
    } catch (e) {
      console.error("Failed to parse JSON", content);
      suggestions = [content || "Error generating suggestions."];
    }

    res.json({ suggestions });

  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Failed to generate responses' });
  }
});

// Start server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export for Vercel
module.exports = app;
