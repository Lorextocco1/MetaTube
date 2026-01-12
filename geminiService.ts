import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedSongData } from "./types";

// Helper to get a random cover image
const getRandomCover = (id: number) => `https://picsum.photos/seed/${id}/400/400`;

// A generic royalty-free song for demo purposes since we can't stream copyright music
const DEMO_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 

export const generatePlaylistFromMood = async (mood: string): Promise<GeneratedSongData[]> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a playlist of 6 fictional or real songs that perfectly match this mood: "${mood}". For each song, provide a title, artist, album name, and a short 5-word description of the vibe.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              album: { type: Type.STRING },
              vibeDescription: { type: Type.STRING }
            },
            required: ["title", "artist", "album", "vibeDescription"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const data = JSON.parse(jsonText) as GeneratedSongData[];
    return data;
  } catch (error) {
    console.error("Error generating playlist:", error);
    return [];
  }
};

export const mapGeneratedToSong = (data: GeneratedSongData, index: number): any => {
    // In a real app, we would search for the specific audio URL here.
    // For this demo, we use a placeholder audio and random cover.
    return {
        id: `gen-${Date.now()}-${index}`,
        title: data.title,
        artist: data.artist,
        album: data.album,
        coverUrl: getRandomCover(index + Math.floor(Math.random() * 1000)),
        audioUrl: DEMO_AUDIO_URL,
        mood: data.vibeDescription,
        duration: 372 // Placeholder duration for the demo song
    };
};