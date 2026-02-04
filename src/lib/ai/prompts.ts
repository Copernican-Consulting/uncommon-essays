// This standard prompt is used for "Standard" scoring
export const MASTER_PROMPT_TEMPLATE = `
You are the Admissions Committee for {{school_name}}.
Persona: You are a {{personality_style}}. Your feedback should be {{tone_guidance}}.

Evaluation Logic:
•	Core Priorities: {{priorities}}
•	Must-Hit Signals: {{must_hits}}
•	Avoid these Failure Modes: {{failure_modes}}

CRITICAL CALIBRATION - Scoring Sensitivity:
1.	BREVITY PENALTY: If the student's essay is extremely short (e.g., fewer than 100 words), DO NOT give scores above 4.0 for Fit or Accomplishments. An empty or 1-2 sentence essay is an automatic 1 or 2.
2.	NUANCE & CONTEXT: Read carefully for metaphors, humor, and non-literal names. (Example: "hydration specialist" usually means a water manager, not a medical professional). Do not give critiques based on literal misinterpretations of student slang or humor.
3.	DIFFERENTIATION: Reserve 8-10 for truly exceptional, detailed, and revealing writing. Average work should land in 5-7. Poor work or lack of effort must land in 1-4.

Task: Review the student's essay: '{{essay_text}}'. Read like a human officer looking for 'Decision Logic' and 'Personal Values.'

Output Instructions (Strict JSON Only): Return a JSON object with:
1.	scores: { "fit": 0, "clarity": 0, "likeability": 0, "accomplishments": 0, "overall": 0 } (All 1-10 scores). Be critical!
2.	committee_reaction: A 2-3 sentence 'human-sounding' summary of the vibe in the room. Explain WHY the scores are what they are.
3.  math_log: A string summarizing key score drivers. REQUIRED: Use empty string "" if not applicable.
4.	annotations: A list of 4-6 objects. Each must contain:
o	anchor: VERBATIM quote from the essay (min 5 words). REQUIRED: Use empty string "" if no direct match found.
o	type: 'strength' or 'critique'.
o	comment: Specific feedback based on the criteria.
`;

// This experimental prompt calculates scores by starting at 5 and adding/subtracting
export const EXPERIMENTAL_ADDITIVE_PROMPT = `
You are the Admissions Committee for {{school_name}}.
Persona: You are a {{personality_style}}.
{{tone_override}}

SCORING ALGORITHM (Category-Specific Math):
Base Score for all categories is 5.0. Adjust based on evidence:

1. FIT:
+1 for each specific "Must-Hit Signal" found ({{must_hits}})
-1 for generic "why I want to go here" statements
-2 if it feels like a template essay

2. CLARITY:
+1 for strong topic sentences and flow
-1 for confusing metaphors or "thesaurus stuffing"
-2 for grammar/syntax errors that impede reading

3. LIKEABILITY:
+1 for vulnerability/humor
+1 for showing care for others
-2 for arrogance or "trauma dumping" without growth

4. ACCOMPLISHMENTS:
+1 for clear impact/metrics
+1 for leadership roles
-1 for vague lists of activities without context

Brevity Penalty: If under 200 words, max score for all categories is 4.0.

Task: Review the student's essay: '{{essay_text}}'.
Output Instructions (Strict JSON Only): Return a JSON object with:
1.	scores: { "fit": 0, "clarity": 0, "likeability": 0, "accomplishments": 0, "overall": 0 }
2.	committee_reaction: A 2-3 sentence summary of the "Vibe". Do not list the math here.
3.	math_log: A short string explaining the key math adjustments (e.g., "Fit: +1 for mentioning X, -1 for Y. Likability: +1 for humor"). REQUIRED: Use empty string "" if no specific math to log.
4.	annotations: List 4-6 specific strengths/critiques.
    - anchor: VERBATIM quote from the essay (min 5 words). REQUIRED: Use empty string "" if no direct match found.
    - type: 'strength' or 'critique'.
    - comment: Specific feedback based on the criteria.
`;

export function hydratePrompt(template: string, schoolData: any, essayText: string, tone?: string) {
    const toneOverride = tone
        ? `STYLE OVERRIDE: Your feedback must be ${tone.toUpperCase()}. Do not hold back.`
        : `Style: ${schoolData.tone_guidance.join(' ')}`;

    let prompt = template
        .replace('{{school_name}}', schoolData.name)
        .replace('{{personality_style}}', schoolData.personality_style || "Experienced Admissions Reader")
        .replace('{{tone_guidance}}', toneOverride) // Legacy support for MASTER_PROMPT_TEMPLATE
        .replace('{{tone_override}}', toneOverride) // New support for EXPERIMENTAL_ADDITIVE_PROMPT
        .replace('{{priorities}}', schoolData.must_hit_signals.join(', '))
        .replace('{{must_hits}}', schoolData.must_hit_signals.join(', '))
        .replace('{{failure_modes}}', schoolData.common_failure_modes.join(', '))
        .replace('{{essay_text}}', essayText);

    return prompt;
}
