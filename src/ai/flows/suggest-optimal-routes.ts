
'use server';
/**
 * @fileOverview An AI agent that suggests optimal routes or scheduling adjustments for trucking fleets.
 *
 * - suggestOptimalRoutes - A function that handles the route optimization process.
 * - SuggestOptimalRoutesInput - The input type for the suggestOptimalRoutes function.
 * - SuggestOptimalRoutesOutput - The return type for the suggestOptimalRoutes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalRoutesInputSchema = z.object({
  deliveryDeadline: z
    .string()
    .describe('The date and time when the delivery must be completed.'),
  driverAvailability: z
    .string()
    .describe(
      'The availability of drivers, including their working hours and any breaks.'
    ),
  currentLocation: z
    .string()
    .describe('The current location of the truck, for example, city and state.'),
  destination: z
    .string()
    .describe('The destination for the delivery, for example, city and state.'),
  truckCapacity: z
    .string()
    .describe('The weight and volume capacity of the truck.'),
  trafficConditions: z
    .string()
    .optional()
    .describe('Current traffic conditions on the likely routes.'),
  weatherConditions: z
    .string()
    .optional()
    .describe('Weather conditions on the likely routes.'),
  routeRestrictions: z
    .string()
    .optional()
    .describe(
      'Any route restrictions that apply, such as low bridges or weight limits.'
    ),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH'])
    .default('MEDIUM')
    .describe('The delivery urgency level.'),
});

export type SuggestOptimalRoutesInput = z.infer<typeof SuggestOptimalRoutesInputSchema>;

const SuggestOptimalRoutesOutputSchema = z.object({
  suggestedRoute: z.string().describe('The suggested optimal route.'),
  estimatedTravelTime: z.string().describe('The estimated travel time for the suggested route.'),
  suggestedScheduleAdjustments: z
    .string()
    .describe('Any suggested adjustments to the delivery schedule.'),
  reasoning: z.string().describe('The AI reasoning behind the suggestion.'),
});

export type SuggestOptimalRoutesOutput = z.infer<typeof SuggestOptimalRoutesOutputSchema>;

export async function suggestOptimalRoutes(
  input: SuggestOptimalRoutesInput
): Promise<SuggestOptimalRoutesOutput> {
  return suggestOptimalRoutesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalRoutesPrompt',
  input: {schema: SuggestOptimalRoutesInputSchema},
  output: {schema: SuggestOptimalRoutesOutputSchema},
  prompt: `You are an expert in route optimization for trucking fleets.

  Based on the following information, suggest the optimal route, estimated travel time, and any necessary schedule adjustments.

  Delivery Deadline: {{{deliveryDeadline}}}
  Driver Availability: {{{driverAvailability}}}
  Current Location: {{{currentLocation}}}
  Destination: {{{destination}}}
  Truck Capacity: {{{truckCapacity}}}
  Traffic Conditions: {{{trafficConditions}}}
  Weather Conditions: {{{weatherConditions}}}
  Route Restrictions: {{{routeRestrictions}}}
  Priority: {{{priority}}}

  Consider all factors to provide the most efficient and cost-effective recommendations. Explain your reasoning.
  Output in plain English.`,
});

const suggestOptimalRoutesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalRoutesFlow',
    inputSchema: SuggestOptimalRoutesInputSchema,
    outputSchema: SuggestOptimalRoutesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate route suggestions.");
    }
    return output;
  }
);
