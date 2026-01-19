
export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16'
}

export enum Resolution {
  R720P = '720p',
  R1080P = '1080p'
}

export interface VideoGenerationConfig {
  prompt: string;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  startImage?: string; // base64
  endImage?: string; // base64
  assets?: string[]; // base64 array
}

export interface GeneratedVideo {
  id: string;
  uri: string;
  localUrl: string;
  prompt: string;
  timestamp: number;
  config: Partial<VideoGenerationConfig>;
}

export interface GenerationStatus {
  isGenerating: boolean;
  message: string;
  progress?: number;
}
