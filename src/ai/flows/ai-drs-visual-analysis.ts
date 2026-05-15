'use server';
/**
 * @fileOverview This file implements the AI DRS visual analysis flow.
 * It takes an array of cricket event frames and a description, then uses
 * a multimodal AI model to analyze the frames, detect key elements, and provide
 * a decision, confidence score, and explanation with suggested highlight locations.
 *
 * - aiDrsVisualAnalysis - The main function to trigger the visual analysis.
 * - AIDRSVisualAnalysisInput - The input type for the analysis.
 * - AIDRSVisualAnalysisOutput - The output type for the analysis result.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the schema for detected elements and their highlight suggestions
const DetectedElementSchema = z.object({
  type: z.enum([
    'bowler_foot_position',
    'crease_line',
    'ball_position',
    'catch_contact',
    'ground_touch_possibility',
    'other_relevant_element' // Allow for flexibility
  ]).describe('The type of element detected.'),
  description: z.string().describe('A brief description of the detected element.'),
  // Bounding box coordinates in normalized format (0 to 1) [x_min, y_min, x_max, y_max]
  boundingBox: z.array(z.number()).length(4).optional().describe('Optional bounding box coordinates [x_min, y_min, x_max, y_max] for highlighting, normalized to 0-1 range.'),
  // Or polygon coordinates for lines/complex shapes, normalized to 0-1 range [[x1, y1], [x2, y2], ...]
  polygon: z.array(z.array(z.number()).length(2)).optional().describe('Optional polygon coordinates [[x1, y1], [x2, y2], ...] for highlighting, normalized to 0-1 range.'),
});

// Define the schema for analysis of a single frame
const AnalyzedFrameSchema = z.object({
  frameIndex: z.number().int().describe('The index of the frame in the original sequence.'),
  frameDescription: z.string().describe('A detailed textual analysis of this specific frame.'),
  detectedElements: z.array(DetectedElementSchema).describe('An array of detected elements within this frame, with highlighting suggestions.'),
});

// Define the input schema for the AI DRS visual analysis
const AIDRSVisualAnalysisInputSchema = z.object({
  eventDescription: z.string().describe('A brief textual description of the cricket event to be analyzed (e.g., "Leg before wicket appeal", "Catch appeal").'),
  frameDataUris: z.array(
    z.string().describe("A photo of a cricket event frame, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.")
  ).min(1).describe('An array of Base64 encoded image data URIs representing key frames extracted from the video.'),
  additionalContext: z.string().optional().describe('Any additional textual context that might be relevant for the AI analysis.'),
});
export type AIDRSVisualAnalysisInput = z.infer<typeof AIDRSVisualAnalysisInputSchema>;

// Define the output schema for the AI DRS visual analysis
const AIDRSVisualAnalysisOutputSchema = z.object({
  finalDecision: z.enum([
    'OUT',
    'NOT OUT',
    'WIDE',
    'FAIR DELIVERY',
    'NO BALL',
    'VALID BALL',
    'CATCH VALIDITY: VALID',
    'CATCH VALIDITY: INVALID',
    'UNDEFINED_DECISION' // In case the AI can't make a clear decision
  ]).describe('The final AI-predicted decision for the cricket event.'),
  confidencePercentage: z.number().min(0).max(100).describe('The AI\'s confidence in its final decision, as a percentage (0-100).'),
  explanation: z.string().describe('A detailed textual explanation and reasoning behind the AI\'s final decision.'),
  analyzedFrames: z.array(AnalyzedFrameSchema).optional().describe('An array of objects, each containing analysis for a specific frame, including detected elements and highlight suggestions.'),
});
export type AIDRSVisualAnalysisOutput = z.infer<typeof AIDRSVisualAnalysisOutputSchema>;

export async function aiDrsVisualAnalysis(input: AIDRSVisualAnalysisInput): Promise<AIDRSVisualAnalysisOutput> {
  return aiDrsVisualAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDrsVisualAnalysisPrompt',
  input: { schema: AIDRSVisualAnalysisInputSchema },
  output: { schema: AIDRSVisualAnalysisOutputSchema },
  config: {
    temperature: 0.5,
    maxOutputTokens: 2048,
  },
  prompt: `You are an expert cricket umpire and AI visual analysis system. Your task is to analyze cricket events frame by frame based on the provided images and textual description.

Critically analyze the provided frames to detect and reason about the following elements:
- Bowler's foot position relative to the crease line.
- The position and path of the ball.
- Any contact with the bat, pad, or gloves.
- Whether a catch was cleanly taken, including ground touch possibility.
- The state of the stumps or bails if relevant.

For each frame, you should:
1. Provide a concise 'frameDescription' summarizing the key observations.
2. Identify and list 'detectedElements' with their 'type', 'description', and precise 'boundingBox' or 'polygon' coordinates for visual highlighting. Coordinates MUST be normalized to a 0-1 range.

Based on your comprehensive analysis of all frames, determine a 'finalDecision', a 'confidencePercentage' (0-100), and a detailed 'explanation'.

Event Description: {{{eventDescription}}}
{{#if additionalContext}}
Additional Context: {{{additionalContext}}}
{{/if}}

Review the following frames:
{{#each frameDataUris}}
--- Frame ---
{{media url=this}}
{{/each}}
`,
});

const aiDrsVisualAnalysisFlow = ai.defineFlow(
  {
    name: 'aiDrsVisualAnalysisFlow',
    inputSchema: AIDRSVisualAnalysisInputSchema,
    outputSchema: AIDRSVisualAnalysisOutputSchema,
    model: 'googleai/gemini-1.5-flash', 
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
