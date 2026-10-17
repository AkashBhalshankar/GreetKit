import React, { useState, useEffect } from 'react';
import { Greeting, Block, Occasion, Relationship, Tone, Language, EngineType, PaletteMode } from '../types/greeting';
import { Player } from '../viewer/Player';
import { AiDraftModal } from '../studio/AiDraftModal';
import { ShareModal } from '../studio/ShareModal';
import {
  Sparkles,
  Share2,
  Eye,
  Wand2,
  ChevronRight,
  Plus,
  Trash2,
  RotateCcw,
  Palette,
  Layers,
  Heart,
  Volume2,
  Calendar,
  Lock,
  ArrowLeft,
  Check,
  Gift,
  Sun,
  Moon,
  Edit3,
  Image as ImageIcon,
  Upload,
  Camera,
} from 'lucide-react';
import {
  playHappyBirthdayRingtone,
  stopHappyBirthdayRingtone,
  isHappyBirthdayRingtonePlaying,
} from '../lib/audio';
import { VoiceNoteRecorder } from '../components/VoiceNoteRecorder';
import { SignaturePad } from '../components/SignaturePad';
import { generateAiDrafts, generateAiSlots } from '../lib/api';

interface Props {
  initialGreeting?: Greeting;
  onBackToHome: () => void;
}

