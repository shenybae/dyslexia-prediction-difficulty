import { GoogleGenAI, Type } from "@google/genai";
import { PronunciationResult } from '../types';
import * as FileSystem from 'expo-file-system';

export const checkPronunciation = async (audioUri: string, targetWord: string): Promise<PronunciationResult> => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Read file as Base64 using Expo FileSystem
    const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: 'base64',
    });

    const prompt = `
      Analyze this audio recording of a child attempting to say the word "${targetWord}".
      Evaluate the pronunciation accuracy considering they might have dyslexia or speech difficulties.
      Return a JSON object with:
      - score: integer 0-100 (100 is perfect)
      - isCorrect: boolean (true if recognizable as the word)
      - feedback: A short, encouraging sentence for a child (max 15 words).
      - phoneticBreakdown: Simple phonetic string of what was heard vs expected.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/m4a', // Default Expo AV recording format usually
              data: base64Audio
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
            phoneticBreakdown: { type: Type.STRING },
          },
          required: ['score', 'isCorrect', 'feedback']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as PronunciationResult;
    }

    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      score: 50,
      isCorrect: false,
      feedback: "I couldn't hear that clearly. Can you try again?",
    };
  }
};