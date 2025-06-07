
'use server';
/**
 * @fileOverview Translates text to a specified target language.
 *
 * - translateText - A function that handles the text translation.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  textToTranslate: z.string().describe('The text content to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "Spanish", "French", "Hindi").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  // If the text is empty or target language is English (or not specified properly), return original
  if (!input.textToTranslate.trim() || !input.targetLanguage || input.targetLanguage.toLowerCase() === 'english') {
    return { translatedText: input.textToTranslate };
  }
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `Translate the following text into {{{targetLanguage}}}.
Respond only with the translated text, without any introductory phrases or explanations.

Text to translate:
"{{{textToTranslate}}}"
`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input: TranslateTextInput) => {
    // Double check for empty/English before calling LLM
    if (!input.textToTranslate.trim() || !input.targetLanguage || input.targetLanguage.toLowerCase() === 'english') {
      return { translatedText: input.textToTranslate };
    }
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (e) {
      console.error(`Error translating text to ${input.targetLanguage}:`, e);
      // Fallback to original text if translation fails
      return { translatedText: `Could not translate to ${input.targetLanguage}. Original: ${input.textToTranslate}` };
    }
  }
);
