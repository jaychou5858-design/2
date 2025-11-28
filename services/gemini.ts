import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DictionaryResult } from "../types";

// Initialize the client. API_KEY is guaranteed to be available in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const dictionarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "The word being defined." },
    phonetic: { type: Type.STRING, description: "IPA phonetic transcription." },
    meanings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          partOfSpeech: { type: Type.STRING, description: "e.g., noun, verb, adjective" },
          definition: { type: Type.STRING, description: "A clear, academic definition." }
        },
        required: ["partOfSpeech", "definition"]
      }
    },
    examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sentence: { type: Type.STRING, description: "An example sentence using the word." },
          translation: { type: Type.STRING, description: "Chinese translation of the sentence." },
          usage: { type: Type.STRING, description: "Brief explanation of the specific collocation, nuance, or context used in this example (e.g., 'Used here in a formal academic context' or 'Common collocation with [x]')." }
        },
        required: ["sentence", "translation", "usage"]
      }
    },
    synonyms: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of up to 5 synonyms."
    },
    etymology: { type: Type.STRING, description: "Brief origin or etymology of the word." }
  },
  required: ["word", "phonetic", "meanings", "examples", "synonyms", "etymology"]
};

export const fetchDefinition = async (word: string): Promise<DictionaryResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a detailed dictionary entry for the English word or phrase: "${word}". 
      Target audience: University students. 
      
      Requirements:
      1. Definitions: Academic and clear.
      2. Examples: Select 3 distinct examples based on the word's part of speech and common collocations. 
         - Ensure the examples show *different* shades of meaning or contexts (e.g., one formal, one figurative, one common phrase).
         - Provide a "usage" note for each example explaining *why* this example was chosen (e.g., specific preposition used, tone, or field of study).
      3. Synonyms: 3-5 high-level synonyms.
      4. Etymology: Brief and interesting origin.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: dictionarySchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini.");
    
    return JSON.parse(text) as DictionaryResult;
  } catch (error) {
    console.error("Dictionary lookup failed:", error);
    throw error;
  }
};

export const fetchWordImage = async (word: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `Create a high-quality, educational, minimalist illustration representing the concept of the word: "${word}". 
            Style: Vector art, flat design, clean lines, suitable for a dictionary app. No text inside the image.`
          }
        ]
      },
      config: {
        // Nano banana models do not support responseMimeType or responseSchema
      }
    });

    // Iterate through parts to find the image
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    // Return null instead of throwing to allow partial UI rendering (text only)
    return null;
  }
};
