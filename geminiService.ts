
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FactCheckResult, Verdict, GroundingSource } from "./types.ts";

// process.env is handled by Vite's define or standard environment injection
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

export const analyzeNews = async (claim: string): Promise<FactCheckResult> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze the following news claim or snippet for its truthfulness and credibility.
    Claim: "${claim}"
    
    Instructions:
    1. Use Google Search to verify the facts.
    2. Determine a verdict: TRUE, FALSE, MISLEADING, PARTIALLY TRUE, or UNVERIFIED.
    3. Assign a credibility score from 0 (entirely false) to 100 (entirely true).
    4. Provide a detailed analysis explaining why.
    5. Format your response clearly so I can extract the Verdict and Score easily.
    
    IMPORTANT: Start your response with the following format:
    VERDICT: [VERDICT]
    SCORE: [SCORE]
    ANALYSIS: [YOUR ANALYSIS]
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const verdictMatch = text.match(/VERDICT:\s*(TRUE|FALSE|MISLEADING|PARTIALLY TRUE|UNVERIFIED)/i);
    const scoreMatch = text.match(/SCORE:\s*(\d+)/);
    
    const verdict = (verdictMatch ? verdictMatch[1].toUpperCase() : Verdict.UNVERIFIED) as Verdict;
    const credibilityScore = scoreMatch ? parseInt(scoreMatch[1]) : 50;
    
    const analysis = text
      .replace(/VERDICT:.*?\n/i, '')
      .replace(/SCORE:.*?\n/i, '')
      .replace(/ANALYSIS:\s*/i, '')
      .trim();

    const sources: GroundingSource[] = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || 'External Source',
        uri: chunk.web?.uri || ''
      }))
      .filter(source => source.uri !== '');

    return {
      id: Math.random().toString(36).substring(7),
      claim,
      verdict,
      credibilityScore,
      analysis,
      sources,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze news. Please check your API key and try again.");
  }
};
