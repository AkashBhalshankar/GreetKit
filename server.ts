import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// In-memory persistent store for saved greetings, wishes, and replies
// Seeded with rich sample greetings so demo links work out of the box
interface StoredGreeting {
  id: string;
  data: any;
  createdAt: string;
  editToken: string;
}

const greetingsStore = new Map<string, StoredGreeting>();
const wishesStore = new Map<string, Array<{ id: string; name: string; message: string; createdAt: string; emoji?: string }>>();
const repliesStore = new Map<string, Array<{ id: string; name: string; reaction: string; message: string; createdAt: string }>>();

const DB_FILE = path.join(__dirname, 'data', 'greetings_store.json');

function saveStoreToDisk() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const serializable = {
      greetings: Array.from(greetingsStore.entries()),
      wishes: Array.from(wishesStore.entries()),
      replies: Array.from(repliesStore.entries()),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(serializable, null, 2));
  } catch (err) {
    console.error('Failed to persist store to disk:', err);
  }
}

function loadStoreFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.greetings)) {
        parsed.greetings.forEach(([k, v]: [string, any]) => greetingsStore.set(k, v));
      }
      if (Array.isArray(parsed.wishes)) {
        parsed.wishes.forEach(([k, v]: [string, any]) => wishesStore.set(k, v));
      }
      if (Array.isArray(parsed.replies)) {
        parsed.replies.forEach(([k, v]: [string, any]) => repliesStore.set(k, v));
      }
    }
  } catch (err) {
    console.error('Failed to load store from disk:', err);
  }
}

// Seed sample greetings
const sampleBirthdayGreeting = {
  v: 1,
  id: "priya-25",
  occasion: "birthday",
  relationship: "friend",
  tone: "funny",
  lang: "en",
  recipient: { name: "Priya", nickname: "Pri", age: 25 },
  sender: { name: "Akash" },
  theme: {
    skin: "patisserie-cream",
    accent: "#B85D3B",
    font: "serif",
    music: "soft-piano",
    ending: "confetti"
  },
  flow: [
    {
      type: "scene",
      engine: "blowout",
      props: {
        title: "Make a wish & blow out the candles!",
        candles: 5,
        reasons: [
          "Your laugh instantly turns rough days around",
          "You always pick the best food spots in town",
          "Your chaotic energy is pure sunshine",
          "You are the most fiercely loyal friend ever",
          "This year is going to be your biggest level-up yet!"
        ],
        showReasons: true
      }
    },
    {
      type: "message",
      text: "Happy 25th Birthday, Priya! May your quarter-century milestone be overflowing with joy, iced lattes, spontaneous road trips, and everything your wonderful heart desires. So endlessly proud of you!",
      author: "Akash"
    },
    {
      type: "timeline",
      items: [
        { date: "2019", title: "College Day 1", story: "Met outside the library stressing about schedules." },
        { date: "2022", title: "First Road Trip", story: "Got lost on the highway singing 2000s pop anthems." },
        { date: "2026", title: "Quarter Century!", story: "Celebrating 25 years of you making the world brighter." }
      ]
    },
    {
      type: "final",
      cta: "make-your-own",
      wishWallEnabled: true
    }
  ],
  delivery: { tz: "Asia/Kolkata" },
  features: { privateWish: true, wishWall: true, soundFx: true },
  createdAt: new Date().toISOString()
};

const sampleDiwaliGreeting = {
  v: 1,
  id: "diwali-blessings",
  occasion: "diwali",
  relationship: "family",
  tone: "sweet",
  lang: "en",
  recipient: { name: "Family & Friends" },
  sender: { name: "The Sharma Family" },
  theme: {
    skin: "terracotta-clay",
    accent: "#B85D3B",
    font: "display",
    music: "celestial",
    ending: "sparkles"
  },
  flow: [
    {
      type: "scene",
      engine: "tap-light",
      props: {
        title: "Light the Sacred Diyas",
        itemsCount: 5,
        blessings: [
          "May light triumph over all darkness in your home",
          "May prosperity and health grace your doorstep",
          "May laughter fill every festive evening",
          "May your dreams blossom with wisdom and peace",
          "Wishing you an auspicious, radiant Diwali!"
        ]
      }
    },
    {
      type: "message",
      text: "Shubh Deepavali! As each diya glows tonight, may it illuminate your path with joy, love, and boundless prosperity. Sending warm blessings across the miles.",
      author: "The Sharmas"
    },
    {
      type: "final",
      cta: "make-your-own",
      wishWallEnabled: true
    }
  ],
  features: { privateWish: false, wishWall: true, soundFx: true },
  createdAt: new Date().toISOString()
};

