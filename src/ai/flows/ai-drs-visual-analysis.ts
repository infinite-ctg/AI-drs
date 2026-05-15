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
    'other_relevant_element'
  ]).describe('The type of element detected.'),
  description: z.string().describe('A brief description of the detected element.'),
  boundingBox: z.array(z.number()).length(4).optional().describe('Optional bounding box coordinates [x_min, y_min, x_max, y_max] for highlighting, normalized to 0-1 range.'),
  polygon: z.array(z.array(z.number()).length(2)).optional().describe('Optional polygon coordinates [[x1, y1], [x2, y2], ...] for highlighting, normalized to 0-1 range.'),
});

// Define the schema for analysis of a single frame
const AnalyzedFrameSchema = z.object({
  frameIndex: z.number().int().describe('The index of the frame in the original sequence.'),
  frameDescription: z.string().describe('A detailed textual analysis of this specific frame.'),
  detectedElements: z.array(DetectedElementSchema).describe('An array of detected elements within this frame.'),
});

// Define the input schema for the AI DRS visual analysis
const AIDRSVisualAnalysisInputSchema = z.object({
  eventDescription: z.string().describe('A brief textual description of the cricket event to be analyzed.'),
  frameDataUris: z.array(
    z.string().describe("A photo of a cricket event frame, as a base64 data URI.")
  ).min(1).describe('An array of key frames extracted from the video.'),
  additionalContext: z.string().optional().describe('Any additional textual context.'),
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
    'UNDEFINED_DECISION'
  ]).describe('The final AI-predicted decision. This must be LOUD and clear.'),
  confidencePercentage: z.number().min(0).max(100).describe('The AI\'s confidence in its final decision (0-100).'),
  explanation: z.string().describe('A detailed textual explanation of the logic.'),
  analyzedFrames: z.array(AnalyzedFrameSchema).optional().describe('Optional per-frame analysis.'),
});
export type AIDRSVisualAnalysisOutput = z.infer<typeof AIDRSVisualAnalysisOutputSchema>;

export async function aiDrsVisualAnalysis(input: AIDRSVisualAnalysisInput): Promise<AIDRSVisualAnalysisOutput> {
  return aiDrsVisualAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDrsVisualAnalysisPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: AIDRSVisualAnalysisInputSchema },
  output: { schema: AIDRSVisualAnalysisOutputSchema },
  config: {
    temperature: 0.2,
    maxOutputTokens: 2048,
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `You are the ELITE VANTAGE POINT AI CRICKET UMPIRE. 

Your task is to analyze these cricket frames with 100% precision. 

CRITICAL VISUAL PROTOCOLS:
1. NO BALL CHECK: Look at the bowler's front foot relative to the popping crease.
2. WICKET CHECK: Track the ball path to the stumps or the impact on the pads.
3. CATCH CHECK: Determine if the ball touched the ground before the fielder secured control.

Your decision must be LOUD, BOLD, and DECISIVE. Do not hesitate.

Event Description: {{{eventDescription}}}
{{#if additionalContext}}
Context: {{{additionalContext}}}
{{/if}}

Analysis Frames:
{{#each frameDataUris}}
--- Frame {{@index}} ---
{{media url=this}}
{{/each}}
`,
});

const aiDrsVisualAnalysisFlow = ai.defineFlow(
  {
    name: 'aiDrsVisualAnalysisFlow',
    inputSchema: AIDRSVisualAnalysisInputSchema,
    outputSchema: AIDRSVisualAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("AI failed to provide a verdict.");
    return output;
  }
);