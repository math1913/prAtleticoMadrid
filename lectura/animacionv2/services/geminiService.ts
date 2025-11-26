import { GoogleGenAI } from "@google/genai";

export const generateStadiumBackground = async (): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API Key not found");
    throw new Error("API Key required");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const model = "gemini-2.5-flash-image"; 
  
  // Prompt optimized for a dark, atmospheric background that sits BEHIND the CSS grid.
  // We want bokeh lights, darkness, and the feeling of a massive stadium at night.
  const prompt = "Blurred background of a massive football stadium at night. Red and white theme. Heavy bokeh effect on stadium floodlights. Dark cinematic lighting. No sharp details, just atmosphere and depth. The foreground should be empty darkness where seats will be placed.";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};