greetingsStore.set(sampleBirthdayGreeting.id, {
  id: sampleBirthdayGreeting.id,
  data: sampleBirthdayGreeting,
  createdAt: sampleBirthdayGreeting.createdAt,
  editToken: "sample-token-1"
});

greetingsStore.set(sampleDiwaliGreeting.id, {
  id: sampleDiwaliGreeting.id,
  data: sampleDiwaliGreeting,
  createdAt: sampleDiwaliGreeting.createdAt,
  editToken: "sample-token-2"
});

// Seed some sample wishes
wishesStore.set("priya-25", [
  { id: "w1", name: "Rohan", message: "Happy 25th Pri! Still can't believe you're 25 haha!", createdAt: "1 hour ago", emoji: "🎂" },
  { id: "w2", name: "Ananya", message: "To the sweetest soul, have the most magical year!", createdAt: "3 hours ago", emoji: "✨" }
]);

// Load saved data from disk (restores all user created greetings after server reload)
loadStoreFromDisk();

// Initialize Gemini SDK
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// ----------------- API Endpoints -----------------

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Create / Save Greeting
app.post('/api/v1/greetings', (req, res) => {
  try {
    const greetingData = req.body;
    if (!greetingData) {
      return res.status(400).json({ error: 'Missing greeting payload' });
    }

    const id = greetingData.id || Math.random().toString(36).substring(2, 10);
    const editToken = Math.random().toString(36).substring(2, 14);

    const doc: StoredGreeting = {
      id,
      data: { ...greetingData, id },
      createdAt: new Date().toISOString(),
      editToken
    };

    greetingsStore.set(id, doc);
    saveStoreToDisk();

    return res.json({
      id,
      editToken,
      url: `/g/${id}`,
      success: true
    });
  } catch (err: any) {
    console.error('Error saving greeting:', err);
    return res.status(500).json({ error: 'Failed to save greeting' });
  }
});

// Update / Modify Existing Greeting
app.put('/api/v1/greetings/:id', (req, res) => {
  try {
    const { id } = req.params;
    const greetingData = req.body;
    if (!greetingData) {
      return res.status(400).json({ error: 'Missing greeting payload' });
    }

    const existing = greetingsStore.get(id);
    const editToken = existing ? existing.editToken : Math.random().toString(36).substring(2, 14);

    const doc: StoredGreeting = {
      id,
      data: { ...greetingData, id },
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      editToken
    };

    greetingsStore.set(id, doc);
    saveStoreToDisk();

    return res.json({
      id,
      editToken,
      url: `/g/${id}`,
      success: true,
      modified: true
    });
  } catch (err: any) {
    console.error('Error modifying greeting:', err);
    return res.status(500).json({ error: 'Failed to update greeting' });
  }
});

// Get Stored Greeting by ID
app.get('/api/v1/greetings/:id', (req, res) => {
  const { id } = req.params;
  const greeting = greetingsStore.get(id);

  if (!greeting) {
    return res.status(404).json({ error: 'Greeting not found' });
  }

  return res.json(greeting.data);
});

// Wish Wall: Get Wishes
app.get('/api/v1/greetings/:id/wishes', (req, res) => {
  const { id } = req.params;
  const wishes = wishesStore.get(id) || [];
  return res.json({ wishes });
});

// Wish Wall: Post Wish
app.post('/api/v1/greetings/:id/wish', (req, res) => {
  const { id } = req.params;
  const { name, message, emoji } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }

  const current = wishesStore.get(id) || [];
  const newWish = {
    id: Math.random().toString(36).substring(2, 9),
    name: String(name).slice(0, 40),
    message: String(message).slice(0, 300),
    createdAt: 'Just now',
    emoji: emoji || '🎉'
  };

  current.unshift(newWish);
  wishesStore.set(id, current);
  saveStoreToDisk();

  return res.json({ success: true, wish: newWish });
});

// Replies: Post Thank You
app.post('/api/v1/greetings/:id/reply', (req, res) => {
  const { id } = req.params;
  const { name, reaction, message } = req.body;

  const current = repliesStore.get(id) || [];
  const newReply = {
    id: Math.random().toString(36).substring(2, 9),
    name: name || 'Recipient',
    reaction: reaction || '❤️',
    message: message || 'Thank you so much for this incredible greeting!',
    createdAt: new Date().toISOString()
  };

  current.unshift(newReply);
  repliesStore.set(id, current);
  saveStoreToDisk();

  return res.json({ success: true, reply: newReply });
});

