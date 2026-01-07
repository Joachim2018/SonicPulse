
import { GoogleGenAI, Type } from "@google/genai";
import { Song, AnalyticsData, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const fetchTrendingMusic = async (): Promise<AnalyticsData> => {
  // Step 1: Use Google Search Grounding to find the latest trends
  const searchResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Find the top 10 trending songs globally as of today. Include title, artist, genre, and their current chart movement (up/down/steady). Provide a brief summary of the current music landscape.",
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const searchContent = searchResponse.text;
  const rawChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: GroundingSource[] = rawChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri,
    }));

  // Step 2: Use another call to structure this data into clean JSON for our UI
  const extractionResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following information about trending music, extract a clean JSON list of the top 10 songs. 
    Information: ${searchContent}
    
    Format each song as: { "rank": number, "title": string, "artist": string, "genre": string, "popularityScore": number (1-100), "dailyStreams": number (estimated in millions), "trend": "up" | "down" | "steady" }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          songs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                rank: { type: Type.NUMBER },
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                genre: { type: Type.STRING },
                popularityScore: { type: Type.NUMBER },
                dailyStreams: { type: Type.NUMBER },
                trend: { type: Type.STRING },
              },
              required: ["rank", "title", "artist", "genre", "popularityScore", "dailyStreams", "trend"],
            },
          },
          summary: { type: Type.STRING }
        },
        required: ["songs", "summary"],
      }
    },
  });

  const extractedData = JSON.parse(extractionResponse.text);

  return {
    songs: extractedData.songs.map((s: any, idx: number) => ({
      ...s,
      id: `song-${idx}`,
    })),
    sources,
    summary: extractedData.summary,
    lastUpdated: new Date().toLocaleTimeString(),
  };
};

export const getAIPredictions = async (songs: Song[]): Promise<string> => {
  const songList = songs.map(s => `${s.rank}. ${s.title} by ${s.artist} (${s.genre})`).join("\n");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `As an expert music analyst, provide a detailed 3-paragraph prediction on how these current trends will evolve over the next 3 months. Mention specific genres that are gaining momentum and why some artists might stay on top or drop off. Data: \n${songList}`,
  });

  return response.text;
};