export const Studio: React.FC<Props> = ({ initialGreeting, onBackToHome }) => {
  const [greeting, setGreeting] = useState<Greeting>(() => {
    if (initialGreeting) return initialGreeting;
    return {
      v: 1,
      id: Math.random().toString(36).substring(2, 10),
      occasion: 'birthday',
      relationship: 'friend',
      tone: 'funny',
      lang: 'en',
      recipient: { name: '', nickname: '', age: 25 },
      sender: { name: '' },
      theme: {
        skin: 'patisserie-cream',
        accent: '#B85D3B',
        font: 'serif',
        music: 'happy-birthday-ringtone',
        ending: 'confetti',
        paletteMode: 'earthen',
      },
      flow: [
        {
          type: 'scene',
          engine: 'blowout',
          props: {
            title: 'Make a wish & blow out the candles!',
            candles: 5,
            reasons: [
              'Your laugh turns stormy days into pure golden sunshine',
              'You have an uncanny radar for the best food and cozy spots',
              'Your untamed creativity and fierce loyalty inspire everyone',
              'You make every ordinary moment feel like an unforgettable adventure',
              'This year is your grandest celestial level-up yet!',
            ],
            showReasons: true,
          },
        },
        {
          type: 'message',
          text: 'Happy Birthday! May your day be painted in golden light, overflowing with belly laughs, spontaneous adventures, and every dream your wild, beautiful heart has ever dared to imagine. So endlessly proud of the radiant soul you are!',
          author: '',
          voiceNoteSimulated: true,
        },
        {
          type: 'photos',
          items: [
            {
              url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
              caption: 'Unforgettable moments & endless laughter ✨',
            },
            {
              url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=80',
              caption: 'Cheers to another year of legendary times 🎂',
            },
          ],
        },
        {
          type: 'timeline',
          items: [
            { date: 'Chapter 1', title: 'The Serendipity', story: 'When our paths first crossed and the world immediately became a lot brighter.' },
            { date: 'Chapter 2', title: 'Wild Adventures', story: 'Singing throwback anthems at full volume with the windows rolled down.' },
            { date: 'Today', title: 'Your Radiant Day', story: 'Celebrating the incredible human you are and the magic yet to unfold.' },
          ],
        },
        {
          type: 'signature',
          senderName: '',
          handNote: 'Sent across the miles with pure heartfelt affection.',
          signatureDataUrl: '',
        },
        {
          type: 'final',
          cta: 'make-your-own',
          wishWallEnabled: true,
        },
      ],
      delivery: {},
      features: { privateWish: true, wishWall: true, soundFx: true },
      createdAt: new Date().toISOString(),
    };
  });

  // Dedicated screen modes: 'edit' or 'preview'
  const [studioScreen, setStudioScreen] = useState<'edit' | 'preview'>('edit');
  const [isPlayingRingtone, setIsPlayingRingtone] = useState(false);

  const [activeTab, setActiveTab] = useState<'basics' | 'engine' | 'blocks' | 'theme'>('basics');
  const [showAiModal, setShowAiModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSwitchEngineList, setShowSwitchEngineList] = useState(false);
  const [aiGeneratingSection, setAiGeneratingSection] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    if (initialGreeting) {
      setGreeting(initialGreeting);
      setPreviewKey((k) => k + 1);
    }
  }, [initialGreeting]);

  useEffect(() => {
    return () => {
      stopHappyBirthdayRingtone();
    };
  }, []);

  const reloadPreview = () => setPreviewKey((k) => k + 1);

  const toggleBirthdayRingtone = () => {
    if (isPlayingRingtone) {
      stopHappyBirthdayRingtone();
      setIsPlayingRingtone(false);
    } else {
      setIsPlayingRingtone(true);
      playHappyBirthdayRingtone(true, () => setIsPlayingRingtone(false));
    }
  };

  const updateRecipient = (updates: Partial<Greeting['recipient']>) => {
    setGreeting((prev) => {
      const oldName = prev.recipient.name;
      const newName = updates.name !== undefined ? updates.name : oldName;
      const oldNick = prev.recipient.nickname;
      const newNick = updates.nickname !== undefined ? updates.nickname : oldNick;
      const newAge = updates.age !== undefined ? updates.age : prev.recipient.age;

      // Re-key ID away from demo sample ID if recipient name is being customized
      let newId = prev.id;
      if (newName && (prev.id === 'priya-25' || prev.id.startsWith('priya-') || prev.id === 'pinata-bday')) {
        const cleanSlug = newName.toLowerCase().replace(/[^a-z0-9]/g, '');
        newId = `bday-${cleanSlug || 'celebration'}-${Math.random().toString(36).substring(2, 6)}`;
      }

      // Update flow text to replace legacy names dynamically
      const newFlow = prev.flow.map((block) => {
        if (block.type === 'message') {
          let updatedText = block.text;
          if (oldName && newName && oldName !== newName) {
            updatedText = updatedText.replace(new RegExp(oldName, 'gi'), newName);
          } else if (!oldName && newName) {
            if (!updatedText.includes(newName)) {
              updatedText = updatedText.replace(/Happy Birthday!?/i, `Happy Birthday, ${newName}!`);
            }
          }
          // Clean up any lingering Priya or placeholder
          if (newName) {
            updatedText = updatedText.replace(/\bPriya\b/gi, newName);
            updatedText = updatedText.replace(/\bPri\b/gi, newNick || newName);
            updatedText = updatedText.replace(/\bMateo\b/gi, newName);
            updatedText = updatedText.replace(/\{recipient\}/gi, newName);
            updatedText = updatedText.replace(/\{name\}/gi, newName);
          }
          if (oldNick && newNick && oldNick !== newNick) {
            updatedText = updatedText.replace(new RegExp(oldNick, 'gi'), newNick);
          }
          return { ...block, text: updatedText };
        }
        if (block.type === 'scene') {
          let updatedProps = { ...block.props };
          if (updatedProps.title && newName) {
            updatedProps.title = updatedProps.title.replace(/\bPriya\b/gi, newName).replace(/\bMateo\b/gi, newName);
          }
          if (updatedProps.bannerMessage && newName) {
            updatedProps.bannerMessage = updatedProps.bannerMessage.replace(/\bPriya\b/gi, newName).replace(/\bMaya\b/gi, newName);
          }
          if (block.engine === 'fortune-cookie') {
            let msg = updatedProps.fortuneMessage || '';
            if (newName) {
              msg = msg.replace(/\bPriya\b/gi, newName).replace(/\{name\}/gi, newName);
              if (oldName && oldName !== newName) msg = msg.replace(new RegExp(oldName, 'gi'), newName);
            }
            updatedProps.fortuneMessage = msg;
          }
          if (block.engine === 'pinata-smash') {
            let title = updatedProps.title || '';
            if (newName) {
              title = title.replace(/\bPriya\b/gi, newName).replace(/\bMateo\b/gi, newName);
              if (oldName && oldName !== newName) title = title.replace(new RegExp(oldName, 'gi'), newName);
            }
            updatedProps.title = title;
          }
          return { ...block, props: updatedProps };
        }
        if (block.type === 'timeline') {
          const updatedItems = (block.items || []).map((item) => ({
            ...item,
            title: newName ? item.title.replace(/\bPriya\b/gi, newName).replace(/\bMateo\b/gi, newName) : item.title,
            story: newName
              ? item.story.replace(/\bPriya\b/gi, newName).replace(/\bPri\b/gi, newName).replace(/\bMateo\b/gi, newName).replace(/\{name\}/gi, newName)
              : item.story,
          }));
          return { ...block, items: updatedItems };
        }
        if (block.type === 'secret') {
          return {
            ...block,
            question: newName ? block.question.replace(/\bPriya\b/gi, newName) : block.question,
          };
        }
        return block;
      });

      return {
        ...prev,
        id: newId,
        recipient: { ...prev.recipient, ...updates },
        flow: newFlow,
      };
    });
  };

  const updateSender = (updates: Partial<Greeting['sender']>) => {
    setGreeting((prev) => {
      const oldSender = prev.sender.name;
      const newSender = updates.name !== undefined ? updates.name : oldSender;

      const newFlow = prev.flow.map((block) => {
        if (block.type === 'message') {
          let updatedText = block.text;
          if (oldSender && newSender && oldSender !== newSender) {
            updatedText = updatedText.replace(new RegExp(oldSender, 'gi'), newSender);
          }
          if (newSender) {
            updatedText = updatedText.replace(/\bAkash\b/gi, newSender).replace(/\{sender\}/gi, newSender);
          }
          return { ...block, author: newSender || '', text: updatedText };
        }
        if (block.type === 'signature') {
          return { ...block, senderName: newSender || '' };
        }
        return block;
      });

      return {
        ...prev,
        sender: { ...prev.sender, ...updates },
        flow: newFlow,
      };
    });
  };

  const handleAiFillSceneProps = async (engineType: string) => {
    setAiGeneratingSection(engineType);
    try {
      const nick = greeting.recipient.nickname || greeting.recipient.name || 'Friend';
      const res = await generateAiSlots({
        engine: engineType,
        recipientName: nick,
        relationship: greeting.relationship,
        count: 5,
        occasion: 'birthday',
      });
      if (res && res.slots && res.slots.length > 0) {
        setGreeting((prev) => ({
          ...prev,
          flow: prev.flow.map((b) => {
            if (b.type === 'scene') {
              if (engineType === 'blowout') {
                return { ...b, props: { ...b.props, reasons: res.slots } };
              } else if (engineType === 'constellation-star') {
                return { ...b, props: { ...b.props, blessings: res.slots } };
              } else if (engineType === 'magic-balloon-lift') {
                return { ...b, props: { ...b.props, perks: res.slots, bannerMessage: `Happy Birthday ${nick}!` } };
              } else if (engineType === 'dandelion') {
                return { ...b, props: { ...b.props, wishNotes: res.slots } };
              } else if (engineType === 'fortune-cookie') {
                return { ...b, props: { ...b.props, fortuneMessage: res.slots[0] } };
              } else if (engineType === 'pinata-smash') {
                return { ...b, props: { ...b.props, candies: res.slots } };
              }
            }
            return b;
          }),
        }));
        reloadPreview();
      }
    } catch (err) {
      console.warn('AI fill slots error:', err);
    } finally {
      setAiGeneratingSection(null);
    }
  };

  const handleAiGenerateLetter = async () => {
    setAiGeneratingSection('message');
    try {
      const nick = greeting.recipient.nickname || greeting.recipient.name || 'Friend';
      const res = await generateAiDrafts({
        occasion: 'birthday',
        recipientName: nick,
        relationship: greeting.relationship,
        tone: greeting.tone,
        language: 'en',
      });
      if (res && res.drafts && res.drafts[0]) {
        setGreeting((prev) => ({
          ...prev,
          flow: prev.flow.map((b) => (b.type === 'message' ? { ...b, text: res.drafts[0] } : b)),
        }));
        reloadPreview();
      }
    } catch (err) {
      console.warn('AI letter error:', err);
    } finally {
      setAiGeneratingSection(null);
    }
  };

  const handleAiGenerateTimeline = async () => {
    setAiGeneratingSection('timeline');
    try {
      const nick = greeting.recipient.nickname || greeting.recipient.name || 'Friend';
      const res = await generateAiSlots({
        engine: 'timeline',
        recipientName: nick,
        relationship: greeting.relationship,
        occasion: 'birthday',
      });
      if (res && res.slots && Array.isArray(res.slots)) {
        const timelineItems = res.slots.map((item: any, idx: number) => {
          if (typeof item === 'object' && item !== null && item.story) {
            return {
              date: item.date || `Chapter ${idx + 1}`,
              title: item.title || `Milestone ${idx + 1}`,
              story: item.story,
            };
          }
          return {
            date: `Chapter ${idx + 1}`,
            title: typeof item === 'string' ? item.slice(0, 24) : `Milestone ${idx + 1}`,
            story: typeof item === 'string' ? item : 'An unforgettable memory together.',
          };
        });
        setGreeting((prev) => ({
          ...prev,
          flow: prev.flow.map((b) => (b.type === 'timeline' ? { ...b, items: timelineItems } : b)),
        }));
        reloadPreview();
      }
    } catch (err) {
      console.warn('AI timeline error:', err);
    } finally {
      setAiGeneratingSection(null);
    }
  };

  const updateTheme = (updates: Partial<Greeting['theme']>) => {
    setGreeting((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...updates },
    }));
    reloadPreview();
  };

  const setEngineType = (newEngine: EngineType) => {
    setGreeting((prev) => {
      let defaultProps: any = {};
      let defaultSkin = prev.theme.skin;

      switch (newEngine) {
        case 'blowout':
          defaultSkin = 'patisserie-cream';
          defaultProps = {
            title: 'Make a wish & blow out the candles!',
            candles: 5,
            reasons: [
              'Your radiant smile',
              'Always there with wisdom',
              'The funniest jokes in the room',
              'Incredible loyalty & kindness',
              'Making every day an adventure',
            ],
            showReasons: true,
          };
          break;
        case 'fortune-cookie':
          defaultSkin = 'golden-sand';
          defaultProps = {
            title: 'Crack Your Birthday Fortune',
            fortuneMessage: `This year will bring unexpected joy, legendary road trips, and boundless love for ${prev.recipient.name}!`,
            luckyNumbers: '7 · 14 · 21 · 25 · 42',
          };
          break;
        case 'magic-lamp':
          defaultSkin = 'golden-sand';
          defaultProps = {
            title: 'Rub the Magic Wishing Lamp',
            wishesGranted: [
              'Wish 1: Boundless vitality and joyful health throughout the year',
              'Wish 2: Creative breakthroughs and effortless success in all you do',
              'Wish 3: Deep, abiding love, belly laughs, and unwavering friendships',
            ],
          };
          break;
        case 'dandelion':
          defaultSkin = 'sage-botanical';
          defaultProps = {
            title: 'Blow Dandelion Birthday Wishes',
            wishNotes: [
              'May light follow every step you take.',
              'May true laughter fill your days.',
              'May unexpected beauty catch your breath.',
              'May every deep dream take root and bloom.',
              'Wishing you the happiest birthday yet!',
            ],
          };
          break;
        case 'piano-tune':
          defaultSkin = 'patisserie-cream';
          defaultProps = {
            title: 'Play the Birthday Melody',
            songTitle: 'Happy Birthday to You',
          };
          break;
        case 'tap-light':
          defaultSkin = 'terracotta-clay';
          defaultProps = {
            title: 'Light the Sacred Diyas',
            itemsCount: 5,
            blessings: [
              'Peace in your home',
              'Health and abundance',
              'Endless laughter',
              'Spiritual wisdom',
              'Triumph of light!',
            ],
          };
          break;
        case 'level-up':
          defaultSkin = 'arcade-linen';
          defaultProps = {
            title: 'ANNUAL LEVEL-UP QUEST',
            currentLevel: prev.recipient.age ? prev.recipient.age - 1 : 24,
            nextLevel: prev.recipient.age || 25,
            characterTitle: '★ SUPREME LEGEND ★',
            perksUnlocked: [
              '+50 Charisma Boost',
              'Master Perk: Chef of Chaos',
              'Infinite Wisdom',
              'Immunity to Boring Days',
            ],
          };
          break;
        case 'magic-balloon-lift':
        case 'lift-off':
          defaultSkin = 'patisserie-cream';
          defaultProps = {
            title: 'Magic Birthday Balloon Lift',
            bannerMessage: `Happy Birthday ${prev.recipient.nickname || prev.recipient.name || 'Friend'}!`,
            perks: [
              '🎈 Balloon 1 (Coral): Overflowing Joy & Pure Laughter',
              '🎈 Balloon 2 (Golden): Radiant Vitality & Glowing Health',
              '🎈 Balloon 3 (Lavender): Extraordinary Dreams Taking Flight',
              '🎈 Balloon 4 (Mint): Deep Loyal Friendships & Warm Hugs',
              '🎈 Balloon 5 (Sky Blue): Maximum Buoyancy! Lift Off Time!',
            ],
          };
          break;
        case 'type-out':
          defaultSkin = 'parchment-letter';
          defaultProps = {
            header: 'A Letter Written In Ink',
            typedLines: [
              `Dear ${prev.recipient.name},`,
              'Some people make the world quieter, softer, and so much more wonderful.',
              'You are undeniably one of those rare souls.',
              'Wishing you a magnificent birthday year ahead!',
            ],
          };
          break;
        case 'reveal':
          defaultSkin = 'golden-sand';
          defaultProps = {
            title: 'Scratch Card Surprise',
            secretMessage: `Happy Birthday ${prev.recipient.name}! You are a true gift!`,
          };
          break;
        case 'pop':
          defaultSkin = 'patisserie-cream';
          defaultProps = {
            title: 'Pop the Balloons',
            balloonsCount: 5,
            messages: ['Pure Joy!', 'Wild Success!', 'Great Health!', 'Endless Smiles!', 'Limitless Love!'],
          };
          break;
        case 'grow':
          defaultSkin = 'sage-botanical';
          defaultProps = {
            title: 'Tap to Water & Bloom',
            stages: [
              'A seed of love planted...',
              'Nurtured with cherished memories...',
              'Unfurling leaves in the sun...',
              'In breathtaking bloom for you!',
            ],
            finalNote: 'May your dreams blossom!',
          };
          break;
        case 'catch':
          defaultSkin = 'golden-sand';
          defaultProps = {
            title: 'Catch 5 Lucky Stars',
            targetScore: 5,
            completionMessage: 'All blessings collected! Pure magic ahead!',
          };
          break;
        case 'pinata-smash':
          defaultSkin = 'patisserie-cream';
          defaultProps = {
            title: `Birthday Piñata Fiesta for ${prev.recipient.name}!`,
            swingsNeeded: 4,
            wishes: [
              `Happy Birthday ${prev.recipient.name}! May this year shatter every ceiling!`,
              'May laughter and good friends surround you in every moment!',
              'Leveling up into your most triumphant era yet!',
              'You bring genuine sunshine to everyone who knows you!',
            ],
            goodies: ['🍬', '🍭', '⭐', '✨', '🍫', '🎉', '🎁'],
          };
          break;
        case 'constellation-star':
          defaultSkin = 'golden-sand';
          defaultProps = {
            title: `The ${prev.recipient.name} Crown Constellation`,
            starBlessings: [
              'Radiance: Your spirit lights up every room',
              'Wisdom: You see deep beauty and kindness',
              'Courage: You inspire us to live boldly',
              'Wonder: May childlike joy follow you everywhere',
              'Ascent: This year brings your highest heights',
            ],
          };
          break;
        case 'birthday-vinyl':
          defaultSkin = 'patisserie-cream';
          defaultProps = {
            title: `${prev.recipient.name}'s Golden Year LP`,
            albumName: 'Birthday Anthems Vol. 1',
            trackTitle: 'Ode to Your Radiance',
            dedications: [
              'Track 1: "Ode to Your Chaos & Pure Laughter"',
              'Track 2: "Midnight Road Trips & 2000s Anthems"',
              'Track 3: "Unstoppable Ambition & New Milestones"',
              'Track 4: "Forever Young & Deeply Loved"',
            ],
          };
          break;
      }

      const updatedFlow = prev.flow.map((b) => {
        if (b.type === 'scene') {
          return { ...b, engine: newEngine, props: defaultProps };
        }
        return b;
      });

      return {
        ...prev,
        theme: { ...prev.theme, skin: defaultSkin },
        flow: updatedFlow,
      };
    });
    reloadPreview();
  };

  const applyBirthdayVariant = (variantKey: string) => {
    switch (variantKey) {
      case 'cake':
        setEngineType('blowout');
        break;
      case 'pinata':
        setEngineType('pinata-smash');
        break;
      case 'constellation':
        setEngineType('constellation-star');
        break;
      case 'vinyl':
        setEngineType('birthday-vinyl');
        break;
      case 'fortune':
        setEngineType('fortune-cookie');
        break;
      case 'lamp':
        setEngineType('magic-lamp');
        break;
      case 'dandelion':
        setEngineType('dandelion');
        break;
      case 'tune':
        setEngineType('piano-tune');
        break;
      case 'arcade':
        setEngineType('level-up');
        break;
      case 'balloon':
        setEngineType('lift-off');
        break;
      case 'scratch':
        setEngineType('reveal');
        break;
      case 'pop':
        setEngineType('pop');
        break;
      case 'bloom':
        setEngineType('grow');
        break;
      case 'stars':
        setEngineType('catch');
        break;
      case 'letter':
        setEngineType('type-out');
        break;
    }
  };

  const sceneBlock = greeting.flow.find((b) => b.type === 'scene') as any;

  const addBlock = (type: Block['type']) => {
    setGreeting((prev) => {
      let newBlock: Block;
      switch (type) {
        case 'message':
          newBlock = {
            type: 'message',
            text: `Wishing you all the happiness in the world, ${prev.recipient.name}!`,
            author: prev.sender.name,
          };
          break;
        case 'photos':
          newBlock = {
            type: 'photos',
            items: [
              {
                url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
                caption: 'Cherished memories together',
              },
            ],
          };
          break;
        case 'timeline':
          newBlock = {
            type: 'timeline',
            items: [
              { date: 'Year 1', title: 'First Chapter', story: 'Where it all began' },
              { date: 'Today', title: 'Celebrating You', story: 'Cheering you on always' },
            ],
          };
          break;
        case 'secret':
          newBlock = {
            type: 'secret',
            question: 'What is our inside joke nickname?',
            acceptedAnswers: ['coffee', 'pri'],
            answerHint: 'Think of late night study sessions',
          };
          break;
        case 'signature':
          newBlock = {
            type: 'signature',
            senderName: prev.sender.name,
            handNote: 'With all my warmest love and hugs.',
          };
          break;
        default:
          return prev;
      }

      const finalIndex = prev.flow.findIndex((b) => b.type === 'final');
      const nextFlow = [...prev.flow];
      if (finalIndex !== -1) {
        nextFlow.splice(finalIndex, 0, newBlock);
      } else {
        nextFlow.push(newBlock);
      }
      return { ...prev, flow: nextFlow };
    });
    reloadPreview();
  };

  const removeBlock = (index: number) => {
    if (greeting.flow[index].type === 'final' || greeting.flow[index].type === 'scene') {
      alert('The interactive scene and final celebration are core required blocks.');
      return;
    }
    setGreeting((prev) => ({
      ...prev,
      flow: prev.flow.filter((_, idx) => idx !== index),
    }));
    reloadPreview();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C241E] flex flex-col font-sans">
      {/* Top Navbar: Compact, responsive, no horizontal scroll */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFC8] px-3 sm:px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-[#F3ECE0] text-[#7D6E63] hover:text-[#2C241E] border border-[#DDD5C7] shadow-xs transition-all flex items-center gap-1 text-xs font-medium active:scale-95"
              title="Return to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-[#2C241E] text-sm sm:text-base tracking-tight">
                Greetkit Studio
              </span>
              <span className="text-[10px] sm:text-xs font-semibold bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] px-2 py-0.5 rounded-full truncate max-w-[140px] shadow-xs">
                ✨ {greeting.recipient.nickname || greeting.recipient.name || 'Friend'}
              </span>
            </div>
          </div>

          {/* Center: Edit vs Live Preview Toggle */}
          <div className="flex items-center p-0.5 sm:p-1 rounded-2xl bg-[#F0EAE1] border border-[#DDD5C7]/80 shadow-inner">
            <button
              type="button"
              onClick={() => setStudioScreen('edit')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                studioScreen === 'edit'
                  ? 'bg-white text-[#2C241E] shadow-sm'
                  : 'text-[#7D6E63] hover:text-[#2C241E]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-[#B85D3B]" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStudioScreen('preview');
                reloadPreview();
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                studioScreen === 'preview'
                  ? 'bg-white text-[#2C241E] shadow-sm'
                  : 'text-[#7D6E63] hover:text-[#2C241E]'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[#B85D3B]" />
              <span>Preview</span>
            </button>
          </div>

          {/* Right: Birthday Tune & Share */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleBirthdayRingtone}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                isPlayingRingtone
                  ? 'bg-amber-400 text-stone-950 border-amber-500 animate-pulse'
                  : 'bg-white hover:bg-[#FAF4EB] text-[#B85D3B] border-[#DDD5C7]'
              }`}
              title="Toggle Happy Birthday Melody"
            >
              <span>🎂</span>
              <span className="hidden md:inline">{isPlayingRingtone ? 'Tune Playing 🎵' : 'Birthday Tune'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-md shadow-[#B85D3B]/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* SCREEN 1: DEDICATED EDIT SCREEN */}
      {studioScreen === 'edit' && (
        <main className="flex-1 flex flex-col overflow-y-auto pb-24">
          <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="bg-[#FFFDF9] border border-[#E8DFC8] rounded-3xl p-5 sm:p-7 shadow-sm">
              {/* Subtabs Header */}
              <div className="flex border-b border-[#E8DFC8] pb-3 mb-6 gap-1.5 text-xs">
            {[
              { id: 'basics', label: '1. Basics', icon: Heart },
              { id: 'engine', label: '2. Interaction', icon: Wand2 },
              { id: 'blocks', label: '3. Story Flow', icon: Layers },
              { id: 'theme', label: '4. Colors & Theme', icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 px-1 rounded-2xl font-medium transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-white text-[#B85D3B] font-semibold border border-[#E8DFC8] shadow-sm'
                      : 'text-[#7D6E63] hover:text-[#2C241E] hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-5 sm:p-6 space-y-6 flex-1">
            {/* TAB 1: BASICS */}
            {activeTab === 'basics' && (
              <div className="space-y-4 animate-in fade-in">
                {/* Recipient Details */}
                <div className="p-4 rounded-3xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-3">
                  <span className="text-xs font-serif font-bold text-[#8C6D53] uppercase tracking-wider block">
                    Recipient Information
                  </span>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] text-[#7D6E63] font-medium block">
                        Their Nickname *
                      </label>
                      <span className="text-[10px] text-[#B85D3B] font-mono font-semibold bg-[#FAF4EB] px-2 py-0.5 rounded-full border border-[#E8DFC8]">
                        Single Name Only
                      </span>
                    </div>
                    <input
                      type="text"
                      value={greeting.recipient.nickname || greeting.recipient.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateRecipient({ name: val, nickname: val });
                      }}
                      placeholder="e.g. Pri, Sunshine, Leo, Alex, Champ"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] focus:outline-none focus:ring-1 focus:ring-[#B85D3B] font-medium shadow-xs"
                    />
                    <p className="text-[10px] text-[#8C6D53] mt-1.5 italic">
                      ✨ Keep one nickname only — this exact name will seamlessly personalize their cake, letter, stories, and surprise gate.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#7D6E63] block mb-1">Age / Milestone</label>
                      <input
                        type="number"
                        value={greeting.recipient.age || ''}
                        onChange={(e) =>
                          updateRecipient({ age: e.target.value ? Number(e.target.value) : undefined })
                        }
                        placeholder="e.g. 25"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] focus:outline-none focus:ring-1 focus:ring-[#B85D3B]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#7D6E63] block mb-1">Relationship</label>
                      <select
                        value={greeting.relationship}
                        onChange={(e) => setGreeting((prev) => ({ ...prev, relationship: e.target.value as any }))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] focus:outline-none"
                      >
                        <option value="friend">Friend</option>
                        <option value="partner">Partner / Love</option>
                        <option value="sibling">Sibling</option>
                        <option value="parent">Parent</option>
                        <option value="colleague">Colleague</option>
                        <option value="teacher">Teacher</option>
                        <option value="child">Child</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sender Details */}
                <div className="p-4 rounded-3xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-3">
                  <span className="text-xs font-serif font-bold text-[#8C6D53] uppercase tracking-wider block">
                    Sender Information
                  </span>
                  <div>
                    <label className="text-[11px] text-[#7D6E63] block mb-1">Your Name *</label>
                    <input
                      type="text"
                      value={greeting.sender.name}
                      onChange={(e) => updateSender({ name: e.target.value })}
                      placeholder="e.g. Sarah (your name)"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] focus:outline-none focus:ring-1 focus:ring-[#B85D3B]"
                    />
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <label className="text-xs font-serif font-bold text-[#2C241E] block mb-2">
                    Greeting Tone
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['funny', 'sweet', 'emotional', 'poetic', 'formal'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setGreeting((prev) => ({ ...prev, tone: t as any }))}
                        className={`px-3.5 py-1.5 rounded-2xl text-xs capitalize border transition-all ${
                          greeting.tone === t
                            ? 'bg-[#FAF4EB] border-[#B85D3B] text-[#B85D3B] font-semibold'
                            : 'bg-[#FAF7F2] border-[#EAE3D9] text-[#7D6E63] hover:text-[#2C241E]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTION ENGINE */}
            {activeTab === 'engine' && (
              <div className="space-y-5 animate-in fade-in">
                {/* Active Interaction Header */}
                <div className="p-4 rounded-3xl bg-[#FAF4EB] border border-[#E8DFC8] space-y-3 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-[#E8DFC8] flex items-center justify-center text-2xl shadow-xs">
                        {sceneBlock?.engine === 'constellation-star' && '✨'}
                        {sceneBlock?.engine === 'magic-balloon-lift' && '🎈'}
                        {sceneBlock?.engine === 'dandelion' && '🌾'}
                        {sceneBlock?.engine === 'blowout' && '🎂'}
                        {sceneBlock?.engine === 'pinata-smash' && '🪅'}
                        {sceneBlock?.engine === 'birthday-vinyl' && '📻'}
                        {sceneBlock?.engine === 'fortune-cookie' && '🥠'}
                        {sceneBlock?.engine === 'level-up' && '🎮'}
                        {!['constellation-star', 'magic-balloon-lift', 'dandelion', 'blowout', 'pinata-smash', 'birthday-vinyl', 'fortune-cookie', 'level-up'].includes(sceneBlock?.engine || '') && '✨'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm sm:text-base text-[#2C241E] capitalize">
                            {sceneBlock?.engine === 'constellation-star' && 'Constellation Stars'}
                            {sceneBlock?.engine === 'magic-balloon-lift' && 'Magic Balloon Lift'}
                            {sceneBlock?.engine === 'dandelion' && 'Dandelion Wishes'}
                            {sceneBlock?.engine === 'blowout' && 'Blowout Candle Cake'}
                            {sceneBlock?.engine === 'pinata-smash' && 'Piñata Fiesta'}
                            {sceneBlock?.engine === 'birthday-vinyl' && 'Retro Birthday Vinyl'}
                            {sceneBlock?.engine === 'fortune-cookie' && 'Fortune Cookie'}
                            {sceneBlock?.engine === 'level-up' && 'Level-Up Quest'}
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white text-[#B85D3B] border border-[#E8DFC8]">
                            Active Interaction
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7D6E63]">
                          Configuring the interactive experience for {greeting.recipient.nickname || greeting.recipient.name || 'your friend'}.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSwitchEngineList(!showSwitchEngineList)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#7D6E63] hover:text-[#2C241E] border border-[#DDD5C7] text-xs font-semibold flex items-center gap-1 shadow-xs transition-all active:scale-95"
                    >
                      <span>{showSwitchEngineList ? 'Hide Styles ▲' : 'Change Style ▾'}</span>
                    </button>
                  </div>

                  {/* Collapsible Alternate Interaction Engines Grid */}
                  {showSwitchEngineList && (
                    <div className="pt-3 border-t border-[#E8DFC8]/60 space-y-2 animate-in fade-in">
                      <span className="text-[11px] font-semibold text-[#8C6D53] block">
                        Switch to an alternate birthday interaction:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { id: 'constellation-star', name: 'Constellation Stars', icon: '✨', desc: 'Tap to connect stars into recipient name' },
                          { id: 'magic-balloon-lift', name: 'Magic Balloon Lift', icon: '🎈', desc: 'Tap to inflate balloons that lift off' },
                          { id: 'dandelion', name: 'Dandelion Wishes', icon: '🌾', desc: 'Mic breath or tap to blow away seeds' },
                          { id: 'blowout', name: 'Blowout Cake', icon: '🎂', desc: 'Mic blow or tap candles to reveal reasons' },
                          { id: 'pinata-smash', name: 'Piñata Fiesta', icon: '🪅', desc: 'Interactive hit & burst candy treats' },
                          { id: 'birthday-vinyl', name: 'Retro Vinyl LP', icon: '📻', desc: 'Drop needle & spin birthday track' },
                          { id: 'fortune-cookie', name: 'Fortune Cookie', icon: '🥠', desc: 'Crack open golden birthday prophecy' },
                          { id: 'level-up', name: 'Level-Up Quest', icon: '🎮', desc: 'XP bar, stats & unlocked perks' },
                        ].map((eng) => (
                          <button
                            key={eng.id}
                            type="button"
                            onClick={() => {
                              setEngineType(eng.id as any);
                              setShowSwitchEngineList(false);
                            }}
                            className={`p-2.5 rounded-2xl border text-left flex items-start gap-2 transition-all ${
                              sceneBlock?.engine === eng.id
                                ? 'bg-white border-[#B85D3B] shadow-xs ring-1 ring-[#B85D3B]/40'
                                : 'bg-white/70 border-[#EAE3D9] hover:bg-white'
                            }`}
                          >
                            <span className="text-lg">{eng.icon}</span>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-xs text-[#2C241E]">{eng.name}</span>
                                {sceneBlock?.engine === eng.id && (
                                  <span className="text-[9px] font-mono text-[#B85D3B] font-bold">✓ Selected</span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#7D6E63] block">{eng.desc}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Engine Props & Custom Messages Editor */}
                {sceneBlock && (
                  <div className="p-5 rounded-3xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E8DFC8]/60">
                      <div>
                        <span className="text-xs font-serif font-bold text-[#8C6D53] uppercase tracking-wider block">
                          Customize Messages & Settings
                        </span>
                        <span className="text-[11px] text-[#7D6E63]">
                          Every text is fully custom — edit manually or generate creative English options with AI
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAiFillSceneProps(sceneBlock.engine)}
                        disabled={aiGeneratingSection === sceneBlock.engine}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                      >
                        <Sparkles className={`w-3.5 h-3.5 text-[#D4A373] ${aiGeneratingSection === sceneBlock.engine ? 'animate-spin' : ''}`} />
                        <span>{aiGeneratingSection === sceneBlock.engine ? 'AI Generating...' : '✨ AI Generate Messages'}</span>
                      </button>
                    </div>

                    {/* Constellation props */}
                    {sceneBlock.engine === 'constellation-star' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-[#7D6E63] block mb-1">Constellation Title</label>
                          <input
                            type="text"
                            value={sceneBlock.props?.title || ''}
                            placeholder={`Weave ${greeting.recipient.nickname || greeting.recipient.name || 'Friend'}'s Star Constellation`}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGreeting((prev) => ({
                                ...prev,
                                flow: prev.flow.map((b) =>
                                  b.type === 'scene' ? { ...b, props: { ...b.props, title: val } } : b
                                ),
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E]"
                          />
                        </div>
                        <div className="p-3 rounded-2xl bg-white border border-[#E8DFC8] space-y-1.5">
                          <span className="text-[11px] font-semibold text-[#2C241E] block">
                            ✨ Dynamic Star Letters Weaved in Sky:
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(
                              (greeting.recipient.nickname || greeting.recipient.name || 'STAR')
                                .toUpperCase()
                                .replace(/[^A-Z]/g, '')
                                .slice(0, 6) || 'STAR'
                            )
                              .split('')
                              .map((letter, idx) => (
                                <span
                                  key={idx}
                                  className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-stone-900 font-serif font-black text-xs flex items-center justify-center border border-amber-300 shadow-xs"
                                >
                                  {letter}
                                </span>
                              ))}
                          </div>
                          <p className="text-[10px] text-[#8C6D53] italic">
                            Tapping each glowing letter star connects celestial lasers across the night sky to draw out {greeting.recipient.nickname || 'their'} name!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Magic Balloon Lift props */}
                    {sceneBlock.engine === 'magic-balloon-lift' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-[#7D6E63] block mb-1">Lift-Off Title</label>
                          <input
                            type="text"
                            value={sceneBlock.props?.title || ''}
                            placeholder="Magic Balloon Lift"
                            onChange={(e) => {
                              const val = e.target.value;
                              setGreeting((prev) => ({
                                ...prev,
                                flow: prev.flow.map((b) =>
                                  b.type === 'scene' ? { ...b, props: { ...b.props, title: val } } : b
                                ),
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#7D6E63] block mb-1">Birthday Banner Message</label>
                          <input
                            type="text"
                            value={sceneBlock.props?.bannerMessage || ''}
                            placeholder={`Happy Birthday, ${greeting.recipient.nickname || greeting.recipient.name || 'Friend'}!`}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGreeting((prev) => ({
                                ...prev,
                                flow: prev.flow.map((b) =>
                                  b.type === 'scene' ? { ...b, props: { ...b.props, bannerMessage: val } } : b
                                ),
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#7D6E63] block mb-1">
                            5 Inflation Perks / Balloon Blessings
                          </label>
                          <div className="space-y-1.5">
                            {(sceneBlock.props?.perks || [
                              '🎈 Balloon 1 (Coral): Overflowing Joy & Pure Laughter',
                              '🎈 Balloon 2 (Golden): Radiant Vitality & Glowing Health',
                              '🎈 Balloon 3 (Lavender): Extraordinary Dreams Taking Flight',
                              '🎈 Balloon 4 (Mint): Deep Loyal Friendships & Warm Hugs',
                              '🎈 Balloon 5 (Sky Blue): Maximum Buoyancy! Lift Off Time!',
                            ]).map((perk: string, pIdx: number) => (
                              <input
                                key={pIdx}
                                type="text"
                                value={perk}
                                onChange={(e) => {
                                  const nextPerks = [...(sceneBlock.props.perks || [
                                    '🎈 Balloon 1 (Coral): Overflowing Joy & Pure Laughter',
                                    '🎈 Balloon 2 (Golden): Radiant Vitality & Glowing Health',
                                    '🎈 Balloon 3 (Lavender): Extraordinary Dreams Taking Flight',
                                    '🎈 Balloon 4 (Mint): Deep Loyal Friendships & Warm Hugs',
                                    '🎈 Balloon 5 (Sky Blue): Maximum Buoyancy! Lift Off Time!',
                                  ])];
                                  nextPerks[pIdx] = e.target.value;
                                  setGreeting((prev) => ({
                                    ...prev,
                                    flow: prev.flow.map((b) =>
                                      b.type === 'scene' ? { ...b, props: { ...b.props, perks: nextPerks } } : b
                                    ),
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E]"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dandelion Wishes props */}
                    {sceneBlock.engine === 'dandelion' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-[#7D6E63] block mb-1">Dandelion Scene Title</label>
                          <input
                            type="text"
                            value={sceneBlock.props?.title || ''}
                            placeholder="Blow Dandelion Birthday Wishes"
                            onChange={(e) => {
                              const val = e.target.value;
                              setGreeting((prev) => ({
                                ...prev,
                                flow: prev.flow.map((b) =>
                                  b.type === 'scene' ? { ...b, props: { ...b.props, title: val } } : b
                                ),
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#7D6E63] block mb-1">
                            Wishes Scattered with Seeds
                          </label>
                          <div className="space-y-1.5">
                            {(sceneBlock.props?.wishNotes || [
                              'May light follow every step you take.',
                              'May true laughter fill your days.',
                              'May unexpected beauty catch your breath.',
                              'May every deep dream take root and bloom.',
                              'Wishing you the happiest birthday yet!',
                            ]).map((note: string, nIdx: number) => (
                              <input
                                key={nIdx}
                                type="text"
                                value={note}
                                onChange={(e) => {
                                  const nextNotes = [...(sceneBlock.props.wishNotes || [
                                    'May light follow every step you take.',
                                    'May true laughter fill your days.',
                                    'May unexpected beauty catch your breath.',
                                    'May every deep dream take root and bloom.',
                                    'Wishing you the happiest birthday yet!',
                                  ])];
                                  nextNotes[nIdx] = e.target.value;
                                  setGreeting((prev) => ({
                                    ...prev,
                                    flow: prev.flow.map((b) =>
                                      b.type === 'scene' ? { ...b, props: { ...b.props, wishNotes: nextNotes } } : b
                                    ),
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E]"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Blowout props */}
                    {sceneBlock.engine === 'blowout' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-[#7D6E63] block mb-1">
                            Number of Candles (1 to 8)
                          </label>
                          <input
                            type="range"
                            min={1}
                            max={8}
                            value={sceneBlock.props?.candles || 5}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setGreeting((prev) => ({
                                ...prev,
                                flow: prev.flow.map((b) =>
                                  b.type === 'scene'
                                    ? { ...b, props: { ...b.props, candles: val } }
                                    : b
                                ),
                              }));
                              reloadPreview();
                            }}
                            className="w-full accent-[#B85D3B]"
                          />
                          <div className="text-right text-[11px] text-[#B85D3B] font-mono font-medium">
                            {sceneBlock.props?.candles || 5} Candles
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] text-[#7D6E63] block mb-1">
                            Reasons Revealed per Candle Blown
                          </label>
                          <div className="space-y-2">
                            {(sceneBlock.props?.reasons || []).map((reason: string, rIdx: number) => (
                              <input
                                key={rIdx}
                                type="text"
                                value={reason}
                                onChange={(e) => {
                                  const nextReasons = [...sceneBlock.props.reasons];
                                  nextReasons[rIdx] = e.target.value;
                                  setGreeting((prev) => ({
                                    ...prev,
                                    flow: prev.flow.map((b) =>
                                      b.type === 'scene'
                                        ? { ...b, props: { ...b.props, reasons: nextReasons } }
                                        : b
                                    ),
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] focus:outline-none"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fortune Cookie props */}
                    {sceneBlock.engine === 'fortune-cookie' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-[#7D6E63] block mb-1">Custom Birthday Fortune</label>
                          <textarea
                            rows={2}
                            value={sceneBlock.props?.fortuneMessage || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGreeting((prev) => ({
                                ...prev,
                                flow: prev.flow.map((b) =>
                                  b.type === 'scene' ? { ...b, props: { ...b.props, fortuneMessage: val } } : b
                                ),
                              }));
                            }}
                            className="w-full p-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Piñata Fiesta props */}
                    {sceneBlock.engine === 'pinata-smash' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-[#7D6E63] block mb-1">Piñata Title</label>
                          <input
                            type="text"
                            value={sceneBlock.props?.title || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGreeting((prev) => ({
                                ...prev,
                                flow: prev.flow.map((b) =>
                                  b.type === 'scene' ? { ...b, props: { ...b.props, title: val } } : b
                                ),
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#7D6E63] block mb-1">Hits to Burst (2 to 6)</label>
                          <input
                            type="number"
                            min={2}
                            max={6}
                            value={sceneBlock.props?.swingsNeeded || 4}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setGreeting((prev) => ({
                                ...prev,
                                flow: prev.flow.map((b) =>
                                  b.type === 'scene' ? { ...b, props: { ...b.props, swingsNeeded: val } } : b
                                ),
                              }));
                            }}
                            className="w-24 px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Birthday Vinyl props */}
                    {sceneBlock.engine === 'birthday-vinyl' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-[#7D6E63] block mb-1">Album / LP Title</label>
                          <input
                            type="text"
                            value={sceneBlock.props?.title || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGreeting((prev) => ({
                                ...prev,
                                flow: prev.flow.map((b) =>
                                  b.type === 'scene' ? { ...b, props: { ...b.props, title: val } } : b
                                ),
                              }));
                            }}
                            className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: STORY FLOW BLOCKS */}
            {activeTab === 'blocks' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-serif font-bold text-[#2C241E]">
                    Flow Order ({greeting.flow.length} Blocks)
                  </label>
                  <span className="text-[11px] text-[#7D6E63]">Plays sequentially</span>
                </div>

                <div className="space-y-2">
                  {greeting.flow.map((block, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="w-6 h-6 rounded-lg bg-white text-[#8C6D53] font-mono text-[11px] flex items-center justify-center shrink-0 border border-[#EAE3D9]">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-[#2C241E] capitalize block">
                            {block.type === 'scene' ? `Scene: ${(block as any).engine}` : block.type}
                          </span>
                          <span className="text-[11px] text-[#7D6E63] truncate block">
                            {block.type === 'message'
                              ? `"${(block as any).text?.slice(0, 32)}..."`
                              : block.type === 'timeline'
                              ? `${(block as any).items?.length || 0} story milestones`
                              : 'Block ready'}
                          </span>
                        </div>
                      </div>

                      {block.type !== 'scene' && block.type !== 'final' && (
                        <button
                          type="button"
                          onClick={() => removeBlock(idx)}
                          className="p-1 text-[#A89F91] hover:text-[#B85D3B] transition-colors"
                          title="Remove block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Message Text Editor */}
                {greeting.flow.some((b) => b.type === 'message') && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-serif font-bold text-[#8C6D53] uppercase tracking-wider block">
                          Personal Letter Text (Creative English)
                        </span>
                        <span className="text-[11px] text-[#7D6E63]">
                          Fully customizable letter with optional real voice note recording
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleAiGenerateLetter}
                          disabled={aiGeneratingSection === 'message'}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                        >
                          <Sparkles className={`w-3.5 h-3.5 text-[#D4A373] ${aiGeneratingSection === 'message' ? 'animate-spin' : ''}`} />
                          <span>{aiGeneratingSection === 'message' ? 'Generating...' : '✨ AI Generate Letter'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAiModal(true)}
                          className="text-[11px] text-[#7D6E63] hover:text-[#2C241E] p-1 underline"
                          title="More AI options"
                        >
                          More styles
                        </button>
                      </div>
                    </div>

                    {/* Creative English Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-[#7D6E63] font-medium block">
                        Tap a Creative English style to instantly insert:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          {
                            label: '🌟 Radiant & Golden',
                            getMsg: (n: string) =>
                              `Happy Birthday, ${n}! May your year ahead be drenched in golden light, overflowing with belly laughs, spontaneous adventures, and every dream your wild, beautiful heart has ever dared to imagine. So endlessly proud of the luminous soul you are!`,
                          },
                          {
                            label: '🚀 Epic Level-Up',
                            getMsg: (n: string) =>
                              `Happy Birthday to the ultimate legend, ${n}! Another orbit completed around the sun, and you have officially unlocked God-tier charisma, wisdom, and unstoppable momentum. Here is to smashing every record this year!`,
                          },
                          {
                            label: '☕ Warm & Poetic',
                            getMsg: (n: string) =>
                              `Dear ${n}, some people make the entire world feel softer, kinder, and so much more wonderful simply by being in it. You are undeniably one of those rare treasures. Wishing you boundless joy and cozy warmth today!`,
                          },
                          {
                            label: '🎉 Chaotic Bestie',
                            getMsg: (n: string) =>
                              `Happy Birthday to my favorite partner in crime, ${n}! Here is to another legendary year of spontaneous road trips, singing throwback hits with windows down, and laughing until our ribs hurt. Never change!`,
                          },
                        ].map((preset, pIdx) => {
                          const activeNick = greeting.recipient.nickname || greeting.recipient.name || 'Friend';
                          return (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => {
                                const newText = preset.getMsg(activeNick);
                                setGreeting((prev) => ({
                                  ...prev,
                                  flow: prev.flow.map((b) =>
                                    b.type === 'message' ? { ...b, text: newText } : b
                                  ),
                                }));
                              }}
                              className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#FAF4EB] text-[11px] font-medium text-[#2C241E] border border-[#DDD5C7] shadow-xs transition-all active:scale-95"
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <textarea
                      rows={4}
                      value={
                        (greeting.flow.find((b) => b.type === 'message') as any)?.text || ''
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setGreeting((prev) => ({
                          ...prev,
                          flow: prev.flow.map((b) =>
                            b.type === 'message' ? { ...b, text: val } : b
                          ),
                        }));
                      }}
                      className="w-full p-3.5 rounded-2xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#B85D3B]"
                    />

                    {/* Real Voice Note Recorder Integration */}
                    <div className="pt-2 border-t border-[#E8DFC8]/60">
                      <VoiceNoteRecorder
                        existingAudioUrl={
                          (greeting.flow.find((b) => b.type === 'message') as any)?.voiceNoteUrl
                        }
                        existingDuration={
                          (greeting.flow.find((b) => b.type === 'message') as any)?.voiceNoteDuration
                        }
                        onSave={(audioUrl, durationSeconds) => {
                          setGreeting((prev) => ({
                            ...prev,
                            flow: prev.flow.map((b) =>
                              b.type === 'message'
                                ? {
                                    ...b,
                                    voiceNoteUrl: audioUrl,
                                    voiceNoteDuration: durationSeconds,
                                    voiceNoteSimulated: false,
                                  }
                                : b
                            ),
                          }));
                          reloadPreview();
                        }}
                        onRemove={() => {
                          setGreeting((prev) => ({
                            ...prev,
                            flow: prev.flow.map((b) =>
                              b.type === 'message'
                                ? { ...b, voiceNoteUrl: undefined, voiceNoteDuration: undefined }
                                : b
                            ),
                          }));
                          reloadPreview();
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 2. POLAROID PHOTOS EDITOR */}
                {greeting.flow.some((b) => b.type === 'photos') ? (
                  <div className="p-4 rounded-3xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-serif font-bold text-[#8C6D53] uppercase tracking-wider block">
                          Polaroid Photos & Memories
                        </span>
                        <span className="text-[11px] text-[#7D6E63]">
                          Displayed as interactive Polaroid snapshots with your custom captions
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const idx = greeting.flow.findIndex((b) => b.type === 'photos');
                          if (idx !== -1) removeBlock(idx);
                        }}
                        className="text-[11px] text-[#A89F91] hover:text-[#B85D3B] flex items-center gap-1"
                        title="Remove photo gallery"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Photos
                      </button>
                    </div>

                    {/* Photos list */}
                    <div className="space-y-3">
                      {(
                        (greeting.flow.find((b) => b.type === 'photos') as any)?.items || []
                      ).map((photo: { url: string; caption?: string }, pIdx: number) => (
                        <div
                          key={pIdx}
                          className="p-3 rounded-2xl bg-white border border-[#E8DFC8] space-y-2.5 shadow-xs"
                        >
                          <div className="flex items-start gap-3">
                            {/* Thumbnail Preview */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-[#E8DFC8] shrink-0 shadow-inner relative">
                              <img
                                src={photo.url}
                                alt="Memory thumbnail"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as any).src =
                                    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80';
                                }}
                              />
                            </div>

                            <div className="flex-1 space-y-2 min-w-0">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={photo.url}
                                  placeholder="Image URL (https://...)"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setGreeting((prev) => ({
                                      ...prev,
                                      flow: prev.flow.map((b) => {
                                        if (b.type === 'photos') {
                                          const nextItems = [...(b as any).items];
                                          nextItems[pIdx] = { ...nextItems[pIdx], url: val };
                                          return { ...b, items: nextItems };
                                        }
                                        return b;
                                      }),
                                    }));
                                  }}
                                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#DDD5C7] text-xs text-[#2C241E] focus:outline-none"
                                />

                                {/* Upload button for this slot */}
                                <label className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-[#FAF4EB] hover:bg-[#F3ECE0] text-[#B85D3B] border border-[#E8DFC8] text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-all active:scale-95">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Upload</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (loadEvent) => {
                                          const dataUrl = loadEvent.target?.result as string;
                                          if (dataUrl) {
                                            setGreeting((prev) => ({
                                              ...prev,
                                              flow: prev.flow.map((b) => {
                                                if (b.type === 'photos') {
                                                  const nextItems = [...(b as any).items];
                                                  nextItems[pIdx] = { ...nextItems[pIdx], url: dataUrl };
                                                  return { ...b, items: nextItems };
                                                }
                                                return b;
                                              }),
                                            }));
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setGreeting((prev) => ({
                                      ...prev,
                                      flow: prev.flow.map((b) => {
                                        if (b.type === 'photos') {
                                          const nextItems = (b as any).items.filter(
                                            (_: any, i: number) => i !== pIdx
                                          );
                                          return { ...b, items: nextItems };
                                        }
                                        return b;
                                      }),
                                    }));
                                  }}
                                  className="p-1.5 text-[#A89F91] hover:text-[#B85D3B] transition-colors"
                                  title="Delete photo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Caption input */}
                              <input
                                type="text"
                                value={photo.caption || ''}
                                placeholder="Write Polaroid caption (e.g. Late night laughs ✨)"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGreeting((prev) => ({
                                    ...prev,
                                    flow: prev.flow.map((b) => {
                                      if (b.type === 'photos') {
                                        const nextItems = [...(b as any).items];
                                        nextItems[pIdx] = { ...nextItems[pIdx], caption: val };
                                        return { ...b, items: nextItems };
                                      }
                                      return b;
                                    }),
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Presets and Add photo actions */}
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-[#8C6D53] font-medium mr-1">
                          Quick Presets:
                        </span>
                        {[
                          { label: '🎂 Cake', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80', caption: 'Sweet celebrations & birthday wishes 🎂' },
                          { label: '✨ Sparklers', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80', caption: 'Shining bright through every midnight moment ✨' },
                          { label: '🥂 Confetti', url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop&q=80', caption: 'Endless laughter & best memories 🎉' },
                          { label: '☕ Warm Hugs', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80', caption: 'Late night talks & cozy coffee dates ☕' },
                        ].map((preset, prIdx) => (
                          <button
                            key={prIdx}
                            type="button"
                            onClick={() => {
                              setGreeting((prev) => ({
                                ...prev,
                                flow: prev.flow.map((b) => {
                                  if (b.type === 'photos') {
                                    return {
                                      ...b,
                                      items: [...((b as any).items || []), { url: preset.url, caption: preset.caption }],
                                    };
                                  }
                                  return b;
                                }),
                              }));
                            }}
                            className="px-2 py-0.5 rounded-lg bg-white hover:bg-[#FAF4EB] text-[10px] font-medium text-[#4A3E36] border border-[#DDD5C7] shadow-xs transition-all active:scale-95"
                          >
                            + {preset.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Add custom upload photo */}
                        <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF4EB] text-[#2C241E] border border-[#DDD5C7] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95">
                          <Upload className="w-3.5 h-3.5 text-[#B85D3B]" />
                          <span>Upload Device Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (loadEvent) => {
                                  const dataUrl = loadEvent.target?.result as string;
                                  if (dataUrl) {
                                    setGreeting((prev) => ({
                                      ...prev,
                                      flow: prev.flow.map((b) => {
                                        if (b.type === 'photos') {
                                          return {
                                            ...b,
                                            items: [
                                              ...((b as any).items || []),
                                              { url: dataUrl, caption: 'Cherished memories together ✨' },
                                            ],
                                          };
                                        }
                                        return b;
                                      }),
                                    }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setGreeting((prev) => ({
                              ...prev,
                              flow: prev.flow.map((b) => {
                                if (b.type === 'photos') {
                                  return {
                                    ...b,
                                    items: [
                                      ...((b as any).items || []),
                                      {
                                        url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
                                        caption: 'A moment to remember ✨',
                                      },
                                    ],
                                  };
                                }
                                return b;
                              }),
                            }));
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#B85D3B] hover:bg-[#A14F33] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Photo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-3xl bg-[#FAF7F2] border border-dashed border-[#DDD5C7] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-serif font-bold text-[#2C241E] block">
                        📸 Polaroid Photo Gallery
                      </span>
                      <span className="text-[11px] text-[#7D6E63]">
                        Add visual Polaroid snapshots of your favorite shared memories
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => addBlock('photos')}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] font-semibold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Photos
                    </button>
                  </div>
                )}

                {/* 3. CUSTOM STORYLINE MESSAGES (TIMELINE) EDITOR */}
                {greeting.flow.some((b) => b.type === 'timeline') ? (
                  <div className="p-4 rounded-3xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-serif font-bold text-[#8C6D53] uppercase tracking-wider block">
                          Storyline Timeline & Milestone Chapters
                        </span>
                        <span className="text-[11px] text-[#7D6E63]">
                          Chronicle your inside jokes, adventures, and milestones together
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAiGenerateTimeline}
                          disabled={aiGeneratingSection === 'timeline'}
                          className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] text-xs font-semibold flex items-center gap-1 shadow-xs transition-all active:scale-95"
                        >
                          <Sparkles className={`w-3.5 h-3.5 text-[#D4A373] ${aiGeneratingSection === 'timeline' ? 'animate-spin' : ''}`} />
                          <span>{aiGeneratingSection === 'timeline' ? 'Generating...' : '✨ AI Generate Chapters'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const idx = greeting.flow.findIndex((b) => b.type === 'timeline');
                            if (idx !== -1) removeBlock(idx);
                          }}
                          className="text-[11px] text-[#A89F91] hover:text-[#B85D3B] flex items-center gap-1"
                          title="Remove timeline"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Milestone Items */}
                    <div className="space-y-3">
                      {(
                        (greeting.flow.find((b) => b.type === 'timeline') as any)?.items || []
                      ).map(
                        (item: { date: string; title: string; story: string }, tIdx: number) => (
                          <div
                            key={tIdx}
                            className="p-3.5 rounded-2xl bg-white border border-[#E8DFC8] space-y-2 shadow-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-serif font-bold text-[#B85D3B] flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> Chapter {tIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setGreeting((prev) => ({
                                    ...prev,
                                    flow: prev.flow.map((b) => {
                                      if (b.type === 'timeline') {
                                        const nextItems = (b as any).items.filter(
                                          (_: any, i: number) => i !== tIdx
                                        );
                                        return { ...b, items: nextItems };
                                      }
                                      return b;
                                    }),
                                  }));
                                }}
                                className="text-[#A89F91] hover:text-[#B85D3B] p-1"
                                title="Remove chapter"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-[#7D6E63] block mb-1">
                                  Chapter Tag / Date
                                </label>
                                <input
                                  type="text"
                                  value={item.date}
                                  placeholder="e.g. Chapter 1, 2021, College Days"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setGreeting((prev) => ({
                                      ...prev,
                                      flow: prev.flow.map((b) => {
                                        if (b.type === 'timeline') {
                                          const nextItems = [...(b as any).items];
                                          nextItems[tIdx] = { ...nextItems[tIdx], date: val };
                                          return { ...b, items: nextItems };
                                        }
                                        return b;
                                      }),
                                    }));
                                  }}
                                  className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#DDD5C7] text-xs text-[#2C241E] focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-[#7D6E63] block mb-1">
                                  Milestone Title
                                </label>
                                <input
                                  type="text"
                                  value={item.title}
                                  placeholder="e.g. The First Encounter"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setGreeting((prev) => ({
                                      ...prev,
                                      flow: prev.flow.map((b) => {
                                        if (b.type === 'timeline') {
                                          const nextItems = [...(b as any).items];
                                          nextItems[tIdx] = { ...nextItems[tIdx], title: val };
                                          return { ...b, items: nextItems };
                                        }
                                        return b;
                                      }),
                                    }));
                                  }}
                                  className="w-full px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#DDD5C7] text-xs text-[#2C241E] focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-[#7D6E63] block mb-1">
                                Custom Storyline Message
                              </label>
                              <textarea
                                rows={2}
                                value={item.story}
                                placeholder="Describe the memory, inside joke, or heartfelt milestone..."
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGreeting((prev) => ({
                                    ...prev,
                                    flow: prev.flow.map((b) => {
                                      if (b.type === 'timeline') {
                                        const nextItems = [...(b as any).items];
                                        nextItems[tIdx] = { ...nextItems[tIdx], story: val };
                                        return { ...b, items: nextItems };
                                      }
                                      return b;
                                    }),
                                  }));
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DDD5C7] text-xs text-[#2C241E] leading-relaxed focus:outline-none"
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {/* Presets and Add milestone button */}
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-[#8C6D53] font-medium mr-1">
                          Storyline Presets:
                        </span>
                        {[
                          {
                            label: '🌟 Best Friends Journey',
                            items: [
                              { date: 'Chapter 1', title: 'The First Spark', story: 'When our worlds first crossed and we immediately became inseparable.' },
                              { date: 'Chapter 2', title: 'Road Trips & Chaos', story: 'Singing throwback hits with the windows down and laughing until our ribs ached.' },
                              { date: 'Today', title: 'Celebrating You', story: 'Cheers to another year of you being the brightest, most loyal soul on earth.' },
                            ],
                          },
                          {
                            label: '💖 Sweet Romance',
                            items: [
                              { date: 'The First Date', title: 'Where It Began', story: 'Coffee that turned into hours of talking about everything under the stars.' },
                              { date: 'Adventures', title: 'Every Little Moment', story: 'Cooking dinner, lazy Sundays, and finding magic in everyday life.' },
                              { date: 'Today', title: 'Happy Birthday My Love', story: 'So endlessly in love with you and grateful for every single moment.' },
                            ],
                          },
                        ].map((preset, prIdx) => (
                          <button
                            key={prIdx}
                            type="button"
                            onClick={() => {
                              setGreeting((prev) => ({
                                ...prev,
                                flow: prev.flow.map((b) => {
                                  if (b.type === 'timeline') {
                                    return { ...b, items: preset.items };
                                  }
                                  return b;
                                }),
                              }));
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF4EB] text-[10px] font-medium text-[#4A3E36] border border-[#DDD5C7] shadow-xs transition-all active:scale-95"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setGreeting((prev) => ({
                            ...prev,
                            flow: prev.flow.map((b) => {
                              if (b.type === 'timeline') {
                                const currentCount = ((b as any).items || []).length;
                                return {
                                  ...b,
                                  items: [
                                    ...((b as any).items || []),
                                    {
                                      date: `Chapter ${currentCount + 1}`,
                                      title: 'New Chapter',
                                      story: 'Another unforgettable memory shared together.',
                                    },
                                  ],
                                };
                              }
                              return b;
                            }),
                          }));
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#B85D3B] hover:bg-[#A14F33] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Chapter</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-3xl bg-[#FAF7F2] border border-dashed border-[#DDD5C7] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-serif font-bold text-[#2C241E] block">
                        📖 Storyline Timeline
                      </span>
                      <span className="text-[11px] text-[#7D6E63]">
                        Add milestone chapters and custom story memories together
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => addBlock('timeline')}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] font-semibold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Storyline
                    </button>
                  </div>
                )}

                {/* 4. HANDWRITTEN SIGNATURE SEAL EDITOR */}
                {greeting.flow.some((b) => b.type === 'signature') ? (
                  <div className="p-4 sm:p-5 rounded-3xl bg-[#FAF7F2] border border-[#E8DFC8] space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-serif font-bold text-[#8C6D53] uppercase tracking-wider block">
                          Handwritten Signature & Official Seal
                        </span>
                        <span className="text-[11px] text-[#7D6E63]">
                          Draw your authentic signature to seal this birthday greeting
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const idx = greeting.flow.findIndex((b) => b.type === 'signature');
                          if (idx !== -1) removeBlock(idx);
                        }}
                        className="text-[11px] text-[#A89F91] hover:text-[#B85D3B] flex items-center gap-1"
                        title="Remove signature"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>

                    {/* Sender hand note */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-[#7D6E63] font-medium">Handwritten Note / Sign-off:</label>
                        <button
                          type="button"
                          onClick={() => {
                            const notes = [
                              "Sent across the miles with pure heartfelt affection.",
                              "With all my love and cheers to your brightest year yet!",
                              "Forever in your corner, celebrating the wonderful soul you are.",
                              "Signed, sealed, and delivered with boundless birthday joy!"
                            ];
                            const note = notes[Math.floor(Math.random() * notes.length)];
                            setGreeting((prev) => ({
                              ...prev,
                              flow: prev.flow.map((b) =>
                                b.type === 'signature' ? { ...b, handNote: note } : b
                              ),
                            }));
                          }}
                          className="text-[10px] text-[#B85D3B] hover:text-[#A14F33] flex items-center gap-1 font-semibold"
                        >
                          <Sparkles className="w-3 h-3 text-[#D4A373]" /> AI Suggest Note
                        </button>
                      </div>
                      <input
                        type="text"
                        value={
                          (greeting.flow.find((b) => b.type === 'signature') as any)?.handNote || ''
                        }
                        placeholder="e.g. Sent across the miles with pure heartfelt affection."
                        onChange={(e) => {
                          const val = e.target.value;
                          setGreeting((prev) => ({
                            ...prev,
                            flow: prev.flow.map((b) =>
                              b.type === 'signature' ? { ...b, handNote: val } : b
                            ),
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs text-[#2C241E] focus:outline-none"
                      />
                    </div>

                    {/* Interactive Signature Pad */}
                    <SignaturePad
                      initialSignatureDataUrl={
                        (greeting.flow.find((b) => b.type === 'signature') as any)?.signatureDataUrl
                      }
                      senderName={greeting.sender.name || 'You'}
                      onSave={(dataUrl) => {
                        setGreeting((prev) => ({
                          ...prev,
                          flow: prev.flow.map((b) =>
                            b.type === 'signature'
                              ? { ...b, signatureDataUrl: dataUrl, senderName: prev.sender.name || 'You' }
                              : b
                          ),
                        }));
                        reloadPreview();
                      }}
                      onClear={() => {
                        setGreeting((prev) => ({
                          ...prev,
                          flow: prev.flow.map((b) =>
                            b.type === 'signature' ? { ...b, signatureDataUrl: '' } : b
                          ),
                        }));
                        reloadPreview();
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-3xl bg-[#FAF7F2] border border-dashed border-[#DDD5C7] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-serif font-bold text-[#2C241E] block">
                        ✍️ Handwritten Signature Seal
                      </span>
                      <span className="text-[11px] text-[#7D6E63]">
                        Draw your signature with finger or mouse to seal your birthday letter
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => addBlock('signature')}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] font-semibold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Signature
                    </button>
                  </div>
                )}

                {/* Additional Flow blocks */}
                <div className="pt-2">
                  <span className="text-[11px] font-serif font-bold text-[#8C6D53] uppercase tracking-wider block mb-2">
                    Add More Surprise Elements:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => addBlock('secret')}
                      className="p-2.5 rounded-2xl bg-white hover:bg-[#FAF4EB] border border-[#E8DFC8] text-xs text-[#4A3E36] font-medium flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B85D3B]" /> Secret Question Gate
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock('signature')}
                      className="p-2.5 rounded-2xl bg-white hover:bg-[#FAF4EB] border border-[#E8DFC8] text-xs text-[#4A3E36] font-medium flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B85D3B]" /> Finger Signature
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: THEME & COLOR PALETTES */}
            {activeTab === 'theme' && (
              <div className="space-y-4 animate-in fade-in">
                {/* Palette Mode Selector: Earthen, Bright & Vibrant, Midnight Luxe */}
                <div>
                  <label className="text-xs font-serif font-bold text-[#2C241E] block mb-2">
                    Visual Palette & Atmosphere
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: 'earthen', label: '🌾 Earthen Warmth', icon: Sun },
                      { id: 'bright', label: '🍓 Bright & Vibrant', icon: Sparkles },
                      { id: 'midnight', label: '🌙 Midnight Luxe', icon: Moon },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => updateTheme({ paletteMode: mode.id as any })}
                        className={`p-2.5 rounded-2xl border text-center font-medium transition-all ${
                          greeting.theme.paletteMode === mode.id
                            ? 'bg-[#FAF4EB] border-[#B85D3B] text-[#B85D3B] font-semibold shadow-sm'
                            : 'bg-[#FAF7F2] border-[#EAE3D9] text-[#7D6E63] hover:text-[#2C241E]'
                        }`}
                      >
                        <span className="block text-xs font-bold">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Skin */}
                <div>
                  <label className="text-xs font-serif font-bold text-[#2C241E] block mb-2">
                    Artisan Skin
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'patisserie-cream', name: 'Patisserie Vanilla', color: 'from-[#FAF4EB] to-[#E9DFCF]' },
                      { id: 'terracotta-clay', name: 'Terracotta Clay', color: 'from-[#B85D3B] to-[#D4A373]' },
                      { id: 'golden-sand', name: 'Golden Champagne', color: 'from-[#E5DAC6] to-[#D4A373]' },
                      { id: 'sage-botanical', name: 'Eucalyptus Sage', color: 'from-[#EDF2EB] to-[#B3C8AE]' },
                      { id: 'parchment-letter', name: 'Antique Parchment', color: 'from-[#F7F3E9] to-[#E2D6C0]' },
                      { id: 'arcade-linen', name: 'Linen Pixel RPG', color: 'from-[#EAE3D9] to-[#B85D3B]' },
                    ].map((skin) => (
                      <button
                        key={skin.id}
                        type="button"
                        onClick={() => updateTheme({ skin: skin.id })}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                          greeting.theme.skin === skin.id
                            ? 'bg-white border-[#B85D3B] shadow-sm'
                            : 'bg-[#FAF7F2] border-[#EAE3D9] hover:border-[#DDD5C7]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${skin.color} border border-black/10 shrink-0`} />
                        <span className="text-xs text-[#2C241E] font-medium">{skin.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-serif font-bold text-[#2C241E] block mb-2">
                    Typography Font
                  </label>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {[
                      { id: 'serif', label: 'Serif Classic' },
                      { id: 'sans', label: 'Clean Sans' },
                      { id: 'display', label: 'Display' },
                      { id: 'mono', label: 'Code Mono' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => updateTheme({ font: f.id as any })}
                        className={`p-2.5 rounded-2xl border text-center font-medium ${
                          greeting.theme.font === f.id
                            ? 'bg-[#FAF4EB] border-[#B85D3B] text-[#B85D3B] font-semibold'
                            : 'bg-[#FAF7F2] border-[#EAE3D9] text-[#7D6E63] hover:text-[#2C241E]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-serif font-bold text-[#2C241E] block font-medium">
                      Ambient Music & Birthday Ringtone
                    </label>
                    <button
                      type="button"
                      onClick={toggleBirthdayRingtone}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1 transition-all active:scale-95 ${
                        isPlayingRingtone
                          ? 'bg-amber-400 text-stone-950 border-amber-500 animate-pulse'
                          : 'bg-white hover:bg-[#FAF4EB] text-[#B85D3B] border-[#DDD5C7]'
                      }`}
                    >
                      <span>🎂</span>
                      <span>{isPlayingRingtone ? 'Pause Tune 🎵' : 'Preview Ringtone'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'happy-birthday-ringtone', label: '🎂 Happy Birthday Ringtone (Synthesized)' },
                      { id: 'soft-piano', label: '🎹 Soft Piano Chords' },
                      { id: 'celestial', label: '✨ Celestial Resonance' },
                      { id: 'arcade-upbeat', label: '👾 Upbeat Arcade Arp' },
                      { id: 'none', label: '🔇 Silent (No Music)' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => updateTheme({ music: m.id as any })}
                        className={`p-2.5 rounded-2xl border text-left font-medium transition-all ${
                          greeting.theme.music === m.id
                            ? 'bg-[#FAF4EB] border-[#B85D3B] text-[#B85D3B] font-semibold shadow-xs'
                            : 'bg-[#FAF7F2] border-[#EAE3D9] text-[#7D6E63] hover:text-[#2C241E]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
            </div>
          </div>

          {/* Sticky Bottom Actions Bar on Edit Page */}
          <div className="fixed bottom-0 inset-x-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#E8DFC8] px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold text-[#2C241E] hidden sm:inline">
                {greeting.recipient.name ? `Greeting for ${greeting.recipient.name}` : 'New Birthday Greeting'}
              </span>
              <span className="text-[11px] text-[#8C6D53]">· Ready to test or share</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setStudioScreen('preview');
                  reloadPreview();
                }}
                className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-[#2C241E] hover:bg-[#3D322A] text-[#FAF7F2] shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-[#D4A373]" />
                <span>Test Live Preview</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#D4A373]" />
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-md shadow-[#B85D3B]/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Publish / Share</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* SCREEN 2: DEDICATED FULL-SCREEN INTERACTIVE PREVIEW */}
      {studioScreen === 'preview' && (
        <main className="flex-1 bg-[#FAF7F2] flex flex-col overflow-hidden">
          {/* Preview Navigation & Controls Top Bar */}
          <div className="bg-[#FFFDF9] border-b border-[#E8DFC8] px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs z-30">
            <button
              type="button"
              onClick={() => setStudioScreen('edit')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF4EB] text-[#2C241E] border border-[#DDD5C7] font-semibold transition-all active:scale-95 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#B85D3B]" />
              <span>Back to Edit Greeting</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Birthday Tune Quick Play */}
              <button
                type="button"
                onClick={toggleBirthdayRingtone}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-semibold text-xs transition-all active:scale-95 ${
                  isPlayingRingtone
                    ? 'bg-amber-400 text-stone-950 border-amber-500 animate-pulse'
                    : 'bg-[#FAF4EB] text-[#B85D3B] border-[#E8DFC8] hover:bg-[#F3ECE0]'
                }`}
              >
                <span>🎂</span>
                <span className="hidden sm:inline">{isPlayingRingtone ? 'Tune Playing 🎵' : 'Birthday Ringtone'}</span>
              </button>

              <button
                type="button"
                onClick={reloadPreview}
                className="p-2 rounded-xl bg-white hover:bg-[#FAF4EB] text-[#7D6E63] hover:text-[#2C241E] border border-[#DDD5C7] transition-all"
                title="Restart Flow from beginning"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 rounded-xl bg-[#B85D3B] hover:bg-[#A14F33] text-white font-semibold text-xs transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Centered Truly Responsive Player Canvas */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 flex items-center justify-center">
            <div className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-[#E8DFC8]/60 bg-white/70 backdrop-blur-xs p-2 sm:p-4 transition-all">
              <div key={previewKey} className="w-full">
                <Player
                  greeting={greeting}
                  onReplay={reloadPreview}
                  onShare={() => setShowShareModal(true)}
                  onEdit={() => setStudioScreen('edit')}
                  isInteractive={true}
                />
              </div>
            </div>
          </div>
        </main>
      )}

      {/* AI Assistant Modal */}
      {showAiModal && (
        <AiDraftModal
          occasion={greeting.occasion}
          recipientName={greeting.recipient.name}
          relationship={greeting.relationship}
          tone={greeting.tone}
          language={greeting.lang}
          onApplyDraft={(text) => {
            setGreeting((prev) => ({
              ...prev,
              flow: prev.flow.map((b) => (b.type === 'message' ? { ...b, text } : b)),
            }));
            reloadPreview();
          }}
          onApplySlots={(slots) => {
            setGreeting((prev) => ({
              ...prev,
              flow: prev.flow.map((b) =>
                b.type === 'scene'
                  ? {
                      ...b,
                      props: {
                        ...b.props,
                        reasons: slots,
                        blessings: slots,
                        perksUnlocked: slots,
                        messages: slots,
                        wishesGranted: slots,
                        wishNotes: slots,
                      },
                    }
                  : b
              ),
            }));
            reloadPreview();
          }}
          onApplyStyle={(style) => {
            setEngineType(style.engine as any);
            updateTheme({ skin: style.skin, accent: style.accent, font: style.font as any });
            setGreeting((prev) => ({ ...prev, tone: style.tone as any }));
          }}
          onClose={() => setShowAiModal(false)}
        />
      )}

      {/* Share / Publish Modal */}
      {showShareModal && (
        <ShareModal greeting={greeting} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
};
