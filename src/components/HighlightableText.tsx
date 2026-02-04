"use client";

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface HighlightableTextProps {
    text: string;
    annotations: any[];
    activeSchool: string | null;
    activeAnnotationId: string | null;
    onAnnotationClick: (id: string, school: string) => void;
}

export function HighlightableText({
    text,
    annotations,
    activeSchool,
    activeAnnotationId,
    onAnnotationClick
}: HighlightableTextProps) {

    // Highlighting Engine v1: Direct Anchor Matching
    const parts = useMemo(() => {
        if (!text) return [];

        // Sort annotations by their position in the text to avoid overlaps for now (V1 simple approach)
        // Actually, let's just find all matches and wrap them.
        // To handle multiple schools, we'll only highlight the active school's annotations 
        // OR we can show all but emphasize active.

        let result: React.ReactNode[] = [text];

        annotations.forEach((anno) => {
            const anchor = anno.anchor;
            const isFromActiveSchool = anno.schoolName === activeSchool;

            const newResult: React.ReactNode[] = [];
            result.forEach((part) => {
                if (typeof part !== 'string') {
                    newResult.push(part);
                    return;
                }

                const index = part.indexOf(anchor);
                if (index === -1) {
                    newResult.push(part);
                } else {
                    newResult.push(part.substring(0, index));
                    newResult.push(
                        <mark
                            key={anno.id}
                            id={`highlight-${anno.id}`}
                            onClick={() => onAnnotationClick(anno.id, anno.schoolName)}
                            className={cn(
                                "cursor-pointer px-0.5 rounded transition-all",
                                anno.color.bg,
                                anno.color.text,
                                isFromActiveSchool ? "ring-2 ring-primary ring-offset-1 font-medium" : "opacity-60 grayscale-[0.5]",
                                activeAnnotationId === anno.id && "ring-4"
                            )}
                        >
                            {anchor}
                        </mark>
                    );
                    newResult.push(part.substring(index + anchor.length));
                }
            });
            result = newResult;
        });

        return result;
    }, [text, annotations, activeSchool, activeAnnotationId, onAnnotationClick]);

    return (
        <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed text-lg text-slate-800 font-sans">
                {parts}
            </div>
        </div>
    );
}
