'use server';
/**
 * @fileOverview This file implements the AI DRS visual analysis flow using Gemini 2.5 Flash Lite.
 * It takes an array of cricket event frames and provides a loud, bold umpire decision.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
});

const AnalyzedFrameSchema = z.object({
  frameIndex: z.number().int().describe('The index of the frame in the original sequence.'),
  frameDescription: z.string().describe('A detailed textual analysis of this specific frame.'),
  detectedElements: z.array(DetectedElementSchema).describe('An array of detected elements within this frame.'),
});

const AIDRSVisualAnalysisInputSchema = z.object({
  eventDescription: z.string().describe('A brief textual description of the cricket event to be analyzed.'),
  frameDataUris: z.array(
    z.string().describe("A photo of a cricket event frame, as a base64 data URI.")
  ).min(1).describe('An array of key frames extracted from the video.'),
  additionalContext: z.string().optional().describe('Any additional textual context.'),
});
export type AIDRSVisualAnalysisInput = z.infer<typeof AIDRSVisualAnalysisInputSchema>;

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
  ]).describe('The final AI-predicted decision.'),
  confidencePercentage: z.number().min(0).max(100).describe('The AI\'s confidence in its final decision (0-100).'),
  explanation: z.string().describe('A detailed textual explanation of the logic.'),
  analyzedFrames: z.array(AnalyzedFrameSchema).optional().describe('Optional per-frame analysis.'),
});
export type AIDRSVisualAnalysisOutput = z.infer<typeof AIDRSVisualAnalysisOutputSchema>;

export async function aiDrsVisualAnalysis(input: AIDRSVisualAnalysisInput): Promise<AIDRSVisualAnalysisOutput> {
  console.log('AI Analysis starting with elite model: googleai/gemini-2.5-flash-lite');
  return aiDrsVisualAnalysisFlow(input);
}

const aiDrsVisualAnalysisPrompt = ai.definePrompt({
  name: 'aiDrsVisualAnalysisPrompt',
  model: 'googleai/gemini-2.5-flash-lite',
  input: { schema: AIDRSVisualAnalysisInputSchema },
  output: { schema: AIDRSVisualAnalysisOutputSchema },
  config: {
    temperature: 0.1,
  },
  prompt: `You are the ELITE VANTAGE POINT AI CRICKET UMPIRE. 

Your task is to analyze these cricket frames with 100% precision and deliver a LOUD, BOLD, and DECISIVE verdict.

CRITICAL VISUAL PROTOCOLS:
1. NO BALL CHECK: Look at the bowler's front foot relative to the popping crease.
2. WICKET CHECK: Track the ball path to the stumps or the impact on the pads.
3. CATCH CHECK: Determine if the ball touched the ground before the fielder secured control.

Your decision must be BOLD and LOUD. There is no room for ambiguity. Speak the decision LOUDLY in your final output.

Event Description: {{{eventDescription}}}
{{#if additionalContext}}
Context: {{{additionalContext}}}
{{/if}}

Analysis Frames provided in sequence.
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
    try {
      const { output } = await aiDrsVisualAnalysisPrompt(input);
      if (!output) throw new Error("AI failed to provide a verdict.");
      return output;
    } catch (err: any) {
      console.error('Gemini 2.5 Flash Lite Analysis failure:', err);
      throw new Error(`AI processing failed: ${err.message || 'Unknown error'}`);
    }
  }
);
