import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { hydratePrompt, MASTER_PROMPT_TEMPLATE } from '@/lib/ai/prompts';
import schoolsData from '@/lib/data/schools.json';
import { z } from 'zod';

const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { essayText, schoolIds, modelId } = await req.json();
        const selectedModel = modelId || 'openai/gpt-4o'; // Default

        console.log('Simulate request:', { essayTextLength: essayText?.length, schoolIds, selectedModel });

        if (!essayText || !schoolIds || !Array.isArray(schoolIds)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const selectedSchools = (schoolsData as any[]).filter((s: any) => schoolIds.includes(s.name));

        const simulationPromises = selectedSchools.map(async (school: any) => {
            const prompt = hydratePrompt(MASTER_PROMPT_TEMPLATE, school, essayText);

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
        console.error('Simulation error:', error);
        // Provide more detail if it's an OpenRouter/OpenAI error
        const message = error.response?.data?.error?.message || error.message;
        return NextResponse.json({
            error: `Simulation failed: ${message}`,
            details: error.stack
        }, { status: 500 });
    }
}
