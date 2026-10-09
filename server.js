import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Helper to get GoogleGenAI client with required header
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured in Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Available prebuilt voices with metadata for rich UI selection
const PREBUILT_VOICES = [
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Female / Neutral',
    tone: 'Warm, Balanced & Clear',
    description: 'Natural, friendly, and articulate. Perfect for audiobooks, explainers, tutorials, and storytelling.',
    accent: 'Neutral English',
    color: '#ec4899',
    suggestedStyles: ['Warm, reassuring narrator', 'Professional educator', 'Gentle meditation guide'],
    previewSample: 'Welcome to Gemini Voice Studio. I can speak any text you write with clarity and warmth.'
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Male',
    tone: 'Energetic, Vibrant & Upbeat',
    description: 'Youthful, bright, dynamic, and engaging. Great for YouTube videos, commercials, gaming, and lively podcasts.',
    accent: 'Modern English',
    color: '#f97316',
    suggestedStyles: ['High-energy radio host', 'Excited video game character', 'Punchy promo announcer'],
    previewSample: 'Hey everyone, check this out! Puck brings maximum energy and punch to every single line.'
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Male',
    tone: 'Deep, Resonant & Authoritative',
    description: 'Commanding baritone with cinematic gravitas. Ideal for blockbuster movie trailers, history docs, and epic announcements.',
    accent: 'Deep Cinematic English',
    color: '#8b5cf6',
    suggestedStyles: ['Dramatic movie trailer voice', 'Epic myth narrator', 'Authoritative news broadcast'],
    previewSample: 'In a world of infinite sound, Fenrir brings power, depth, and cinematic authority.'
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Male / Neutral',
    tone: 'Calm, Soothing & Serene',
    description: 'Soft-spoken, peaceful, and gentle. Excellent for mindfulness, ASMR-style guides, bedtime stories, and relaxed tech demos.',
    accent: 'Smooth Gentle English',
    color: '#06b6d4',
    suggestedStyles: ['Gentle mindfulness guide', 'Late-night cozy radio', 'Patient software tutor'],
    previewSample: 'Take a deep breath. With Zephyr, words flow smoothly like a tranquil evening breeze.'
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Male',
    tone: 'Gravelly, Mature & Thoughtful',
    description: 'Rich, textured, and reflective voice with seasoned weight. Great for noir mystery, philosophical commentary, and character roles.',
    accent: 'Gravelly Baritone English',
    color: '#64748b',
    suggestedStyles: ['Noir detective monologue', 'Wise elderly scholar', 'Thoughtful investigative journalist'],
    previewSample: 'Some mysteries are best told in the shadows. Charon gives voice to timeless reflection.'
  },
  {
    id: 'Aoede',
    name: 'Aoede',
    gender: 'Female',
    tone: 'Melodic, Poetic & Expressive',
    description: 'Lyrical, vibrant, and elegant. Beautiful for poetry, luxury brand showcases, cheerful prompts, and theatrical dialogue.',
    accent: 'Melodic English',
    color: '#10b981',
    suggestedStyles: ['Lyrical poetic reciter', 'Charming luxury brand speaker', 'Enthusiastic theater actor'],
    previewSample: 'Words carry harmony and inspiration. Aoede crafts each phrase with artistic nuance.'
  }
];

// Endpoint: list voices catalog
app.get('/api/voices', (_req, res) => {
  res.json({ voices: PREBUILT_VOICES });
});

