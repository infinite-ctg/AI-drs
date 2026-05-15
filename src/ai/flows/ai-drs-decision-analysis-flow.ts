'use server';
/**
 * @fileOverview This file defines a Genkit flow for AI-powered cricket umpire decision analysis.
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
  model: 'googleai/gemini-2.5-flash-lite',
  prompt: `You are an expert cricket third umpire AI. Your task is to analyze cricket events and provide an AI-assisted prediction.

Analyze the given cricket event which is of type '{{{clipType}}}'.
Description: {{{clipDescription}}}
Media: {{media url=mediaDataUri}}

Provide a LOUD and BOLD decision.`,
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
      throw new Error('AI prompt did not return output.');
    }
    return output;
  }
);
