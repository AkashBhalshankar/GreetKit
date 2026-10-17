import React, { useState } from 'react';
import { Greeting, PaletteMode } from '../types/greeting';
import { Sparkles, Play, Plus, Gift, ArrowRight, Heart, Star, Compass, Feather, Sun, Moon, Disc } from 'lucide-react';
import { playChime } from '../lib/audio';

interface Props {
  onCreateNew: () => void;
  onSelectSample: (greeting: Greeting) => void;
}

export const Home: React.FC<Props> = ({ onCreateNew, onSelectSample }) => {
  // Focus on only one event at once (defaults to Birthday)
  const [focusedEvent, setFocusedEvent] = useState<'birthday' | 'diwali' | 'milestone'>('birthday');
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'bright' | 'earthen' | 'midnight'>('all');
  const [homePalette, setHomePalette] = useState<PaletteMode>('earthen');

  const cycleHomePalette = () => {
    setHomePalette((curr) => {
      if (curr === 'earthen') return 'bright';
      if (curr === 'bright') return 'midnight';
      return 'earthen';
    });
    playChime(680, 0.2);
  };

  const sampleGreetings: Array<{
    id: string;
    title: string;
    tag: string;
    engine: string;
    icon: string;
    desc: string;
    greeting: Greeting;
  }> = [
    {
      id: 'priya-25',
      title: "Patisserie Birthday Blowout Cake",
      tag: 'Birthday',
      engine: 'Blowout Cake (Mic / Tap)',
      icon: '🎂',
      desc: 'Blow real candles with phone mic or tap. Each flame extinguishes with gentle smoke to reveal why they shine!',
      greeting: {
        v: 1,
        id: 'priya-25',
        occasion: 'birthday',
        relationship: 'friend',
        tone: 'funny',
        lang: 'en',
        recipient: { name: 'Priya', nickname: 'Pri', age: 25 },
        sender: { name: 'Akash' },
        theme: {
          skin: 'patisserie-cream',
          accent: '#B85D3B',
          font: 'serif',
          music: 'soft-piano',
          ending: 'confetti',
        },
        flow: [
          {
            type: 'scene',
            engine: 'blowout',
            props: {
              title: 'Make a wish & blow out the candles!',
              candles: 5,
              reasons: [
                'Your laugh instantly turns rough days around',
                'You always pick the best food spots in town',
                'Your chaotic energy is pure sunshine',
                'You are the most fiercely loyal friend ever',
                'This year is going to be your biggest level-up yet!',
              ],
              showReasons: true,
            },
          },
          {
            type: 'message',
            text: 'Happy 25th Birthday, Priya! May your quarter-century milestone be overflowing with joy, iced lattes, spontaneous road trips, and everything your wonderful heart desires. So endlessly proud of you!',
            author: 'Akash',
            voiceNoteSimulated: true,
          },
          {
            type: 'timeline',
            items: [
              { date: '2019', title: 'College Day 1', story: 'Met outside the library stressing about schedules.' },
              { date: '2022', title: 'First Road Trip', story: 'Got lost on the highway singing 2000s pop anthems.' },
              { date: '2026', title: 'Quarter Century!', story: 'Celebrating 25 years of you making the world brighter.' },
            ],
          },
          {
            type: 'final',
            cta: 'make-your-own',
            wishWallEnabled: true,
          },
        ],
        delivery: { tz: 'Asia/Kolkata' },
        features: { privateWish: true, wishWall: true, soundFx: true },
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: 'pinata-bday',
      title: 'Fiesta Birthday Piñata Party',
      tag: 'Birthday',
      engine: 'Piñata Smash (Hit / Burst)',
      icon: '🪅',
      desc: 'Tap the vibrant hanging star piñata to swing! Cracks and paper fringes shed with every hit until candy, prizes and wishes burst forth!',
      greeting: {
        v: 1,
        id: 'pinata-bday',
        occasion: 'birthday',
        relationship: 'friend',
        tone: 'funny',
        lang: 'en',
        recipient: { name: 'Mateo', nickname: 'Teo', age: 24 },
        sender: { name: 'Camila & Friends' },
        theme: {
          skin: 'patisserie-cream',
          accent: '#FF4365',
          font: 'sans',
          music: 'arcade-upbeat',
          ending: 'confetti',
          paletteMode: 'bright',
        },
        flow: [
          {
            type: 'scene',
            engine: 'pinata-smash',
            props: {
              title: 'Smash the Birthday Piñata for Mateo!',
              swingsNeeded: 4,
              wishes: [
                'Happy 24th Mateo! May this year shatter every expectation!',
                'Endless late-night tacos, spontaneous adventures, and legendary road trips!',
                'Your humor and generosity light up every group chat and room!',
                '¡Feliz Cumpleaños! Keep dancing to your own unstoppable beat!',
              ],
              goodies: ['🍬', '🍭', '⭐', '✨', '🍫', '🎉', '🎁'],
            },
          },
          {
            type: 'message',
            text: 'Mateo, we hope your 24th birthday is as vibrant, energetic, and unforgettable as you are. Cheers to another year of legendary times!',
            author: 'Camila & Friends',
          },
          {
            type: 'final',
            cta: 'make-your-own',
            wishWallEnabled: true,
          },
        ],
        features: { soundFx: true, wishWall: true },
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: 'constellation-bday',
      title: 'Constellation Stars · Name Weaver',
      tag: 'Birthday',
      engine: 'Constellation Stars (Connect Name)',
      icon: '✨',
      desc: 'Tap glowing celestial night-sky stars to connect them into the recipient\'s name, weaving golden laser lines and chiming blessings!',
      greeting: {
        v: 1,
        id: 'constellation-bday',
        occasion: 'birthday',
        relationship: 'friend',
        tone: 'poetic',
        lang: 'en',
        recipient: { name: 'Sera', nickname: 'Sera', age: 26 },
        sender: { name: 'Devon' },
        theme: {
          skin: 'golden-sand',
          accent: '#FDE047',
          font: 'serif',
          music: 'celestial',
          ending: 'sparkles',
          paletteMode: 'midnight',
        },
        flow: [
          {
            type: 'scene',
            engine: 'constellation-star',
            props: {
              title: "Sera's Star Constellation",
            },
          },
          {
            type: 'message',
            text: 'Happy Birthday Sera! Like the brightest constellation in the night sky, you guide and inspire everyone who loves you.',
            author: 'Devon',
          },
          {
            type: 'photos',
            items: [
              {
                url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80',
                caption: 'Starlit memories and midnight talks ✨',
              },
            ],
          },
          {
            type: 'final',
            cta: 'make-your-own',
            wishWallEnabled: true,
          },
        ],
        features: { soundFx: true, wishWall: true },
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: 'vinyl-bday',
      title: 'Vintage Birthday Turntable & LP',
      tag: 'Birthday',
      engine: 'Retro Vinyl Mixtape',
      icon: '📻',
      desc: 'Drop the tonearm needle onto a spinning vintage birthday vinyl record to play dedicating album tracks and heartfelt liner notes!',
      greeting: {
        v: 1,
        id: 'vinyl-bday',
        occasion: 'birthday',
        relationship: 'friend',
        tone: 'funny',
        lang: 'en',
        recipient: { name: 'Leo', nickname: 'DJ Leo' },
        sender: { name: 'The Studio Crew' },
        theme: {
          skin: 'patisserie-cream',
          accent: '#B85D3B',
          font: 'mono',
          music: 'arcade-upbeat',
          ending: 'fireworks',
          paletteMode: 'earthen',
        },
        flow: [
          {
            type: 'scene',
            engine: 'birthday-vinyl',
            props: {
              title: "Leo's Golden Year LP · Side A",
              albumName: 'Birthday Anthems Vol. 1',
              trackTitle: 'Ode to Pure Joy',
              dedications: [
                'Track 1: "Ode to Your Wild Laugh & Killer Taste in Music"',
                'Track 2: "Late Night Jam Sessions & Endless Coffee"',
                'Track 3: "Unstoppable Ambition & Creative Breakthroughs"',
                'Track 4: "Forever Young & Deeply Appreciated"',
              ],
            },
          },
          {
            type: 'message',
            text: 'Happy Birthday Leo! Keep spinning legendary memories and turning everyday moments into gold. Best wishes from the whole crew!',
            author: 'The Studio Crew',
          },
          {
            type: 'final',
            cta: 'make-your-own',
            wishWallEnabled: true,
          },
        ],
        features: { soundFx: true, wishWall: true },
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: 'fortune-bday',
      title: 'Golden Birthday Fortune Cookie',
      tag: 'Birthday',
      engine: 'Fortune Cookie Crack',
      icon: '🥠',
      desc: 'Tap the crisp golden cookie to snap it open, hear the crunch, and unfurl a personalized birthday prophecy and lucky numbers!',
      greeting: {
        v: 1,
        id: 'fortune-bday',
        occasion: 'birthday',
        relationship: 'friend',
        tone: 'sweet',
        lang: 'en',
        recipient: { name: 'Elena' },
        sender: { name: 'Marcus' },
        theme: {
          skin: 'golden-sand',
          accent: '#D4A373',
          font: 'serif',
          music: 'soft-piano',
          ending: 'confetti',
          paletteMode: 'earthen',
        },
        flow: [
          {
            type: 'scene',
            engine: 'fortune-cookie',
            props: {
              title: 'Crack Your Birthday Fortune',
              fortuneMessage: 'A grand breakthrough awaits you this year. Your kindness is a magnet for miracles!',
              luckyNumbers: '7 · 14 · 21 · 28 · 49',
            },
          },
          {
            type: 'message',
            text: 'Happy Birthday Elena! May your days be filled with warmth, spontaneous laughter, and everything sweet.',
            author: 'Marcus',
          },
          {
            type: 'final',
            cta: 'make-your-own',
            wishWallEnabled: true,
          },
        ],
        features: { soundFx: true },
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: 'lamp-bday',
      title: 'Magic Wishing Lamp (3 Wishes)',
      tag: 'Birthday',
      engine: 'Magic Lamp Summon',
      icon: '🧞',
      desc: 'Rub the mystical golden wishing lamp with finger or mouse to release magical smoke and grant 3 special birthday wishes!',
      greeting: {
        v: 1,
        id: 'lamp-bday',
        occasion: 'birthday',
        relationship: 'partner',
        tone: 'emotional',
        lang: 'en',
        recipient: { name: 'Julian' },
        sender: { name: 'Clara' },
        theme: {
          skin: 'golden-sand',
          accent: '#B85D3B',
          font: 'display',
          music: 'celestial',
          ending: 'sparkles',
          paletteMode: 'earthen',
        },
        flow: [
          {
            type: 'scene',
            engine: 'magic-lamp',
            props: {
              title: 'Rub the Magic Wishing Lamp',
              wishesGranted: [
                'Wish 1: Boundless vitality and peaceful calm in your mind',
                'Wish 2: All your creative ventures finding open doors',
                'Wish 3: A lifetime of cozy evenings and great adventures',
              ],
            },
          },
          {
            type: 'message',
            text: 'Julian, you bring so much warmth to the world. Here is to all your greatest dreams manifesting this year!',
            author: 'Clara',
          },
          {
            type: 'final',
            cta: 'make-your-own',
            wishWallEnabled: true,
          },
        ],
        features: { soundFx: true },
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: 'dandelion-bday',
      title: 'Dandelion Wishes',
      tag: 'Birthday',
      engine: 'Dandelion Wishes (Mic Breath & Wind)',
      icon: '🌾',
      desc: 'Blow into your device microphone or tap to blow away 16 glowing dandelion seeds into the wind, carrying golden birthday blessings!',
      greeting: {
        v: 1,
        id: 'dandelion-bday',
        occasion: 'birthday',
        relationship: 'friend',
        tone: 'poetic',
        lang: 'en',
        recipient: { name: 'Aria', nickname: 'Aria', age: 24 },
        sender: { name: 'Liam' },
        theme: {
          skin: 'sage-botanical',
          accent: '#557C4F',
          font: 'serif',
          music: 'celestial',
          ending: 'sparkles',
          paletteMode: 'earthen',
        },
        flow: [
          {
            type: 'scene',
            engine: 'dandelion',
            props: {
              title: 'Blow Dandelion Birthday Wishes',
              wishNotes: [
                'May peace embrace every morning.',
                'May laughter ring through every evening.',
                'May your wild heart always feel cherished.',
                'Wishing you the happiest birthday yet!',
              ],
            },
          },
          {
            type: 'message',
            text: 'Dear Aria, like seeds carried on a warm summer wind, may blessings land softly in every corner of your life. Happy Birthday!',
            author: 'Liam',
          },
          {
            type: 'photos',
            items: [
              {
                url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
                caption: 'Whispering birthday wishes to the wind 🌾',
              },
            ],
          },
          {
            type: 'final',
            cta: 'make-your-own',
            wishWallEnabled: true,
          },
        ],
        features: { soundFx: true, wishWall: true },
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: 'tune-bday',
      title: 'Musical Birthday Bell Chimes',
      tag: 'Birthday',
      engine: 'Musical Chimes',
      icon: '🎵',
      desc: 'Tap the glowing chime keys to play the Happy Birthday melody note-by-note, triggering musical fireworks!',
      greeting: {
        v: 1,
        id: 'tune-bday',
        occasion: 'birthday',
        relationship: 'friend',
        tone: 'funny',
        lang: 'en',
        recipient: { name: 'Jordan' },
        sender: { name: 'The Band' },
        theme: {
          skin: 'patisserie-cream',
          accent: '#B85D3B',
          font: 'mono',
          music: 'arcade-upbeat',
          ending: 'fireworks',
          paletteMode: 'bright',
        },
        flow: [
          {
            type: 'scene',
            engine: 'piano-tune',
            props: {
              title: 'Play the Birthday Melody',
              songTitle: 'Happy Birthday to You',
            },
          },
          {
            type: 'message',
            text: 'Another year of legendary playlists, guitar riffs, and good times. Happy Birthday Jordan!',
            author: 'The Band',
          },
          {
            type: 'final',
            cta: 'make-your-own',
            wishWallEnabled: true,
          },
        ],
        features: { soundFx: true },
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: 'alex-levelup',
      title: "Alex's Level 30 RPG Quest",
      tag: 'Birthday',
      engine: 'Level-Up RPG',
      icon: '🎮',
      desc: 'Fill the XP bar, level up stats from 29 to 30, and unlock special character perk cards with retro fanfare!',
      greeting: {
        v: 1,
        id: 'alex-levelup',
        occasion: 'birthday',
        relationship: 'friend',
        tone: 'funny',
        lang: 'en',
        recipient: { name: 'Alex', age: 30 },
        sender: { name: 'The Gaming Guild' },
        theme: {
          skin: 'arcade-linen',
          accent: '#B85D3B',
          font: 'mono',
          music: 'arcade-upbeat',
          ending: 'fireworks',
        },
        flow: [
          {
            type: 'scene',
            engine: 'level-up',
            props: {
              title: 'ANNUAL LEVEL-UP QUEST',
              currentLevel: 29,
              nextLevel: 30,
              characterTitle: '★ LEVEL 30 ARCHMAGE ★',
              perksUnlocked: [
                '+50 Coffee Metabolism Boost',
                'Master Perk: Infinite Humor',
                'Immunity to Early Morning Chaos',
                'Certified Veteran of Legendary Times',
              ],
            },
          },
          {
            type: 'message',
            text: 'Congratulations on reaching Level 30, Alex! Your wisdom stats are maxed, your inventory is loaded, and your party is cheering you on. Happy Birthday legend!',
            author: 'The Guild',
          },
          {
            type: 'final',
            cta: 'make-your-own',
            wishWallEnabled: true,
          },
        ],
        features: { privateWish: false, wishWall: true, soundFx: true },
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: 'secret-scratch-bday',
      title: 'Gold Foil Birthday Scratch Surprise',
      tag: 'Birthday',
      engine: 'Scratch Card Reveal',
      icon: '🎁',
      desc: 'Rub with finger or mouse over the gold coating to reveal a secret surprise birthday voucher or heartfelt gift.',
      greeting: {
        v: 1,
        id: 'secret-scratch-bday',
        occasion: 'birthday',
        relationship: 'partner',
        tone: 'sweet',
        lang: 'en',
        recipient: { name: 'Chloe' },
        sender: { name: 'Ryan' },
        theme: {
          skin: 'golden-sand',
          accent: '#D4A373',
          font: 'serif',
          music: 'soft-piano',
          ending: 'sparkles',
        },
        flow: [
          {
            type: 'scene',
            engine: 'reveal',
            props: {
              title: 'Scratch Card Surprise',
              secretMessage: 'Surprise! Two front-row concert tickets to your favorite artist this Saturday! 🎸🎶',
            },
          },
          {
            type: 'message',
            text: 'Happy Birthday Chloe! You deserve every single dream and adventure coming your way. Can’t wait to celebrate tonight!',
            author: 'Ryan',
          },
          {
            type: 'final',
            cta: 'make-your-own',
            wishWallEnabled: true,
          },
        ],
        features: { soundFx: true },
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: 'pop-balloons-bday',
      title: 'Birthday Helium Balloon Pop',
      tag: 'Birthday',
      engine: 'Balloon Pop Fest',
      icon: '🎈',
      desc: 'Tap each floating party balloon to pop with lively audio and discover inside jokes and wishes!',
      greeting: {
        v: 1,
        id: 'pop-balloons-bday',
        occasion: 'birthday',
        relationship: 'friend',
        tone: 'funny',
        lang: 'en',
        recipient: { name: 'Devon' },
        sender: { name: 'The Squad' },
        theme: {
          skin: 'patisserie-cream',
          accent: '#B85D3B',
          font: 'sans',
          music: 'soft-piano',
          ending: 'balloons',
        },
        flow: [
          {
            type: 'scene',
            engine: 'pop',
            props: {
              title: 'Pop the Birthday Balloons',
              balloonsCount: 5,
              messages: [
                'Still the best driver in the crew!',
                'May your coffee always be iced and strong!',
                'Age is just a number (a slightly higher one now)!',
                'Here is to another year of zero bad vibes!',
                'Happy Birthday Devon!',
              ],
            },
          },
          {
            type: 'message',
            text: 'Devon, hope your birthday is filled with non-stop laughter and all the good times you deserve. Cheers to you!',
            author: 'The Squad',
          },
          {
            type: 'final',
            cta: 'make-your-own',
            wishWallEnabled: true,
          },
        ],
        features: { soundFx: true },
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: 'maya-balloon',
      title: 'Magic Balloon Lift',
      tag: 'Birthday',
      engine: 'Magic Balloon Lift (Tap to Inflate & Lift Off)',
      icon: '🎈',
      desc: 'Tap to inflate colorful helium balloons with joyful blessings that lift off into the sky carrying confetti and wishes!',
      greeting: {
        v: 1,
        id: 'maya-balloon',
        occasion: 'birthday',
        relationship: 'friend',
        tone: 'sweet',
        lang: 'en',
        recipient: { name: 'Maya', nickname: 'Maya', age: 23 },
        sender: { name: 'Sam' },
        theme: {
          skin: 'patisserie-cream',
          accent: '#B85D3B',
          font: 'sans',
          music: 'celestial',
          ending: 'balloons',
          paletteMode: 'earthen',
        },
        flow: [
          {
            type: 'scene',
            engine: 'magic-balloon-lift',
            props: {
              title: 'Magic Balloon Lift',
              bannerMessage: 'Happy Birthday Maya! Lift Off! 🎉',
              perks: [
                '🎈 Balloon 1 (Coral): Overflowing Joy & Pure Laughter',
                '🎈 Balloon 2 (Golden): Radiant Vitality & Glowing Health',
                '🎈 Balloon 3 (Lavender): Extraordinary Dreams Taking Flight',
                '🎈 Balloon 4 (Mint): Deep Loyal Friendships & Warm Hugs',
                '🎈 Balloon 5 (Sky Blue): Maximum Buoyancy! Lift Off Time!',
              ],
            },
          },
          {
            type: 'message',
            text: 'Happy Birthday Maya! Another spin around the sun, and you keep shining brighter than ever. Wishing you the most uplifting, joyful birthday yet!',
            author: 'Sam',
          },
          {
            type: 'photos',
            items: [
              {
                url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
                caption: 'Lifting off into another golden year ✨',
              },
            ],
          },
          {
            type: 'final',
            cta: 'make-your-own',
            wishWallEnabled: true,
          },
        ],
        features: { soundFx: true, wishWall: true },
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: 'bloom-bday',
      title: 'Botanical Birthday Bouquet',
      tag: 'Birthday',
      engine: 'Water & Bloom',
      icon: '🌸',
      desc: 'Pour water onto the seed to bloom an unfolding sacred peony of birthday blessings.',
      greeting: {
        v: 1,
        id: 'bloom-bday',
        occasion: 'birthday',
        relationship: 'parent',
        tone: 'sweet',
        lang: 'en',
        recipient: { name: 'Mom' },
        sender: { name: 'Your Kids' },
        theme: {
          skin: 'sage-botanical',
          accent: '#557C4F',
          font: 'serif',
          music: 'celestial',
          ending: 'sparkles',
        },
        flow: [
          {
            type: 'scene',
            engine: 'grow',
            props: {
              title: 'Tap to Water & Bloom',
              stages: [
                'Seeds of love and warmth you gave us...',
                'Nurtured with your selfless care everyday...',
                'Unfolding deep gratitude and joy...',
                'In full, radiant bloom. Happy Birthday Mom!',
              ],
              finalNote: 'Wishing you all the peace and joy in the universe!',
            },
          },
          {
            type: 'message',
            text: 'Happy Birthday to the center of our universe. Thank you for your warmth, your boundless patience, and your endless hugs.',
            author: 'With all our love',
          },
          {
            type: 'final',
            cta: 'make-your-own',
            wishWallEnabled: true,
          },
        ],
        features: { soundFx: true },
        createdAt: new Date().toISOString(),
      },
    },
    {
      id: 'diwali-blessings',
      title: 'Sacred Terracotta Diwali Diya',
      tag: 'Diwali',
      engine: 'Tap-Light Diyas',
      icon: '🪔',
      desc: 'Kindle sacred terracotta diyas with warm glowing flames and uncover auspicious blessings.',
      greeting: {
        v: 1,
        id: 'diwali-blessings',
        occasion: 'diwali',
        relationship: 'other',
        tone: 'sweet',
        lang: 'en',
        recipient: { name: 'Family & Friends' },
        sender: { name: 'The Sharma Family' },
        theme: {
          skin: 'terracotta-clay',
          accent: '#B85D3B',
          font: 'display',
          music: 'celestial',
          ending: 'sparkles',
        },
        flow: [
          {
            type: 'scene',
            engine: 'tap-light',
            props: {
              title: 'Light the Sacred Diyas',
              itemsCount: 5,
              blessings: [
                'May light triumph over all darkness in your home',
                'May prosperity and health grace your doorstep',
                'May laughter fill every festive evening',
                'May your dreams blossom with wisdom and peace',
                'Wishing you an auspicious, radiant Diwali!',
              ],
            },
          },
          {
            type: 'message',
            text: 'Shubh Deepavali! As each diya glows tonight, may it illuminate your path with joy, love, and boundless prosperity. Sending warm blessings across the miles.',
            author: 'The Sharmas',
          },
          {
            type: 'final',
            cta: 'make-your-own',
            wishWallEnabled: true,
          },
        ],
        features: { privateWish: false, wishWall: true, soundFx: true },
        createdAt: new Date().toISOString(),
      },
    },
  ];

  const filtered = sampleGreetings.filter((s) => {
    // 1. Strict Event Focus: When an event is selected, ONLY show that single event!
    const itemTag = s.tag.toLowerCase();
    if (focusedEvent === 'birthday' && itemTag !== 'birthday') return false;
    if (focusedEvent === 'diwali' && itemTag !== 'diwali') return false;
    if (focusedEvent === 'milestone' && (itemTag === 'birthday' || itemTag === 'diwali')) return false;

    // 2. Palette sub-filter strictly within this single focused event
    if (paletteFilter === 'all') return true;
    if (paletteFilter === 'bright') return s.greeting.theme?.paletteMode === 'bright';
    if (paletteFilter === 'earthen') return (s.greeting.theme?.paletteMode || 'earthen') === 'earthen';
    if (paletteFilter === 'midnight') return s.greeting.theme?.paletteMode === 'midnight';
    return true;
  });

  const isBright = homePalette === 'bright';
  const isMidnight = homePalette === 'midnight';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-[#E4C5A5] ${
        isMidnight
          ? 'bg-[#121110] text-stone-100'
          : isBright
          ? 'bg-gradient-to-b from-[#FFF5F7] via-[#FFF0F4] to-[#FFE4E8] text-[#4C1D24]'
          : 'bg-[#FAF7F2] text-[#2C241E]'
      }`}
    >
      {/* Top Navbar */}
      <nav
        className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-300 ${
          isMidnight
            ? 'bg-[#1C1917]/90 border-stone-800'
            : isBright
            ? 'bg-white/85 border-rose-200'
            : 'bg-[#FAF7F2]/85 border-[#E8DFC8]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-[#D4A373] to-[#B85D3B] p-0.5 shadow-sm">
            <div className="w-full h-full bg-[#FFFDF9] rounded-[14px] flex items-center justify-center font-serif font-bold text-[#B85D3B] text-sm">
              ✨
            </div>
          </div>
          <div>
            <span
              className={`font-serif font-bold text-lg tracking-tight ${
                isMidnight ? 'text-stone-100' : isBright ? 'text-rose-950' : 'text-[#2C241E]'
              }`}
            >
              Greetkit
            </span>
            <span
              className={`text-[11px] ml-2 hidden sm:inline ${
                isMidnight ? 'text-stone-400' : isBright ? 'text-rose-600' : 'text-[#7D6E63]'
              }`}
            >
              Living Interactive Greetings
            </span>
          </div>
        </div>

        {/* Right Nav Actions: Palette Switcher & Create CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Palette Mode Toggle */}
          <button
            type="button"
            onClick={cycleHomePalette}
            className={`px-3 py-1.5 rounded-full border shadow-sm transition-all active:scale-95 flex items-center gap-1.5 text-xs font-semibold ${
              isMidnight
                ? 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-stone-700'
                : isBright
                ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 border-rose-300'
                : 'bg-[#FFFDF9] hover:bg-[#FAF4EB] text-[#7D6E63] border-[#DDD5C7]'
            }`}
            title="Cycle theme palette between Earthen, Bright & Midnight"
          >
            {isMidnight ? (
              <Moon className="w-3.5 h-3.5 text-amber-300" />
            ) : isBright ? (
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#B85D3B]" />
            )}
            <span className="capitalize">{homePalette} Mode</span>
          </button>

          <button
            type="button"
            onClick={onCreateNew}
            className={`px-4 sm:px-5 py-2 rounded-2xl text-xs font-semibold shadow-md transition-all active:scale-95 flex items-center gap-2 ${
              isBright
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                : 'bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-[#B85D3B]/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create a Greeting</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-8 pt-12 pb-14 max-w-4xl mx-auto text-center space-y-5">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-serif font-medium border shadow-sm ${
            isMidnight
              ? 'bg-stone-900 border-stone-800 text-amber-300'
              : isBright
              ? 'bg-white border-rose-200 text-rose-700'
              : 'bg-[#FFFDF9] border-[#E8DFC8] text-[#8C6D53]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
          <span>Interactive greetings that come to life on any screen</span>
        </div>

        <h1
          className={`text-4xl sm:text-6xl font-serif font-bold tracking-tight leading-[1.15] ${
            isMidnight ? 'text-stone-100' : isBright ? 'text-rose-950' : 'text-[#2C241E]'
          }`}
        >
          Send a greeting that{' '}
          <span
            className={`italic font-normal underline underline-offset-8 ${
              isBright
                ? 'text-rose-500 decoration-rose-300'
                : 'text-[#B85D3B] decoration-[#D4A373]'
            }`}
          >
            comes to life
          </span>
          .
        </h1>

        <p
          className={`text-sm sm:text-base max-w-xl mx-auto leading-relaxed ${
            isMidnight ? 'text-stone-300' : isBright ? 'text-rose-900/80' : 'text-[#6B5E55]'
          }`}
        >
          Blow out real birthday candles with your phone mic, smash a fiesta piñata for secret wishes,
          connect cosmic star crowns, spin a retro birthday LP, and crack golden fortunes. Adapts smoothly to phones,
          tablets, and laptops.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCreateNew}
            className={`px-6 py-3.5 rounded-2xl text-sm font-semibold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
              isBright
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                : 'bg-[#B85D3B] hover:bg-[#A14F33] text-white shadow-[#B85D3B]/20'
            }`}
          >
            <Sparkles className="w-4 h-4 text-white" />
            Make Your First Greeting
          </button>
          <button
            type="button"
            onClick={() => onSelectSample(sampleGreetings[0].greeting)}
            className={`px-6 py-3.5 rounded-2xl text-sm font-semibold border shadow-sm transition-all active:scale-95 flex items-center gap-2 ${
              isMidnight
                ? 'bg-stone-900 hover:bg-stone-800 text-stone-100 border-stone-700'
                : isBright
                ? 'bg-white hover:bg-rose-50 text-rose-950 border-rose-200'
                : 'bg-[#FFFDF9] hover:bg-[#FAF4EB] text-[#2C241E] border-[#DDD5C7]'
            }`}
          >
            <Play className="w-4 h-4 fill-current text-[#B85D3B]" />
            Play Birthday Cake Demo
          </button>
        </div>
      </section>

      {/* 3-Step Feature Row */}
      <section
        className={`px-4 sm:px-8 py-8 border-y transition-colors duration-300 ${
          isMidnight
            ? 'bg-[#171615] border-stone-800'
            : isBright
            ? 'bg-white/80 border-rose-200'
            : 'bg-[#FFFDF9] border-[#E8DFC8]'
        }`}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div
            className={`p-5 rounded-3xl border space-y-2 hover:-translate-y-0.5 transition-transform ${
              isMidnight
                ? 'bg-stone-900 border-stone-800'
                : isBright
                ? 'bg-rose-50/70 border-rose-200'
                : 'bg-[#FAF7F2] border-[#EAE3D9]'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-serif font-bold text-sm">
              1
            </div>
            <h3
              className={`font-serif font-bold text-sm ${
                isMidnight ? 'text-stone-100' : isBright ? 'text-rose-950' : 'text-[#2C241E]'
              }`}
            >
              Unique Birthday Engines
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isMidnight ? 'text-stone-400' : isBright ? 'text-rose-800/80' : 'text-[#7D6E63]'
              }`}
            >
              Candle blowout, Piñata smash, star constellation, vinyl mixtape, RPG quest, and fortune crack.
            </p>
          </div>

          <div
            className={`p-5 rounded-3xl border space-y-2 hover:-translate-y-0.5 transition-transform ${
              isMidnight
                ? 'bg-stone-900 border-stone-800'
                : isBright
                ? 'bg-rose-50/70 border-rose-200'
                : 'bg-[#FAF7F2] border-[#EAE3D9]'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center font-serif font-bold text-sm">
              2
            </div>
            <h3
              className={`font-serif font-bold text-sm ${
                isMidnight ? 'text-stone-100' : isBright ? 'text-rose-950' : 'text-[#2C241E]'
              }`}
            >
              Bright & Earthen Palettes
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isMidnight ? 'text-stone-400' : isBright ? 'text-rose-800/80' : 'text-[#7D6E63]'
              }`}
            >
              Switch between vibrant festive colors and warm earthy clay, sand, terracotta, and linen.
            </p>
          </div>

          <div
            className={`p-5 rounded-3xl border space-y-2 hover:-translate-y-0.5 transition-transform ${
              isMidnight
                ? 'bg-stone-900 border-stone-800'
                : isBright
                ? 'bg-rose-50/70 border-rose-200'
                : 'bg-[#FAF7F2] border-[#EAE3D9]'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-serif font-bold text-sm">
              3
            </div>
            <h3
              className={`font-serif font-bold text-sm ${
                isMidnight ? 'text-stone-100' : isBright ? 'text-rose-950' : 'text-[#2C241E]'
              }`}
            >
              Adaptive Responsive
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                isMidnight ? 'text-stone-400' : isBright ? 'text-rose-800/80' : 'text-[#7D6E63]'
              }`}
            >
              Fluidly adapts to any phone, tablet, or monitor with zero app installs and one instant link.
            </p>
          </div>
        </div>
      </section>

      {/* Preset Gallery Section */}
      <section className="px-4 sm:px-8 py-12 max-w-5xl mx-auto w-full space-y-7">
        {/* Dedicated Single-Event Focus Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {focusedEvent === 'birthday' ? '🎂' : focusedEvent === 'diwali' ? '🪔' : '🎓'}
                </span>
                <h2
                  className={`text-2xl sm:text-3xl font-serif font-bold tracking-tight ${
                    isMidnight ? 'text-stone-100' : isBright ? 'text-rose-950' : 'text-[#2C241E]'
                  }`}
                >
                  {focusedEvent === 'birthday' ? 'Birthday Experiences' : focusedEvent === 'diwali' ? 'Diwali Celebrations' : 'Milestone Events'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF4EB] text-[#B85D3B] border border-[#E8DFC8] font-semibold">
                  Focused Mode
                </span>
              </div>
              <p
                className={`text-xs sm:text-sm mt-1 ${
                  isMidnight ? 'text-stone-400' : isBright ? 'text-rose-800/80' : 'text-[#7D6E63]'
                }`}
              >
                {focusedEvent === 'birthday'
                  ? 'Showing strictly Birthday greetings — candle blowouts, piñata smashes, star crowns, vinyls & fortune cookies.'
                  : 'Showing only festive celebration formats tailored for this occasion.'}
              </p>
            </div>

            {/* Event Switcher: Focus on ONE event at once */}
            <div className="flex items-center p-1 rounded-2xl bg-[#F0EAE1] border border-[#DDD5C7] text-xs self-start sm:self-auto shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setFocusedEvent('birthday');
                  playChime(640, 0.2);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                  focusedEvent === 'birthday'
                    ? 'bg-white text-[#B85D3B] shadow-xs'
                    : 'text-[#7D6E63] hover:text-[#2C241E]'
                }`}
              >
                <span>🎂 Birthday</span>
                <span className="text-[10px] font-mono opacity-70">({sampleGreetings.filter(s => s.tag.toLowerCase() === 'birthday').length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFocusedEvent('diwali');
                  playChime(720, 0.2);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                  focusedEvent === 'diwali'
                    ? 'bg-white text-[#B85D3B] shadow-xs'
                    : 'text-[#7D6E63] hover:text-[#2C241E]'
                }`}
              >
                <span>🪔 Diwali</span>
                <span className="text-[10px] font-mono opacity-70">({sampleGreetings.filter(s => s.tag.toLowerCase() === 'diwali').length})</span>
              </button>
            </div>
          </div>

          {/* Sub-Filter for Visual Palette within this single event */}
          <div className="flex items-center justify-between pt-1 border-t border-[#E8DFC8]/60 text-xs">
            <span className="text-[11px] font-serif font-semibold text-[#8C6D53]">
              Filter {focusedEvent === 'birthday' ? 'Birthday' : 'Celebration'} Color Styles:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'All Styles' },
                { id: 'bright', label: '🍓 Bright & Vibrant' },
                { id: 'earthen', label: '🌾 Earthen Warmth' },
                { id: 'midnight', label: '🌙 Midnight Luxe' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPaletteFilter(f.id as any)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                    paletteFilter === f.id
                      ? isBright
                        ? 'bg-rose-500 text-white font-semibold shadow-xs'
                        : 'bg-[#B85D3B] text-white font-semibold shadow-xs'
                      : isMidnight
                      ? 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
                      : 'bg-white text-[#7D6E63] hover:text-[#2C241E] border border-[#DDD5C7]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const cardMode = item.greeting.theme?.paletteMode || 'earthen';
            return (
              <div
                key={item.id}
                onClick={() => onSelectSample(item.greeting)}
                className={`group p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-1 shadow-sm hover:shadow-md ${
                  isMidnight
                    ? 'bg-stone-900/90 border-stone-800 hover:border-amber-400'
                    : cardMode === 'bright'
                    ? 'bg-white border-rose-200 hover:border-rose-400 shadow-rose-100/50'
                    : 'bg-[#FFFDF9] border-[#E8DFC8] hover:border-[#B85D3B]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-3xl p-2.5 rounded-2xl border ${
                        cardMode === 'bright'
                          ? 'bg-rose-50 border-rose-200'
                          : isMidnight
                          ? 'bg-stone-800 border-stone-700'
                          : 'bg-[#FAF7F2] border-[#EAE3D9]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                          cardMode === 'bright'
                            ? 'bg-rose-100 text-rose-700 border-rose-200 font-semibold'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {cardMode === 'bright' ? '🍓 Bright' : cardMode === 'midnight' ? '🌙 Luxe' : '🌾 Earthen'}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                          isMidnight
                            ? 'bg-stone-800 text-stone-300 border-stone-700'
                            : 'bg-[#FAF4EB] text-[#8C6D53] border-[#E8DFC8]'
                        }`}
                      >
                        {item.tag}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3
                      className={`font-serif font-bold text-lg transition-colors ${
                        isMidnight
                          ? 'text-stone-100 group-hover:text-amber-300'
                          : isBright
                          ? 'text-rose-950 group-hover:text-rose-600'
                          : 'text-[#2C241E] group-hover:text-[#B85D3B]'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <span className="text-[11px] font-mono text-[#8C6D53] block mt-0.5">
                      Engine: {item.engine}
                    </span>
                  </div>

                  <p
                    className={`text-xs leading-relaxed ${
                      isMidnight ? 'text-stone-400' : isBright ? 'text-rose-900/70' : 'text-[#7D6E63]'
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>

                <div
                  className={`pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                    isMidnight
                      ? 'border-stone-800 text-amber-300'
                      : cardMode === 'bright'
                      ? 'border-rose-100 text-rose-600'
                      : 'border-[#EAE3D9] text-[#B85D3B]'
                  }`}
                >
                  <span>Play Live Experience</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`mt-auto border-t py-8 text-center text-xs transition-colors duration-300 ${
          isMidnight
            ? 'bg-[#1C1917] border-stone-800 text-stone-400'
            : isBright
            ? 'bg-white border-rose-200 text-rose-700/70'
            : 'bg-[#FAF7F2] border-[#E8DFC8] text-[#9E8E81]'
        }`}
      >
        <p>Greetkit · Living interactive greetings crafted for every screen in bright & earthen palettes.</p>
      </footer>
    </div>
  );
};