// Endpoint: Generate Speech (Unary WAV)
app.post('/api/generate-speech', async (req, res) => {
  try {
    const {
      text,
      voice = 'Kore',
      style = '',
      model = 'gemini-3.8-flash-lite-tts',
      isDialogue = false,
      dialogueTurns = [],
      speakersConfig = []
    } = req.body;

    if (!isDialogue && (!text || typeof text !== 'string' || !text.trim())) {
      return res.status(400).json({ error: 'Please provide text for speech generation.' });
    }

    if (isDialogue && (!Array.isArray(dialogueTurns) || dialogueTurns.length === 0)) {
      return res.status(400).json({ error: 'Please provide dialogue lines for multi-speaker mode.' });
    }

    const ai = getAiClient();

    let audioBase64 = null;
    let mimeType = 'audio/wav';

    if (isDialogue) {
      // Multi-speaker mode: gemini-3.8-flash-tts with multiSpeakerVoiceConfig (requires exactly 2 speakers)
      const speaker1 = speakersConfig[0] || { speaker: 'Speaker 1', voiceName: 'Puck' };
      const speaker2 = speakersConfig[1] || { speaker: 'Speaker 2', voiceName: 'Kore' };

      const parts = dialogueTurns.map((turn) => ({
        text: `${turn.speaker}: ${turn.text}`,
        speechMetadata: {
          speaker: turn.speaker,
          style: turn.style || undefined
        }
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts
          }
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: speaker1.speaker,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speaker1.voiceName }
                  }
                },
                {
                  speaker: speaker2.speaker,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speaker2.voiceName }
                  }
                }
              ]
            }
          }
        }
      });

      for (const candidate of response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData?.data) {
            audioBase64 = part.inlineData.data;
            if (part.inlineData.mimeType) mimeType = part.inlineData.mimeType;
            break;
          }
        }
        if (audioBase64) break;
      }
    } else {
      // Single speaker mode
      const selectedModel = model === 'gemini-3.8-flash-tts' ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';
      const cleanText = text.trim();

      const partPayload = {
        text: cleanText
      };

      if (style && style.trim()) {
        partPayload.speechMetadata = {
          style: style.trim()
        };
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: [
          {
            role: 'user',
            parts: [partPayload]
          }
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice }
            }
          }
        }
      });

      for (const candidate of response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData?.data) {
            audioBase64 = part.inlineData.data;
            if (part.inlineData.mimeType) mimeType = part.inlineData.mimeType;
            break;
          }
        }
        if (audioBase64) break;
      }
    }

    if (!audioBase64) {
      return res.status(500).json({
        error: 'The audio model did not return audio data. Please try adjusting your text or style prompt.'
      });
    }

    return res.json({
      audioBase64,
      mimeType,
      voice: isDialogue ? 'Multi-Speaker' : voice,
      model: isDialogue ? 'gemini-3.8-flash-tts' : model,
      textLength: isDialogue ? dialogueTurns.length : text.length,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error generating speech:', err);
    const message = err instanceof Error ? err.message : 'Unknown server error during audio generation.';
    return res.status(500).json({ error: message });
  }
});

// Endpoint: AI Script Assistant & Prompt Enhancer (using free gemini-3.8-flash)
app.post('/api/enhance-script', async (req, res) => {
  try {
    const { action, text, context } = req.body;
    if (!text && action !== 'generate_fresh') {
      return res.status(400).json({ error: 'Text is required to enhance script.' });
    }

    const ai = getAiClient();
    let prompt = '';

    if (action === 'generate_fresh') {
      prompt = `Write a short, engaging voiceover script (30 to 70 words) for the theme: "${context || 'Inspirational quote'}". Return ONLY the spoken text, without markdown, notes, or quotation marks.`;
    } else if (action === 'add_emotions') {
      prompt = `Take the following voiceover script and improve its natural delivery. You may subtly insert vocal delivery cues or pauses where appropriate, but keep the core message.
Text: "${text}"
Desired vibe: "${context || 'expressive and dynamic'}"
Return ONLY the final spoken text with no preamble or explanations.`;
    } else if (action === 'translate') {
      prompt = `Translate the following text to ${context || 'Spanish'} while optimizing it to sound completely natural and conversational when spoken aloud by a voice actor.
Original text: "${text}"
Return ONLY the translated spoken text.`;
    } else {
      prompt = `Refine this text to sound more natural, rhythmic, and clear when read aloud:
Text: "${text}"
Return ONLY the polished spoken text.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    const enhancedText = response.text?.trim() || text;
    return res.json({ enhancedText });
  } catch (err) {
    console.error('Enhancing script error:', err);
    const message = err instanceof Error ? err.message : 'Failed to enhance script.';
    return res.status(500).json({ error: message });
  }
});

// Mount Vite in dev mode, serve static dist in prod
const setupServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gemini Voice Studio server running on port ${PORT}`);
  });
};

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
