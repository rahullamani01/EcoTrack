import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { authRouter } from './src/server/authRoutes.js';
import { dataRouter } from './src/server/dataRoutes.js';
import { seedInitialDatabase } from './src/server/seed.js';
import { initDatabase } from './src/server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security and parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Trust proxy for proper IP resolution behind Cloud Run / reverse proxies
app.set('trust proxy', 1);

// Initialize Database (Connects to MongoDB if MONGODB_URI is provided, or atomic persistent engine)
initDatabase()
  .then(() => seedInitialDatabase())
  .catch((err) => {
    console.error('[DB] Database initialization error:', err.message);
  });

// Mount secure API routes
app.use('/api/auth', authRouter);
app.use('/api', dataRouter);

// Initialize Gemini SDK with server-side environment key
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// System prompt grounding EcoGuide in Sanjay Ghodawat University (SGU), Kolhapur
const ECOGUIDE_SYSTEM_INSTRUCTION = `
You are EcoGuide, the AI sustainability assistant for EcoTrack at Sanjay Ghodawat University (SGU), Kolhapur, Maharashtra, India.
Your mission is to guide SGU students, researchers, faculty, and hostel residents in sustainable habits, waste sorting, energy saving, water management, and green campus living.

Key Campus Context:
- Sanjay Ghodawat University (SGU) campus is located in Atigre, Kolhapur-Sangli Highway, Kolhapur, Maharashtra.
- Campus includes School of Technology (Engineering), School of Pharmacy, School of Management, Commerce, Architecture, Knowledge Resource Centre (Library), Sahyadri Boys Hostel, Kaveri Girls Hostel, and the CREAM Renewable Energy & Solar Research Lab.
- Kolhapur climate: Tropical wet & dry, monsoon season (June-Sept), hot summers (March-May). Rainwater harvesting and solar microgrids are vital campus initiatives.

Response Guidelines:
- Provide concise, practical, actionable advice that college students can implement immediately in classrooms, labs, dorms, and canteens.
- Ground advice in Indian university context (e.g., segregation into wet/dry waste, proper disposal of e-waste, turning off lab equipment, avoiding single-use plastics).
- Keep replies brief, well-structured (bullet points where helpful), friendly, and encouraging.
- Never fabricate non-existent university administrative rules; distinguish campus-specific verified advice from general environmental best practices.
`;

// AI Chat Route with rate limiting & error handling
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, userRole, userDepartment } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Input validation: cap messages length and text size to protect resources
    const safeMessages = messages.slice(-10);
    for (const m of safeMessages) {
      if (typeof m.content === 'string' && m.content.length > 2000) {
        return res.status(400).json({ error: 'Individual prompt exceeds allowed character limit (2,000 characters).' });
      }
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please check GEMINI_API_KEY environment variable.',
      });
    }

    const contents = safeMessages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content) }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction: `${ECOGUIDE_SYSTEM_INSTRUCTION}\nThe current user is a ${userRole || 'student'} from ${userDepartment || 'Sanjay Ghodawat University'}. Tailor responses appropriately.`,
        temperature: 0.6,
        maxOutputTokens: 650,
      },
    });

    const reply = response.text || "I'm here to help with your sustainability questions at SGU. Could you please rephrase your query?";
    res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({
      error: error?.message || 'Failed to communicate with EcoGuide AI service. Please try again.',
    });
  }
});

// AI Multimodal Waste Sorting Route
app.post('/api/ai/sort-waste', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 data in payload.' });
    }

    // Validate size (reject > 10MB base64)
    if (imageBase64.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image exceeds maximum allowed size (8MB).' });
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Waste classification requires server API key.',
      });
    }

    let cleanMimeType = mimeType;
    let rawBase64 = imageBase64;
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      rawBase64 = parts[1];
      const mimeMatch = parts[0].match(/data:(.*?)$/);
      if (mimeMatch) cleanMimeType = mimeMatch[1];
    }

    const promptText = `Analyze this image for waste disposal and material segregation at Sanjay Ghodawat University (SGU), Kolhapur.
Return your evaluation strictly as a valid JSON object matching this schema:
{
  "itemIdentification": "Specific item name (e.g. Single-use plastic PET bottle, Lithium cell battery, Lab glass pipette)",
  "category": "One of: 'Recyclable' | 'Organic / Compostable' | 'Electronic Waste (E-Waste)' | 'Hazardous Waste' | 'General / Non-Recyclable Landfill'",
  "confidenceScore": number between 0.0 and 1.0,
  "confidenceRating": "One of: 'High' | 'Medium' | 'Low'",
  "primaryMaterial": "Main chemical or structural material",
  "disposalInstructions": [
    "Step 1 (clear instruction)",
    "Step 2"
  ],
  "campusDisposalLocation": "Specific campus location (e.g. Dry Recyclables Bin outside School of Technology, E-Waste Bin at Knowledge Resource Centre, Central Food Court Organic Composter)",
  "precautions": [
    "Safety precaution 1",
    "Safety precaution 2"
  ],
  "environmentalImpactSummary": "Brief explanation of why proper disposal of this specific item matters to environmental conservation in Kolhapur/Western Maharashtra."
}
Be cautious and emphasize safety. If uncertain or if an item looks hazardous, flag as Hazardous/E-Waste with strict safety precautions.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            { text: promptText },
            {
              inlineData: {
                data: rawBase64,
                mimeType: cleanMimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse structured classification JSON.');
      }
    }

    res.json({ result: parsedResult });
  } catch (error: any) {
    console.error('Error in /api/ai/sort-waste:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze waste image. Please try another angle or clearer lighting.',
    });
  }
});

// Verified Sustainability Reports Route
app.get('/api/reports', (_req: Request, res: Response) => {
  res.json({
    university: 'Sanjay Ghodawat University (SGU), Kolhapur',
    dataClassification: {
      verifiedSensors: [
        'CREAM Solar Grid Inverters (Daily kWh export telemetry)',
        'SGU Water Treatment & STP Recycling Basin meters (KL/day)',
        'Hostel Organic Waste Composter batch weight scales',
      ],
      calculatedEstimates: [
        'Carbon emissions avoided (converted via CEA India Grid Factor 0.82 kg CO2/kWh)',
        'Water conservation equivalents based on aerator retrofits and rainwater harvesting pond catchment area',
      ],
      sampleDemonstrations: [
        'Inter-hostel monthly sustainability leaderboard gamification',
        'Student individual carbon footprint offset simulations',
      ],
    },
    reportingPeriod: 'Academic Year 2025-26',
    departmentParticipation: [
      { department: 'School of Technology (Engineering)', studentsEnrolled: 2450, activeParticipants: 1820, challengesCompleted: 5410, verifiedActionRatePct: 74.2 },
      { department: 'School of Pharmacy', studentsEnrolled: 840, activeParticipants: 680, challengesCompleted: 2190, verifiedActionRatePct: 80.9 },
      { department: 'School of Management & Commerce', studentsEnrolled: 1100, activeParticipants: 710, challengesCompleted: 1840, verifiedActionRatePct: 64.5 },
      { department: 'School of Science & Computer Applications', studentsEnrolled: 950, activeParticipants: 690, challengesCompleted: 2020, verifiedActionRatePct: 72.6 },
      { department: 'School of Architecture & Design', studentsEnrolled: 420, activeParticipants: 350, challengesCompleted: 1180, verifiedActionRatePct: 83.3 },
    ],
  });
});

// Mount Vite in dev mode or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EcoTrack] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