app.get('/api/v1/greetings/:id/replies', (req, res) => {
  const { id } = req.params;
  const replies = repliesStore.get(id) || [];
  return res.json({ replies });
});

// AI Draft Generator: POST /api/v1/ai/draft
app.post('/api/v1/ai/draft', async (req, res) => {
  try {
    const { occasion, recipientName, relationship, tone, language, insideJoke, details } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback creative English templates if API key is not configured
      const fallbacks = [
        `Happy Birthday, ${recipientName || 'friend'}! May your year ahead be drenched in golden sunshine, belly laughs, and every wild dream your radiant heart has ever dared to imagine. So endlessly lucky to celebrate you!`,
        `Another orbit completed around the sun, and you have officially leveled up to legendary status! Here is to more spontaneous adventures, late-night talks, and laughing until our sides ache. Happy Birthday, ${recipientName || 'friend'}!`,
        `Dear ${recipientName || 'friend'}, some people make the entire world feel softer, kinder, and so much more wonderful simply by being in it. You are undeniably one of those rare souls. Wishing you the happiest birthday yet!`
      ];
      return res.json({ drafts: fallbacks, model: 'fallback-curated' });
    }

    const prompt = `You are Greetkit's master creative greeting writer. Generate 3 distinct, highly creative and memorable greeting message drafts in English for a personalized interactive web greeting.
Parameters:
- Occasion: ${occasion || 'birthday'}
- Recipient Nickname: ${recipientName || 'friend'}
- Relationship: ${relationship || 'friend'}
- Preferred Tone: ${tone || 'warm, creative and witty'}
- Language: English (must be in creative, expressive English with vivid imagery and warmth)
- Inside jokes / shared memories: ${insideJoke || 'None provided'}
- Extra details: ${details || 'None provided'}

Guidelines:
- Write strictly in creative, expressive English.
- Use the recipient's nickname naturally and warmly.
- Draft 1: Luminous and heartfelt, celebrating their unique spirit and radiance.
- Draft 2: Clever, witty, and playful with fun energetic metaphors.
- Draft 3: Poetic and inspiring, wishing big adventures and golden days ahead.
- Keep each draft between 2 and 4 sentences.
- Output ONLY valid JSON in this exact structure:
{
  "drafts": [
    "Draft 1 text...",
    "Draft 2 text...",
    "Draft 3 text..."
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ drafts: parsed.drafts || [], model: 'gemini-3.8-flash' });
  } catch (err: any) {
    console.error('Error in AI drafting:', err);
    // Graceful fallback
    return res.json({
      drafts: [
        `Happy celebration! May this day bring you endless laughter and bright new adventures.`,
        `Wishing you the absolute happiest of days filled with all your favorite things!`,
        `So grateful for you and cheering you on in everything this year brings!`
      ],
      model: 'fallback-recovery'
    });
  }
});

// AI Slots Generator: POST /api/v1/ai/fill-slots
// Fills candle blowout reasons, level-up perks, diya blessings, or balloon pop cards
app.post('/api/v1/ai/fill-slots', async (req, res) => {
  try {
    const { engine, recipientName, relationship, count = 5, occasion = 'birthday' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Smart fallbacks by engine
      if (engine === 'blowout') {
        return res.json({
          slots: [
            `Your contagious laughter`,
            `Always being there when needed`,
            `The amazing adventures we share`,
            `Your unstoppable creativity`,
            `Making every room brighter`
          ]
        });
      } else if (engine === 'constellation-star') {
        return res.json({
          slots: [
            `Guided by your radiant starlight`,
            `Your kindness shines through every night`,
            `A soul that makes every galaxy warmer`,
            `Woven into our favorite memories`,
            `Destined for astronomical joy this year`
          ]
        });
      } else if (engine === 'magic-balloon-lift') {
        return res.json({
          slots: [
            `Soaring to new heights this year!`,
            `Unstoppable dreams taking flight!`,
            `Endless sunshine above the clouds!`,
            `Floating with pure birthday bliss!`,
            `Elevating every room you enter!`
          ]
        });
      } else if (engine === 'dandelion') {
        return res.json({
          slots: [
            `May unexpected beauty catch your breath.`,
            `May every deep dream take root and bloom.`,
            `Gentle laughter carried on every summer breeze.`,
            `Boundless warmth and peace in your heart.`,
            `Wishing you the happiest birthday yet!`
          ]
        });
      } else if (engine === 'fortune-cookie') {
        return res.json({
          slots: [
            `A golden milestone awaits: this year the universe conspires to bring your boldest, brightest ambition to life.`,
            `Your infectious optimism will open an extraordinary new door before the next moon.`
          ]
        });
      } else if (engine === 'timeline') {
        return res.json({
          slots: [
            { date: "Chapter 1", title: "When Worlds Crossed", story: "From the very first day, your vibrant energy made everything ten times brighter." },
            { date: "Chapter 2", title: "Adventures & Inside Jokes", story: "Spontaneous road trips, singing throwback hits with windows down, and laughing till our ribs hurt." },
            { date: "Today", title: "Celebrating You", story: "Cheers to another legendary year of you being the most loyal, luminous human on earth." }
          ]
        });
      } else if (engine === 'level-up') {
        return res.json({
          slots: [
            `+50 Wisdom & Experience`,
            `+100 Charm & Charisma`,
            `Master Perk: Chef of Chaos`,
            `Special Ability: Boundless Energy`,
            `Achievement Unlocked: Legendary Soul`
          ]
        });
      } else {
        return res.json({
          slots: [
            `Peace in every thought`,
            `Health and vital energy`,
            `Endless warm laughter`,
            `Unfolding opportunities`,
            `Abundance in heart and home`
          ]
        });
      }
    }

    const prompt = `Generate ${count} short, delightful items (one punchy sentence or phrase each, under 10 words) for an interactive greeting engine:
Engine type: "${engine}" (e.g. "constellation-star" celestial blessings, "magic-balloon-lift" celebratory lift notes, "dandelion" gentle wish notes, "blowout" reasons per candle, "fortune-cookie" fortune, "timeline" milestone stories)
Recipient: ${recipientName || 'friend'} (${relationship || 'friend'})
Occasion: ${occasion}

Output ONLY valid JSON in format:
{
  "slots": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ slots: parsed.slots || [] });
  } catch (err: any) {
    console.error('Error generating slots:', err);
    return res.json({
      slots: [
        "Your incredible kindness",
        "Your witty humor",
        "The memories we cherish",
        "Your inspiring drive",
        "Being one of a kind"
      ]
    });
  }
});

