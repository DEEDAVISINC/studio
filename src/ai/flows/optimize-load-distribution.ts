
'use server';
/**
 * @fileOverview An AI agent that suggests optimal load distribution for trucking fleets.
 *
 * - optimizeLoadDistribution - A function that handles the load optimization process.
 * - OptimizeLoadDistributionInput - The input type for the optimizeLoadDistribution function.
 * - OptimizeLoadDistributionOutput - The return type for the optimizeLoadDistribution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeLoadDistributionInputSchema = z.object({
  itemsDescription: z
    .string()
    .describe(
      "Detailed list of items to be loaded, including their IDs, estimated weights, volumes, destinations, and optionally, values. For example: 'Item A: 100kg, 1cbm, Dest X, $500; Item B: 200kg, 1.5cbm, Dest Y, $800'"
    ),
  trucksDescription: z
    .string()
    .describe(
      "Details of available trucks, including their IDs, weight capacities, volume capacities, and current locations. For example: 'Truck 1: 1000kg cap, 10cbm cap, Loc Z; Truck 2: 1500kg cap, 12cbm cap, Loc W'"
    ),
  optimizationGoal: z
    .string()
    .describe(
      "Primary goal for optimization, e.g., 'Minimize number of trucks', 'Maximize total value transported', 'Ensure items for the same destination are on the same truck if possible'"
    ),
});

export type OptimizeLoadDistributionInput = z.infer<typeof OptimizeLoadDistributionInputSchema>;

const OptimizeLoadDistributionOutputSchema = z.object({
  truckLoadPlans: z.array(
    z.object({
      truckId: z.string().describe('Identifier of the truck.'),
      assignedItemIds: z.array(z.string()).describe('List of item IDs assigned to this truck.'),
      totalWeightLoaded: z.number().describe('Total weight loaded onto this truck (e.g., in kg or lbs).'),
      totalVolumeLoaded: z.number().describe('Total volume loaded onto this truck (e.g., in cbm or cft).'),
      totalValueLoaded: z.number().optional().describe('Total monetary value of items loaded, if applicable.'),
      suggestedRouteInfo: z.string().optional().describe('High-level suggested route or order of deliveries for this truck.'),
    })
  ).describe("Detailed plan for each truck, including assigned items and load metrics."),
  unassignedItemIds: z.array(z.string()).describe('List of item IDs that could not be assigned to any truck.'),
  summary: z.string().describe('Overall summary of the load optimization plan, reasoning, and how it meets the optimization goal.'),
});

export type OptimizeLoadDistributionOutput = z.infer<typeof OptimizeLoadDistributionOutputSchema>;

export async function optimizeLoadDistribution(
  input: OptimizeLoadDistributionInput
): Promise<OptimizeLoadDistributionOutput> {
  return optimizeLoadDistributionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeLoadDistributionPrompt',
  input: {schema: OptimizeLoadDistributionInputSchema},
  output: {schema: OptimizeLoadDistributionOutputSchema},
  prompt: `You are an expert in logistics and load planning for trucking fleets. Your goal is to optimize the distribution of items onto available trucks based on the provided descriptions and optimization goal.

Items to load:
{{{itemsDescription}}}

Available trucks:
{{{trucksDescription}}}

Optimization Goal: {{{optimizationGoal}}}

Analyze the items and trucks. Develop a load plan that assigns items to trucks.
For each truck used in the plan, specify:
- truckId
- assignedItemIds (list of item IDs)
- totalWeightLoaded (calculate this based on the items)
- totalVolumeLoaded (calculate this based on the items)
- totalValueLoaded (if item values are provided, sum them for the truck)
- suggestedRouteInfo (a brief suggestion for delivery order if multiple destinations on one truck)

List any item IDs that could not be assigned in the 'unassignedItemIds' field.

Provide an overall 'summary' of your plan, explaining your reasoning, how the plan meets the optimization goal, and any assumptions made.
Ensure the total weight and volume for each truck do not exceed its capacity.
Be precise with numbers and IDs. Output should strictly follow the defined JSON schema.
`,
});

const optimizeLoadDistributionFlow = ai.defineFlow(
  {
    name: 'optimizeLoadDistributionFlow',
    inputSchema: OptimizeLoadDistributionInputSchema,
    outputSchema: OptimizeLoadDistributionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate a load optimization plan.");
    }
    return output;
  }
);
