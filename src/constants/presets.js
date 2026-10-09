export const VOICES = [
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Female / Neutral',
    tone: 'Warm, Balanced & Clear',
    description: 'Natural, friendly, and articulate. Ideal for audiobooks, explainers, tutorials, and warm narrations.',
    accent: 'Neutral English',
    color: '#ec4899',
    suggestedStyles: ['Warm, reassuring narrator', 'Clear educational explainer', 'Gentle mindfulness guide'],
    previewSample: 'Hello! I am Kore. I deliver clear, warm, and natural speech for any words you choose.'
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Male',
    tone: 'Energetic, Vibrant & Upbeat',
    description: 'Youthful, bright, dynamic, and engaging. Great for commercials, gaming, YouTube, and podcasts.',
    accent: 'Modern English',
    color: '#f97316',
    suggestedStyles: ['High-energy radio host', 'Punchy promo announcer', 'Excited gamer persona'],
    previewSample: 'Hey everyone, Puck here! Ready to inject high energy and personality into your audio.'
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Male',
    tone: 'Deep, Resonant & Cinematic',
    description: 'Commanding baritone with cinematic gravitas. Blockbuster trailers, fantasy lore, and epic documentaries.',
    accent: 'Deep Cinematic English',
    color: '#8b5cf6',
    suggestedStyles: ['Dramatic movie trailer voice', 'Epic myth narrator', 'Authoritative news broadcast'],
    previewSample: 'In a world beyond imagination, Fenrir delivers deep, powerful resonance to every word.'
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Male / Neutral',
    tone: 'Calm, Soothing & Serene',
    description: 'Soft-spoken, peaceful, and gentle. Excellent for mindfulness, ASMR-style guides, and relaxing stories.',
    accent: 'Smooth Gentle English',
    color: '#06b6d4',
    suggestedStyles: ['Gentle mindfulness guide', 'Late-night cozy radio', 'Patient software tutor'],
    previewSample: 'Take a slow, deep breath. Zephyr brings calm clarity and peace to your listening experience.'
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Male',
    tone: 'Gravelly, Mature & Reflective',
    description: 'Rich, textured baritone with seasoned character. Great for noir mysteries, history, and philosophical readings.',
    accent: 'Gravelly Baritone English',
    color: '#64748b',
    suggestedStyles: ['Noir detective monologue', 'Wise elderly scholar', 'Thoughtful investigative journalist'],
    previewSample: 'The city was quiet, but secrets never sleep. Charon gives voice to deep, reflective storytelling.'
  },
  {
    id: 'Aoede',
    name: 'Aoede',
    gender: 'Female',
    tone: 'Melodic, Poetic & Expressive',
    description: 'Lyrical, vibrant, and elegant. Beautiful for poetry, luxury brand showcases, and theatrical dialogue.',
    accent: 'Melodic English',
    color: '#10b981',
    suggestedStyles: ['Lyrical poetic reciter', 'Charming luxury brand speaker', 'Enthusiastic theater actor'],
    previewSample: 'Words carry beauty and harmony. Aoede transforms sentences into lyrical, expressive audio.'
  }
];

export const STYLE_PRESETS = [
  { label: 'Natural & Balanced', value: 'Natural, clear, and conversational speaking voice' },
  { label: '🎬 Movie Trailer', value: 'Deep, dramatic, suspenseful movie trailer narrator with cinematic pauses' },
  { label: '🧘 Calm Meditation', value: 'Soft, whisper-soft, relaxing mindfulness meditation instructor, slow pacing' },
  { label: '🎙️ Excited Radio Host', value: 'Fast-paced, vibrant, cheerful morning radio DJ filled with enthusiasm' },
  { label: '📰 Breaking News', value: 'Formal, urgent, objective, professional news anchor broadcast tone' },
  { label: '✨ Friendly Storyteller', value: 'Warm, whimsical children book narrator with expressive vocal inflections' },
  { label: '💼 Tech Keynote', value: 'Confident, inspiring, articulate tech visionary unveiling a breakthrough' },
  { label: '☕ Cozy Podcast', value: 'Intimate, relaxed, friendly late-night coffee shop conversation' }
];

export const SCRIPT_PRESETS = [
  {
    id: 'trailer',
    title: 'Blockbuster Trailer',
    category: 'Cinematic',
    icon: '🎬',
    voice: 'Fenrir',
    style: 'Deep, dramatic, suspenseful movie trailer narrator with cinematic pauses',
    text: 'In a galaxy forgotten by time, one voice broke the silence. Prepare for an epic journey where the only rule is survival.'
  },
  {
    id: 'meditation',
    title: 'Mindful Breathing',
    category: 'Wellness',
    icon: '🧘',
    voice: 'Zephyr',
    style: 'Soft, whisper-soft, relaxing mindfulness meditation instructor, slow pacing',
    text: 'Close your eyes. Gently breathe in through your nose, hold for a moment, and release all tension as you breathe out. You are safe, calm, and present.'
  },
  {
    id: 'product-launch',
    title: 'Product Keynote',
    category: 'Commercial',
    icon: '🚀',
    voice: 'Puck',
    style: 'Confident, inspiring, articulate tech visionary unveiling a breakthrough',
    text: 'Today, we are reinventing how humans express ideas. Meet the fastest, clearest, and most expressive voice generation technology ever built.'
  },
  {
    id: 'audiobook',
    title: 'Fantasy Tale',
    category: 'Storytelling',
    icon: '📖',
    voice: 'Aoede',
    style: 'Warm, whimsical book narrator with expressive vocal inflections',
    text: 'Beyond the Whispering Woods stood an ancient stone tower, where starlight was said to gather into crystalline drops every midnight.'
  },
  {
    id: 'news-flash',
    title: 'Global News Flash',
    category: 'News',
    icon: '📰',
    voice: 'Kore',
    style: 'Formal, urgent, objective, professional news anchor broadcast tone',
    text: 'This just in: international scientists have announced a landmark achievement in clean energy fusion, marking a historic leap forward for global sustainable power.'
  },
  {
    id: 'detective',
    title: 'Noir Detective',
    category: 'Character',
    icon: '🕵️',
    voice: 'Charon',
    style: 'Noir detective monologue, gravelly, quiet cynicism, late-night atmospheric',
    text: 'The rain washed the neon reflections across the pavement, but it could never wash away the clues left behind in the dark.'
  }
];
