export interface VoiceInfo {
  id: string;
  name: string;
  gender: string;
  tone: string;
  description: string;
  accent: string;
  color: string;
  suggestedStyles: string[];
  previewSample: string;
}

export interface GeneratedClip {
  id: string;
  text: string;
  voice: string;
  audioBase64: string;
  mimeType: string;
  style?: string;
  model: string;
  createdAt: string;
  duration?: number;
  isDialogue?: boolean;
}

export interface DialogueTurn {
  id: string;
  speaker: string;
  text: string;
  style?: string;
}

export interface ScriptPreset {
  id: string;
  title: string;
  category: string;
  icon: string;
  voice: string;
  style: string;
  text: string;
}
