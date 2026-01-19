
import { GoogleGenAI } from "@google/genai";
import { VideoGenerationConfig, Resolution, AspectRatio } from "../types";

export const geminiService = {
  async generateVideo(config: VideoGenerationConfig) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const isAssetMode = config.assets && config.assets.length > 0;
    const model = isAssetMode ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';

    const payload: any = {
      model,
      prompt: config.prompt,
      config: {
        numberOfVideos: 1,
        resolution: config.resolution,
        aspectRatio: config.aspectRatio,
      },
    };

    if (config.startImage) {
      payload.image = {
        imageBytes: config.startImage.split(',')[1],
        mimeType: 'image/png',
      };
    }

    if (config.endImage) {
      payload.config.lastFrame = {
        imageBytes: config.endImage.split(',')[1],
        mimeType: 'image/png',
      };
    }

    if (isAssetMode) {
      payload.config.referenceImages = config.assets?.map(asset => ({
        image: {
          imageBytes: asset.split(',')[1],
          mimeType: 'image/png',
        },
        referenceType: 'ASSET'
      }));
    }

    let operation = await ai.models.generateVideos(payload);

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
      } catch (error: any) {
        if (error.message?.includes("Requested entity was not found")) {
          throw new Error("API_KEY_EXPIRED");
        }
        throw error;
      }
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Failed to generate video");

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await videoResponse.blob();
    const localUrl = URL.createObjectURL(blob);

    return {
      uri: downloadLink,
      localUrl,
      rawResponse: operation.response?.generatedVideos?.[0]?.video
    };
  },

  async extendVideo(previousVideo: any, prompt: string, aspectRatio: AspectRatio) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt,
      video: previousVideo,
      config: {
        numberOfVideos: 1,
        resolution: Resolution.R720P,
        aspectRatio,
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Failed to extend video");

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await videoResponse.blob();
    const localUrl = URL.createObjectURL(blob);

    return {
      uri: downloadLink,
      localUrl,
      rawResponse: operation.response?.generatedVideos?.[0]?.video
    };
  }
};
