import { GoogleGenAI } from "@google/genai";
import { Destination } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Searches for a destination using Gemini with Google Maps grounding.
 * 
 * @param query The user's destination query (e.g., "Take me to the airport").
 * @param userLocation The user's current location for context.
 * @returns A structured destination object with map links.
 */
export const searchDestination = async (
  query: string,
  userLocation?: { lat: number; lng: number }
): Promise<Destination | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find the destination described by: "${query}". Return a short, helpful description of the place.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: userLocation ? {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.lat,
              longitude: userLocation.lng
            }
          }
        } : undefined,
        systemInstruction: "You are a ride hailing assistant. Your goal is to identify the specific location the user wants to go to. Be concise.",
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    let mapUri: string | undefined;
    let title: string | undefined;

    // Extract the first valid map URI from grounding chunks
    for (const chunk of chunks) {
      if (chunk.maps?.uri) {
        mapUri = chunk.maps.uri;
        title = chunk.maps.title;
        break;
      }
    }

    if (!mapUri && !response.text) {
      return null;
    }

    return {
      name: title || "Destination Found",
      description: response.text,
      mapUri: mapUri,
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Generates or edits an image using Gemini.
 *
 * @param prompt The text prompt.
 * @param imageBase64 Optional base64 image data for editing.
 * @param mimeType Optional mime type for the image.
 * @returns Object containing imageUrl and/or text.
 */
export const generateOrEditImage = async (
  prompt: string,
  imageBase64?: string,
  mimeType?: string
): Promise<{ imageUrl?: string; text?: string }> => {
  try {
    const model = 'gemini-2.5-flash-image';
    const parts: any[] = [];

    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      });
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts,
      },
    });

    let imageUrl: string | undefined;
    let text: string | undefined;

    // Iterate through parts to find image and text
    const responseParts = response.candidates?.[0]?.content?.parts || [];
    for (const part of responseParts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        const mime = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mime};base64,${base64EncodeString}`;
      } else if (part.text) {
        text = text ? text + part.text : part.text;
      }
    }

    return { imageUrl, text };
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};
