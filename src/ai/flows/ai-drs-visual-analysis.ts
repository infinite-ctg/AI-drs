'use server';
/**
 * @fileOverview This file implements the AI DRS visual analysis flow.
 * It takes an array of cricket event frames and a description, then uses
 * a multimodal AI model to analyze the frames, detect key elements, and provide
 * a decision, confidence score, and explanation with suggested highlight locations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { gemini15Flash } from '@genkit-ai/google-genai';

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
  model: gemini15Flash,
  input: { schema: AIDRSVisualAnalysisInputSchema },
  output: { schema: AIDRSVisualAnalysisOutputSchema },
  config: {
    temperature: 0.1,
    maxOutputTokens: 2048,
  },
  prompt: `You are the ELITE VANTAGE POINT AI CRICKET UMPIRE. 

Your task is to analyze these cricket frames with 100% precision. 

CRITICAL VISUAL PROTOCOLS:
1. NO BALL CHECK: Look at the bowler's front foot relative to the popping crease.
2. WICKET CHECK: Track the ball path to the stumps or the impact on the pads.
3. CATCH CHECK: Determine if the ball touched the ground before the fielder secured control.

Your decision must be LOUD, BOLD, and DECISIVE. 

Event Description: {{{eventDescription}}}
{{#if additionalContext}}
Context: {{{additionalContext}}}
{{/if}}

Analysis Frames provided in sequence. Analyze frame-by-frame for impact and contact points.
{{#each frameDataUris}}
Frame {{@index}}: {{media url=this}}
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
