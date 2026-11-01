import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { SarvamAIClient, SarvamAIError } from 'sarvamai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());

const sarvamApiKey = process.env.SARVAM_API_KEY;
const sarvam = sarvamApiKey
  ? new SarvamAIClient({ apiSubscriptionKey: sarvamApiKey })
  : null;

type ExtractedWork = {
  date: string;
  hoursWorked: number;
  dailyWage: number;
  overtimeHours: number;
  overtimeRate: number;
  thekedarOrSite: string;
  workType: string;
  notes: string;
};

function normalizeExtractedWork(value: unknown, todayStr: string, defaultWage: number, defaultHours: number): ExtractedWork | null {
  if (!value || typeof value !== 'object') return null;

  const data = value as Record<string, unknown>;
  const date = typeof data.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.date)
    ? data.date
    : todayStr;
  const hoursWorked = Number(data.hoursWorked);
  const dailyWage = Number(data.dailyWage);
  const overtimeHours = Number(data.overtimeHours);
  const overtimeRate = Number(data.overtimeRate ?? 0);

  if (![hoursWorked, dailyWage, overtimeHours, overtimeRate].every(Number.isFinite)) return null;
  if (hoursWorked < 0 || dailyWage < 0 || overtimeHours < 0 || overtimeRate < 0) return null;

  return {
    date,
    hoursWorked: hoursWorked || defaultHours,
    dailyWage: dailyWage || defaultWage,
    overtimeHours,
    overtimeRate,
    thekedarOrSite: typeof data.thekedarOrSite === 'string' ? data.thekedarOrSite : '',
    workType: typeof data.workType === 'string' ? data.workType : '',
    notes: typeof data.notes === 'string' ? data.notes : '',
  };
}

function parseModelJson(content: string): unknown {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

app.post('/api/extract-work', async (req, res) => {
  const { sentence, defaultWage = 600, defaultHours = 8, referenceDate } = req.body;

  if (!sentence || typeof sentence !== 'string' || sentence.trim().length === 0) {
    return res.status(400).json({ error: 'Sentence is required' });
  }

  const todayStr = referenceDate || new Date().toISOString().split('T')[0];

  if (sarvam) {
    try {
      const response = await sarvam.chat.completions({
        model: 'sarvam-105b-conversations',
        messages: [
          {
            role: 'system',
            content: `You extract Indian daily-wage work entries for KaamHisab. Return only valid JSON with these fields: date (YYYY-MM-DD), hoursWorked (number), dailyWage (number), overtimeHours (number), overtimeRate (number), thekedarOrSite (string), workType (string), notes (string). Use reference date ${todayStr}, default wage ${defaultWage}, and default shift ${defaultHours} hours. Understand Hindi, Marathi, Hinglish, and English. Resolve today, yesterday, कल, काल, परसों, and परवा relative to the reference date.`,
          },
          { role: 'user', content: sentence },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (typeof content !== 'string' || content.trim().length === 0) throw new Error('Sarvam returned an empty response');

      const data = normalizeExtractedWork(parseModelJson(content), todayStr, defaultWage, defaultHours);
      if (!data) throw new Error('Sarvam returned invalid extraction JSON');

      return res.json({ success: true, source: 'sarvam', data });
    } catch (error) {
      if (error instanceof SarvamAIError) {
        console.warn(`Sarvam extraction failed with status ${error.statusCode}; using heuristic fallback.`);
      } else {
        console.warn('Sarvam extraction failed; using heuristic fallback.');
      }
    }
  }

  const heuristicData = parseSentenceHeuristic(sentence, defaultWage, defaultHours, todayStr);
  return res.json({ success: true, source: 'heuristic', data: heuristicData });
});

function parseSentenceHeuristic(sentence: string, defaultWage: number, defaultHours: number, todayStr: string) {
  const text = sentence.toLowerCase().trim();
  const targetDate = new Date(todayStr);

  if (text.includes('\u0915\u0932') || text.includes('\u0915\u093e\u0932') || text.includes('yesterday') || text.includes('kal')) {
    targetDate.setDate(targetDate.getDate() - 1);
  } else if (text.includes('\u092a\u0930\u0938\u094b\u0902') || text.includes('\u092a\u0930\u0935\u093e') || text.includes('parso') || text.includes('day before')) {
    targetDate.setDate(targetDate.getDate() - 2);
  }

  const date = targetDate.toISOString().split('T')[0];
  let hoursWorked = defaultHours;
  let overtimeHours = 0;

  if (text.includes('\u0906\u0927\u093e \u0926\u093f\u0928') || text.includes('half day') || text.includes('ardha divas')) {
    hoursWorked = Math.round(defaultHours / 2);
  }

  const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:\u0918\u0902\u091f\u0947|\u0918\u0902\u091f\u093e|hours?|hrs?|ghante|ghanta|\u0924\u093e\u0938)/);
  if (hoursMatch) hoursWorked = parseFloat(hoursMatch[1]);

  const otMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:\u0918\u0902\u091f\u0947|\u0918\u0902\u091f\u093e|hours?|hrs?|ghante|taas|\u0924\u093e\u0938)?\s*(?:overtime|ot|\u0913\u0935\u0930\u091f\u093e\u0907\u092e|\u0913\u0935\u094d\u0939\u0930\u091f\u093e\u0907\u092e)/);
  if (otMatch) overtimeHours = parseFloat(otMatch[1]);
  else if (hoursWorked > defaultHours) overtimeHours = hoursWorked - defaultHours;

  const wageMatch = text.match(/(\d{3,5})\s*(?:\u0930\u0941\u092a\u092f\u0947|rupees|rs|rupya|\u0930\u0942\u092a\u092f\u0947|\u092e\u091c\u0941\u0930\u0940)/) || text.match(/(?:wage|rate|roj|\u0930\u094b\u091c|\u0935\u0947\u0924\u0928|\u092e\u091c\u0941\u0930\u0940)\s*[:=]?\s*(\d{3,5})/);
  const dailyWage = wageMatch ? parseInt(wageMatch[1], 10) : defaultWage;

  return {
    date,
    hoursWorked,
    dailyWage,
    overtimeHours,
    overtimeRate: 0,
    thekedarOrSite: '',
    workType: '',
    notes: sentence,
  };
}

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
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

startServer().catch(() => {
  console.error('Failed to start server.');
});
