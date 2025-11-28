import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WordItem, NounType } from "../types";

// Helper to get the API key safely
const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API Key is missing!");
    throw new Error("API Key is missing");
  }
  return key;
};

export const generateWordList = async (topic: string): Promise<WordItem[]> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const prompt = `
    Generate a list of 10 English nouns suitable for a 5th-grade student (approx 10-11 years old) related to the topic: "${topic}".
    
    Rules:
    1. Mix "Countable" nouns (e.g., apple, sandwich, chair) and "Uncountable" nouns (e.g., money, water, rice, homework).
    2. Provide a Chinese translation for the noun.
    3. Provide a very short, simple example sentence with a blank for the quantifier (e.g., "There isn't ___ money left.").
    4. Keep vocabulary simple and fun.
    
    Ensure the JSON structure matches the schema exactly.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        word: { type: Type.STRING, description: "The English noun (e.g. 'Water')" },
        type: { type: Type.STRING, enum: ["countable", "uncountable"], description: "Grammatical type" },
        translation: { type: Type.STRING, description: "Chinese translation" },
        exampleSentence: { type: Type.STRING, description: "Example sentence with a blank (use ___)" },
      },
      required: ["word", "type", "translation", "exampleSentence"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7, 
      },
    });

    const text = response.text;
    if (!text) return [];

    const parsedData = JSON.parse(text) as WordItem[];
    // Shuffle the array
    return parsedData.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error("Failed to generate words:", error);
    // Fallback data in case of API failure or empty key locally
    return [
      { word: "Money", type: "uncountable", translation: "钱", exampleSentence: "How ___ money do you have?" },
      { word: "Sandwich", type: "countable", translation: "三明治", exampleSentence: "I ate too many ___." },
      { word: "Water", type: "uncountable", translation: "水", exampleSentence: "Drink a little ___." },
      { word: "Book", type: "countable", translation: "书", exampleSentence: "I have a few ___." },
      { word: "Rice", type: "uncountable", translation: "米饭", exampleSentence: "I want a little ___." },
      { word: "Apple", type: "countable", translation: "苹果", exampleSentence: "How many ___ did you buy?" },
    ] as WordItem[];
  }
};