// AI Style Suggester: POST /api/v1/ai/suggest-style
app.post('/api/v1/ai/suggest-style', async (req, res) => {
  try {
    const { description, occasion } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        engine: 'blowout',
        skin: 'pink-cake',
        accent: '#f43f5e',
        font: 'serif',
        tone: 'sweet',
        rationale: 'A classic celebratory blowout cake is universally loved and delightfully tactile.'
      });
    }

    const prompt = `Based on this description of the person/occasion, pick the best interactive greeting setup:
Description: "${description}"
Occasion: "${occasion}"

Available engines:
- "blowout": birthday/anniversary candle blowing (great for classic celebrations, sentimental or sweet)
- "tap-light": diya lighting / lanterns (great for Diwali, Eid, serene, spiritual, warm blessings)
- "level-up": RPG gamer stats, XP bar, unlocking perks (great for tech, gamers, milestone birthdays, career promotions)
- "lift-off": balloon / rocket rising to stratosphere (great for big dreams, graduation, adventurous spirits)
- "reveal": scratch-card surprise (great for gifts, secret news, playful suspense)
- "pop": popping balloons (great for high energy, colorful, playful friends)
- "grow": blooming tree/flower (great for thank you, nature lovers, calm mindfulness)

Output ONLY valid JSON:
{
  "engine": "blowout|tap-light|level-up|lift-off|reveal|pop|grow",
  "skin": "pink-cake|diwali-diya|gamer-levelup|sky-balloon|scratch-gold|pastel-pop|blooming-garden",
  "accent": "#hexColor",
  "font": "serif|sans|display|mono",
  "tone": "sweet|funny|emotional|poetic|formal",
  "rationale": "One brief sentence explaining why this matches them."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err) {
    return res.json({
      engine: 'blowout',
      skin: 'pink-cake',
      accent: '#f43f5e',
      font: 'serif',
      tone: 'sweet',
      rationale: 'Classic blowout cake with heartfelt reasons.'
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Greetkit server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
