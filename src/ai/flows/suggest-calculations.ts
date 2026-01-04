'use server';

/**
 * @fileOverview Provides suggestions for calculations based on user input values.
 *
 * - suggestCalculations - A function that suggests calculations.
 * - SuggestCalculationsInput - The input type for suggestCalculations.
 * - SuggestCalculationsOutput - The return type for suggestCalculations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCalculationsInputSchema = z.object({
  userInputs: z.array(
    z.array(z.number()).length(6).describe('Six numerical input values from a user.')
  ).length(4).describe('Input values from four users, each providing six numbers.'),
});

export type SuggestCalculationsInput = z.infer<typeof SuggestCalculationsInputSchema>;

const SuggestCalculationsOutputSchema = z.object({
  suggestions: z.array(
    z.string().describe('A suggested calculation formula or insight.')
  ).describe('A list of suggested calculations based on the input values.'),
});

export type SuggestCalculationsOutput = z.infer<typeof SuggestCalculationsOutputSchema>;

export async function suggestCalculations(input: SuggestCalculationsInput): Promise<SuggestCalculationsOutput> {
  return suggestCalculationsFlow(input);
}

const suggestCalculationsPrompt = ai.definePrompt({
  name: 'suggestCalculationsPrompt',
  input: {schema: SuggestCalculationsInputSchema},
  output: {schema: SuggestCalculationsOutputSchema},
  prompt: `Given the input values from four users, suggest some interesting calculations or formulas that could be applied to these numbers to gain insights.

User Input Values:
{{#each userInputs}}
  User {{@index}}: {{this}}
{{/each}}

Suggestions:`, 
});

const suggestCalculationsFlow = ai.defineFlow(
  {
    name: 'suggestCalculationsFlow',
    inputSchema: SuggestCalculationsInputSchema,
    outputSchema: SuggestCalculationsOutputSchema,
  },
  async input => {
    const {output} = await suggestCalculationsPrompt(input);
    return output!;
  }
);
