// src/ai/flows/translate-text.ts
'use server';

/**
 * @fileOverview A text translation AI agent.
 *
 * - translateObject - A function that handles JSON object translation.
 * - TranslateObjectInput - The input type for the translateObject function.
 * - TranslateObjectOutput - The return type for the translateObject function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateObjectInputSchema = z.object({
  objectToTranslate: z.any().describe('A JSON object to be translated. The AI should iterate through its values and translate any strings.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "Spanish", "French", "Japanese").'),
});

export type TranslateObjectInput = z.infer<typeof TranslateObjectInputSchema>;

const TranslateObjectOutputSchema = z.object({
  translatedObject: z.any().describe('The translated JSON object, maintaining the original structure and keys.'),
});

export type TranslateObjectOutput = z.infer<typeof TranslateObjectOutputSchema>;

export async function translateObject(input: TranslateObjectInput): Promise<TranslateObjectOutput> {
  return translateObjectFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateObjectPrompt',
  input: {schema: z.object({
    jsonString: z.string(),
    targetLanguage: z.string(),
  })},
  output: {schema: TranslateObjectOutputSchema},
  prompt: `You are a translation expert. Your task is to translate all the string values within the given JSON object to {{{targetLanguage}}}.

  - You MUST maintain the exact same JSON structure, including all keys.
  - Only translate the string values. Do not translate keys or non-string values (like booleans or numbers).
  - For arrays of strings, translate each string in the array.
  - Return only the fully translated JSON object.

  JSON object to translate:
  {{{jsonString}}}
  `,
});

const translateObjectFlow = ai.defineFlow(
  {
    name: 'translateObjectFlow',
    inputSchema: TranslateObjectInputSchema,
    outputSchema: TranslateObjectOutputSchema,
  },
  async input => {
    const jsonString = JSON.stringify(input.objectToTranslate, null, 2);
    const {output} = await prompt({
        jsonString: jsonString,
        targetLanguage: input.targetLanguage,
    });
    return output!;
  }
);
