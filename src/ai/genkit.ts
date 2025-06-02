
import {genkit} from 'genkit';
import {googleAI, type GoogleAIPluginParams} from '@genkit-ai/googleai';

const googleAiOptions: GoogleAIPluginParams = {};

if (process.env.GOOGLE_API_KEY) {
  googleAiOptions.apiKey = process.env.GOOGLE_API_KEY;
  console.log("Genkit: Using GOOGLE_API_KEY for Google AI plugin.");
} else {
  console.warn(
    'Genkit WARNING: GOOGLE_API_KEY environment variable is not set. ' +
    'Google AI features may be limited or fail if Application Default Credentials are not configured. ' +
    'This can lead to errors if AI flows are invoked.'
  );
  // The googleAI plugin might still attempt to use Application Default Credentials if apiKey is not provided.
}

export const ai = genkit({
  plugins: [googleAI(googleAiOptions)],
  model: 'googleai/gemini-2.0-flash',
});
