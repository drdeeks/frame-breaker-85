import { GoogleGenAI, Type } from '@google/genai';
import { BRICK_ROWS, BRICK_COLS, BRICK_HEIGHT, BRICK_GAP, BRICK_WIDTH, POWER_UP_CHANCE, COLORS, ALL_POWER_TYPES } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a 2D array of numbers for a brick breaker game level layout. The grid must be ${BRICK_ROWS} rows by ${BRICK_COLS} columns.
      Use numbers 1-4 for different brick types and 0 for empty space.
      The output should be a fun, challenging, and aesthetically pleasing pattern, like a simple spaceship, face, or geometric design.
      Only output the JSON array.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: `A 2D array representing the brick layout, ${BRICK_ROWS} rows and ${BRICK_COLS} columns. Each inner array is a row.`,
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.INTEGER,
              description: "A number from 0 to 4 representing a brick type or empty space."
            },
          },
        },
      },
    });

    const layout = JSON.parse(response.text);

    if (!Array.isArray(layout) || layout.length === 0 || !Array.isArray(layout[0])) {
      throw new Error("Invalid level format from AI");
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(layout));
  } catch (error) {
    console.error("Error generating level:", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to generate level' }));
  }
}