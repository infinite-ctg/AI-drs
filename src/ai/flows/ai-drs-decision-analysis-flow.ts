'use server';
/**
 * @fileOverview This file defines a Genkit flow for AI-powered cricket umpire decision analysis.
 *
 * - aiDrsDecisionAnalysis - A function that handles the AI DRS decision analysis process.
 * - AIDRSDecisionAnalysisInput - The input type for the aiDrsDecisionAnalysis function.
 * - AIDRSDecisionAnalysisOutput - The return type for the aiDrsDecisionAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIDRSDecisionAnalysisInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "A video clip or image of a cricket event, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  clipDescription: z
    .string()
    .describe(
      "A brief description of the cricket event being analyzed (e.g., 'bowler's foot during delivery', 'catch attempt', 'ball hitting stumps')."
    ),
  clipType: z
    .enum(['delivery', 'catch', 'wicket', 'replay'])
    .describe('The type of cricket event being analyzed.'),
});
export type AIDRSDecisionAnalysisInput = z.infer<
  typeof AIDRSDecisionAnalysisInputSchema
>;

const AIDRSDecisionAnalysisOutputSchema = z.object({
  decision: z
    .string()
    .describe(
      "The final predicted decision (e.g., 'OUT', 'NOT OUT', 'WIDE', 'FAIR DELIVERY', 'NO BALL', 'VALID BALL', 'CATCH VALID', 'CATCH INVALID')."
    ),
  decisionCategory: z
    .enum(['OUT_NOT_OUT', 'WIDE_FAIR', 'NO_BALL_VALID_BALL', 'CATCH_VALIDITY'])
    .describe('The category of the decision.'),
  confidencePercentage: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "The AI's confidence in its prediction, as a percentage (0-100)."
    ),
  explanation: z
    .string()
    .describe(
      "A concise explanation of the AI's reasoning for the decision, highlighting key visual evidence."
    ),
  highlightedFramesDescription: z
    .string()
    .optional()
    .describe(
      "A description of specific frames or moments in the media that are crucial to the decision (e.g., 'frame at 0.5s showing foot over line'). This is a textual description for potential UI highlighting."
    ),
});
export type AIDRSDecisionAnalysisOutput = z.infer<
  typeof AIDRSDecisionAnalysisOutputSchema
>;

export async function aiDrsDecisionAnalysis(
  input: AIDRSDecisionAnalysisInput
): Promise<AIDRSDecisionAnalysisOutput> {
  return aiDrsDecisionAnalysisFlow(input);
}

const aiDrsDecisionAnalysisPrompt = ai.definePrompt({
  name: 'aiDrsDecisionAnalysisPrompt',
  input: {schema: AIDRSDecisionAnalysisInputSchema},
  output: {schema: AIDRSDecisionAnalysisOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an expert cricket third umpire AI. Your task is to analyze cricket events from provided media and a description, then provide an AI-assisted prediction.\n\nAnalyze the given cricket event which is of type '{{{clipType}}}'.\nDescription of the event: {{{clipDescription}}}\nMedia for analysis: {{media url=mediaDataUri}}\n\nBased on your analysis, determine the decision, its category, your confidence in the prediction, and a clear explanation of your reasoning. If possible, identify specific moments or frames that are crucial to the decision.\n\nIMPORTANT: Do NOT fake precision. This is an AI-assisted prediction.\nProvide your response in JSON format according to the output schema.`,
});

const aiDrsDecisionAnalysisFlow = ai.defineFlow(
  {
    name: 'aiDrsDecisionAnalysisFlow',
    inputSchema: AIDRSDecisionAnalysisInputSchema,
    outputSchema: AIDRSDecisionAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await aiDrsDecisionAnalysisPrompt(input);
    if (!output) {
      throw new Error('AI DRS decision analysis prompt did not return any output.');
    }
    return output;
  }
);