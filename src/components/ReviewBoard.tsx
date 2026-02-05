"use client";

import { useState, useMemo } from 'react';
import { HighlightableText } from './HighlightableText';
import { CommitteeSidebar } from './CommitteeSidebar';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Download, RotateCcw } from 'lucide-react';

interface ReviewBoardProps {
    essayText: string;
    results: any[];
    onBack: () => void;
    onRetry?: (schoolName: string) => void;
}

export function ReviewBoard({ essayText, results, onBack, onRetry }: ReviewBoardProps) {
    const firstSuccess = results.find(r => r.status !== 'error')?.schoolName;
    const [activeSchool, setActiveSchool] = useState<string>(firstSuccess || results[0]?.schoolName);
    const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);

    // Assign colors to schools
    const schoolColors = useMemo(() => {
        const defaultColors = [
            { bg: 'bg-red-500/20', text: 'text-red-700', border: 'border-red-200', hex: '#ef4444' },
            { bg: 'bg-blue-500/20', text: 'text-blue-700', border: 'border-blue-200', hex: '#3b82f6' },
            { bg: 'bg-green-500/20', text: 'text-green-700', border: 'border-green-200', hex: '#22c55e' },
            { bg: 'bg-purple-500/20', text: 'text-purple-700', border: 'border-purple-200', hex: '#a855f7' },
            { bg: 'bg-orange-500/20', text: 'text-orange-700', border: 'border-orange-200', hex: '#f97316' },
        ];

        const map: Record<string, typeof defaultColors[0]> = {};
        results.forEach((r, i) => {
            map[r.schoolName] = defaultColors[i % defaultColors.length];
        });
        return map;
    }, [results]);

    const allAnnotations = useMemo(() => {
        return results
            .filter(r => r.status !== 'error')
            .flatMap(r =>
                r.annotations.map((a: any, i: number) => ({
                    ...a,
                    id: `${r.schoolName}-${i}`,
                    schoolName: r.schoolName,
                    color: schoolColors[r.schoolName]
                }))
            );
    }, [results, schoolColors]);

    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={onBack}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Home
                    </Button>
                    <h2 className="text-xl font-serif font-bold text-slate-800">Admissions Review</h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Download className="w-4 h-4 mr-2" /> Save as PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={onBack}>
                        <RotateCcw className="w-4 h-4 mr-2" /> Start Over
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 gap-8 overflow-hidden">
                {/* Left: Essay View */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-y-auto p-12">
                    <HighlightableText
                        text={essayText}
                        annotations={allAnnotations}
                        activeSchool={activeSchool}
                        activeAnnotationId={activeAnnotationId}
                        onAnnotationClick={(id, school) => {
                            setActiveAnnotationId(id);
                            setActiveSchool(school);
                        }}
                    />
                </div>

                {/* Right: Committee Sidebar */}
                <div className="w-[400px] flex flex-col gap-4 overflow-y-auto pr-2">
                    <CommitteeSidebar
                        results={results}
                        schoolColors={schoolColors}
                        activeSchool={activeSchool}
                        setActiveSchool={setActiveSchool}
                        activeAnnotationId={activeAnnotationId}
                        onRetry={onRetry}
                        onAnnotationClick={(id, school) => {
                            setActiveAnnotationId(id);
                            setActiveSchool(school);
                            // Scroll to highlight
                            setTimeout(() => {
                                const element = document.getElementById(`highlight-${id}`);
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }, 50);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
