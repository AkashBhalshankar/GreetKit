export type Occasion =
  | 'birthday'
  | 'diwali'
  | 'anniversary'
  | 'graduation'
  | 'new_year'
  | 'valentines'
  | 'friendship'
  | 'thank_you'
  | 'celebration';

export type Relationship =
  | 'friend'
  | 'partner'
  | 'parent'
  | 'sibling'
  | 'colleague'
  | 'teacher'
  | 'child'
  | 'other';

export type Tone = 'sweet' | 'funny' | 'emotional' | 'poetic' | 'formal';

export type Language = 'en' | 'hi' | 'te' | 'ta' | 'es';

export type EngineType =
  | 'blowout'
  | 'tap-light'
  | 'level-up'
  | 'lift-off'
  | 'type-out'
  | 'reveal'
  | 'pop'
  | 'grow'
  | 'catch'
  | 'fortune-cookie'
  | 'magic-lamp'
  | 'dandelion'
  | 'piano-tune'
  | 'pinata-smash'
  | 'constellation-star'
  | 'magic-balloon-lift'
  | 'birthday-vinyl';

export interface Recipient {
  name: string;
  nickname?: string;
  age?: number;
}

export interface Sender {
  name: string;
  email?: string;
}

export type PaletteMode = 'earthen' | 'bright' | 'midnight';

export interface Theme {
  skin: string;
  accent: string;
  font: 'serif' | 'sans' | 'display' | 'mono';
  music: 'soft-piano' | 'celestial' | 'lofi-celebration' | 'arcade-upbeat' | 'happy-birthday-ringtone' | 'none';
  ending: 'confetti' | 'sparkles' | 'fireworks' | 'balloons';
  paletteMode?: PaletteMode;
}

export interface BlowoutProps {
  title?: string;
  candles: number;
  reasons: string[];
  cakeFlavor?: string;
  showReasons?: boolean;
}

export interface TapLightProps {
  title?: string;
  itemsCount: number;
  blessings: string[];
  itemType?: 'diya' | 'lantern' | 'star' | 'candle';
}

export interface LevelUpProps {
  title?: string;
  currentLevel: number;
  nextLevel: number;
  characterTitle?: string;
  stats?: Array<{ label: string; value: number; max?: number; color?: string }>;
  perksUnlocked: string[];
}

export interface LiftOffProps {
  title?: string;
  vesselType?: 'balloon' | 'rocket' | 'lantern';
  bannerMessage: string;
  targetAltitude?: number;
}

export interface TypeOutProps {
  header?: string;
  typedLines: string[];
  style?: 'typewriter' | 'terminal' | 'chat';
  speedMs?: number;
}

export interface RevealProps {
  title?: string;
  coverText?: string;
  secretMessage: string;
  scratchRadius?: number;
  revealType?: 'scratch' | 'gift-box';
}

export interface PopProps {
  title?: string;
  balloonsCount: number;
  messages: string[];
}

export interface GrowProps {
  title?: string;
  plantType?: 'flower' | 'tree' | 'lotus';
  stages: string[];
  finalNote: string;
}

export interface CatchProps {
  title?: string;
  targetScore: number;
  itemType?: 'stars' | 'cupcakes' | 'hearts';
  completionMessage: string;
}

export interface FortuneCookieProps {
  title?: string;
  fortuneMessage: string;
  luckyNumbers?: string;
  luckyTraits?: string[];
}

export interface MagicLampProps {
  title?: string;
  wishesGranted: string[];
  rubsNeeded?: number;
}

export interface DandelionProps {
  title?: string;
  wishNotes: string[];
}

export interface PianoTuneProps {
  title?: string;
  songTitle?: string;
  melodyNotes?: string[];
}

export interface PinataProps {
  title?: string;
  pinataType?: 'star' | 'donkey' | 'burrito';
  swingsNeeded?: number;
  wishes: string[];
  goodies?: string[];
}

export interface ConstellationProps {
  title?: string;
  constellationName?: string;
  shape?: 'crown' | 'heart' | 'cake';
  starBlessings: string[];
}

export interface BirthdayVinylProps {
  title?: string;
  albumName?: string;
  trackTitle?: string;
  genre?: string;
  dedications: string[];
}

export interface MagicBalloonLiftProps {
  title?: string;
  balloonsCount?: number;
  bannerMessage?: string;
  perks?: string[];
}

export type SceneProps =
  | BlowoutProps
  | TapLightProps
  | LevelUpProps
  | LiftOffProps
  | TypeOutProps
  | RevealProps
  | PopProps
  | GrowProps
  | CatchProps
  | FortuneCookieProps
  | MagicLampProps
  | DandelionProps
  | PianoTuneProps
  | PinataProps
  | ConstellationProps
  | MagicBalloonLiftProps
  | BirthdayVinylProps;

export interface SceneBlock {
  type: 'scene';
  engine: EngineType;
  props: any;
}

export interface MessageBlock {
  type: 'message';
  text: string;
  author?: string;
  voiceNoteSimulated?: boolean;
  voiceNoteUrl?: string;
  voiceNoteDuration?: number;
}

export interface PhotosBlock {
  type: 'photos';
  items: Array<{ url: string; caption?: string }>;
}

export interface TimelineBlock {
  type: 'timeline';
  items: Array<{ date: string; title: string; story: string }>;
}

export interface SecretBlock {
  type: 'secret';
  question: string;
  answerHint?: string;
  acceptedAnswers: string[];
}

export interface SignatureBlock {
  type: 'signature';
  senderName: string;
  signatureDataUrl?: string;
  handNote?: string;
}

export interface FinalBlock {
  type: 'final';
  cta: 'make-your-own';
  wishWallEnabled?: boolean;
}

export type Block =
  | SceneBlock
  | MessageBlock
  | PhotosBlock
  | TimelineBlock
  | SecretBlock
  | SignatureBlock
  | FinalBlock;

export interface Delivery {
  unlockAt?: string; // ISO datetime
  tz?: string;
}

export interface GreetingFeatures {
  privateWish?: boolean;
  wishWall?: boolean;
  soundFx?: boolean;
  reactionCapture?: boolean;
}

export interface Greeting {
  v: 1;
  id: string;
  occasion: Occasion;
  relationship: Relationship;
  tone: Tone;
  lang: Language;
  recipient: Recipient;
  sender: Sender;
  theme: Theme;
  flow: Block[];
  delivery?: Delivery;
  features: GreetingFeatures;
  createdAt: string;
}

export interface WishItem {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  emoji?: string;
}

export interface ReplyItem {
  id: string;
  name: string;
  reaction: string;
  message: string;
  createdAt: string;
}
