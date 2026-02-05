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

import { createClient } from '@/lib/supabase/server';
import { deductCredit } from '@/lib/credits';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { essayText, schoolIds, modelId, tone, scoringModel, forceActionable, isRetry } = await req.json();
        const selectedModel = modelId || 'openai/gpt-4o'; // Default

        // Enforce credit check (Bypass if it's a retry)
        if (!isRetry) {
            try {
                await deductCredit(user.id);
            } catch (creditError: any) {
                console.error('Credit deduction error:', creditError);

                if (creditError.message === 'Insufficient credits') {
                    return NextResponse.json({
                        error: 'Insufficient credits',
                        message: 'You have run out of daily credits.'
                    }, { status: 403 });
                }

                // Re-throw if it's a system error (like Invalid API key)
                throw creditError;
            }
        }

        console.log('Simulate request:', { essayTextLength: essayText?.length, schoolIds, selectedModel, tone, scoringModel });

        if (!essayText || !schoolIds || !Array.isArray(schoolIds)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const selectedSchools = (schoolsData as any[]).filter((s: any) => schoolIds.includes(s.name));
        let promptTemplate = scoringModel === 'experimental' ? EXPERIMENTAL_ADDITIVE_PROMPT : MASTER_PROMPT_TEMPLATE;

        // Force Actionable Feedback logic
        if (forceActionable) {
            promptTemplate += "\n\nIMPORTANT: You MUST end each piece of feedback (annotation) with a clear, concrete, and actionable suggestion for improvement. For example: 'Provide more detail about the specific programming languages you used' or 'Explain how this experience changed your perspective on community service'. For positive feedback, use something like 'Keep this as is' or 'Expand on this specific feeling'.";
        }

        const simulationPromises = selectedSchools.map(async (school: any) => {
            try {
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
                    status: 'success',
                    prompt,
                    criteria: {
                        must_hits: school.must_hit_signals,
                        failure_modes: school.common_failure_modes,
                        overall_guidance: school.overall_guidance
                    },
                    ...result.object,
                };
            } catch (err: any) {
                console.error(`Simulation failed for ${school.name}:`, err);
                return {
                    schoolName: school.name,
                    status: 'error',
                    error: err.message || 'API Error'
                };
            }
        });

        const results = await Promise.all(simulationPromises);

        return NextResponse.json({ results });

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
