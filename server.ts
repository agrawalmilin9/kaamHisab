import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// Initialize Gemini client on the server side
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 5) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Extraction API endpoint for Indian daily wage voice/text entries
app.post('/api/extract-work', async (req, res) => {
  const { sentence, defaultWage = 600, defaultHours = 8, referenceDate } = req.body;

  if (!sentence || typeof sentence !== 'string' || sentence.trim().length === 0) {
    return res.status(400).json({ error: 'Sentence is required' });
  }

  const todayStr = referenceDate || new Date().toISOString().split('T')[0];

  // If Gemini API is configured, try server-side extraction with fast thinking
  if (ai) {
    try {
      const prompt = `You are an expert assistant for Indian daily-wage workers (दिहाड़ी मजदूर, कारीगर, बढ़ई, पेंटर, प्लंबर, हेल्पर) in the KaamHisab app.
Analyze this work entry sentence spoken or typed by the worker in Hindi, Marathi, Hinglish, or English:
"${sentence}"

Reference "today" date is: ${todayStr}.
Worker default daily wage: ₹${defaultWage}.
Worker default standard shift hours: ${defaultHours} hours.

Extract the following details carefully:
1. date: YYYY-MM-DD. Handle relative references ("आज" -> ${todayStr}, "कल" -> 1 day before ${todayStr}, "परसों" -> 2 days before ${todayStr}).
2. hoursWorked: total hours worked (number). If "पूरा दिन" -> ${defaultHours}. If "आधा दिन" -> 4.
3. dailyWage: wage rate in Rupees (₹). Default: ${defaultWage}.
4. overtimeHours: additional hours beyond standard shift or explicitly mentioned overtime (number).
5. overtimeRate: hourly overtime rate if mentioned or 0.
6. thekedarOrSite: name of contractor or site if mentioned, else empty string.
7. workType: trade or work type if mentioned, else empty string.
8. notes: short summary in the user's language.`;

      const geminiCall = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: 'YYYY-MM-DD date' },
              hoursWorked: { type: Type.NUMBER, description: 'Total hours worked' },
              dailyWage: { type: Type.NUMBER, description: 'Daily wage rate in ₹' },
              overtimeHours: { type: Type.NUMBER, description: 'Overtime hours' },
              overtimeRate: { type: Type.NUMBER, description: 'Overtime rate per hour in ₹' },
              thekedarOrSite: { type: Type.STRING, description: 'Contractor or site name' },
              workType: { type: Type.STRING, description: 'Trade or work type' },
              notes: { type: Type.STRING, description: 'Summary note' },
            },
            required: ['date', 'hoursWorked', 'dailyWage', 'overtimeHours'],
          },
        },
      });

      // Wrap with 4.5s timeout for snappy mobile experience
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timed out')), 4500)
      );

      const response = await Promise.race([geminiCall, timeoutPromise]);

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({
          success: true,
          source: 'gemini',
          data: {
            date: parsed.date || todayStr,
            hoursWorked: Number(parsed.hoursWorked) || defaultHours,
            dailyWage: Number(parsed.dailyWage) || defaultWage,
            overtimeHours: Number(parsed.overtimeHours) || 0,
            overtimeRate: Number(parsed.overtimeRate) || 0,
            thekedarOrSite: parsed.thekedarOrSite || '',
            workType: parsed.workType || '',
            notes: parsed.notes || '',
          },
        });
      }
    } catch (err: any) {
      console.warn('Gemini extraction warning, falling back to heuristic:', err?.message || err);
      // Fall through to heuristic extractor below
    }
  }

  // Fallback intelligent heuristic extractor for offline / no-key situations
  const heuristicData = parseSentenceHeuristic(sentence, defaultWage, defaultHours, todayStr);
  return res.json({
    success: true,
    source: 'heuristic',
    data: heuristicData,
  });
});

// Heuristic extractor for Indian wage sentences
function parseSentenceHeuristic(sentence: string, defaultWage: number, defaultHours: number, todayStr: string) {
  const text = sentence.toLowerCase().trim();
  
  // Date calculation
  let targetDate = new Date(todayStr);
  if (text.includes('\u0915\u093e\u0932')) {
    targetDate.setDate(targetDate.getDate() - 1);
  }
  if (text.includes('कल') || text.includes('yesterday') || text.includes('kal')) {
    targetDate.setDate(targetDate.getDate() - 1);
  } else if (text.includes('परसों') || text.includes('parso') || text.includes('day before')) {
    targetDate.setDate(targetDate.getDate() - 2);
  }
  if (text.includes('\u092a\u0930\u0935\u093e')) {
    targetDate.setDate(targetDate.getDate() - 2);
  }
  const dateStr = targetDate.toISOString().split('T')[0];

  // Hours calculation
  let hoursWorked = defaultHours;
  let overtimeHours = 0;

  // Check half day
  if (text.includes('आधा दिन') || text.includes('half day') || text.includes('ardha divas') || text.includes('halfday')) {
    hoursWorked = Math.round(defaultHours / 2);
  }

  // Hours match (e.g. 8 घंटे, 8 hours, 8 ghante, 10 तास)
  const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:घंटे|घंटा|hours?|hrs?|ghante|ghanta|तास)/);
  if (hoursMatch) {
    hoursWorked = parseFloat(hoursMatch[1]);
  }

  // Overtime match (e.g. 2 घंटे ओवरटाइम, 2 hrs overtime, 2 तास ओव्हरटाइम)
  const otMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:घंटे|घंटा|hours?|hrs?|ghante|taas|तास)?\s*(?:ओवरटाइम|overtime|ओव्हरटाइम|ot)/) ||
                 text.match(/(?:ओवरटाइम|overtime|ओव्हरटाइम|ot)\s*(?:के|of)?\s*(\d+(?:\.\d+)?)\s*(?:घंटे|घंटा|hours?|hrs?|ghante|taas|तास)?/);
  if (otMatch) {
    overtimeHours = parseFloat(otMatch[1]);
  } else if (hoursWorked > defaultHours) {
    overtimeHours = hoursWorked - defaultHours;
  }

  // Wage match (e.g. दिहाड़ी 600, wage 600, 600 रुपये, 600 rs, रोज 650)
  let dailyWage = defaultWage;
  const wageMatch = text.match(/(?:दिहाड़ी|दिहाडी|wage|roj|रोज|rate|वेतन|दहाड़ी)\s*(?:थी|था|है|is|of|hai)?\s*[:=₹Rsrs\.]*\s*(\d{3,5})/) ||
                    text.match(/(\d{3,5})\s*(?:रुपये|रूपये|रुपए|rupees|rs|rupya|रुपया|₹)/) ||
                    text.match(/(?:₹|rs\.?)\s*(\d{3,5})/);
  if (wageMatch) {
    dailyWage = parseInt(wageMatch[1], 10);
  }

  // Contractor / Site match
  let thekedarOrSite = '';
  const contractorMatch = text.match(/(?:ठेकेदार|thekedar|site|contractor|मालिक|बाबूजी)\s*([a-zA-Z\u0900-\u097F]+)/);
  if (contractorMatch) {
    thekedarOrSite = contractorMatch[1];
  }

  return {
    date: dateStr,
    hoursWorked,
    dailyWage,
    overtimeHours,
    overtimeRate: 0,
    thekedarOrSite,
    workType: '',
    notes: sentence,
  };
}

// Development server with Vite middleware OR Production static server
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
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

  const listenPort = Number(process.env.PORT) || 3000;
  app.listen(listenPort, '0.0.0.0', () => {
    console.log(`KaamHisab server running on http://0.0.0.0:${listenPort}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
