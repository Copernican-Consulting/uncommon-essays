import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { hydratePrompt, MASTER_PROMPT_TEMPLATE, EXPERIMENTAL_ADDITIVE_PROMPT } from '@/lib/ai/prompts';
import schoolsData from '@/lib/data/schools.json';
import { z } from 'zod';

const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { essayText, schoolIds, modelId, tone, scoringModel } = await req.json();
        const selectedModel = modelId || 'openai/gpt-4o'; // Default

        console.log('Simulate request:', { essayTextLength: essayText?.length, schoolIds, selectedModel, tone, scoringModel });

        if (!essayText || !schoolIds || !Array.isArray(schoolIds)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const selectedSchools = (schoolsData as any[]).filter((s: any) => schoolIds.includes(s.name));
        const promptTemplate = scoringModel === 'experimental' ? EXPERIMENTAL_ADDITIVE_PROMPT : MASTER_PROMPT_TEMPLATE;

        const simulationPromises = selectedSchools.map(async (school: any) => {
            const prompt = hydratePrompt(promptTemplate, school, essayText, tone);

            const result = await generateObject({
                model: openrouter(selectedModel),
                schema: z.object({
                    scores: z.object({
                        fit: z.number().min(0).max(10),
                        clarity: z.number().min(0).max(10),
                        likeability: z.number().min(0).max(10),
                        accomplishments: z.number().min(0).max(10),
                        overall: z.number().min(0).max(10),
                    }),
                    committee_reaction: z.string(),
                    math_log: z.string(),
                    annotations: z.array(z.object({
                        anchor: z.string(),
                        type: z.enum(['strength', 'critique']),
                        comment: z.string(),
                    })),
                }),
                prompt,
            });

            return {
                schoolName: school.name,
                prompt,
                criteria: {
                    must_hits: school.must_hit_signals,
                    failure_modes: school.common_failure_modes,
                    overall_guidance: school.overall_guidance
                },
                ...result.object,
            };
        });

        const results = await Promise.all(simulationPromises);

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error('Full Simulation Error Object:', error);

        // AI SDK often puts the provider error in error.cause or error.body
        if (error.cause) console.error('Error Cause:', error.cause);
        if (error.body) console.error('Error Body:', error.body);

        const message = error.message || "Unknown error";
        return NextResponse.json({
            error: `Simulation failed: ${message}`,
            details: JSON.stringify(error, Object.getOwnPropertyNames(error))
        }, { status: 500 });
    }
}
