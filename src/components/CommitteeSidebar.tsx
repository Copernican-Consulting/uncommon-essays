"use client";

import { cn } from '@/lib/utils';
import { ChartBar, MessageSquare, Star, Users } from 'lucide-react';

interface CommitteeSidebarProps {
    results: any[];
    schoolColors: any;
    activeSchool: string;
    setActiveSchool: (name: string) => void;
    activeAnnotationId: string | null;
}

export function CommitteeSidebar({
    results,
    schoolColors,
    activeSchool,
    setActiveSchool,
    activeAnnotationId
}: CommitteeSidebarProps) {
    return (
        <div className="space-y-4">
            {results.map((result) => {
                const isActive = activeSchool === result.schoolName;
                const color = schoolColors[result.schoolName];

                return (
                    <div
                        key={result.schoolName}
                        className={cn(
                            "border rounded-2xl transition-all overflow-hidden bg-white",
                            isActive ? "shadow-md ring-2 ring-primary" : "border-slate-200 opacity-80 hover:opacity-100"
                        )}
                    >
                        {/* School Header */}
                        <div
                            onClick={() => setActiveSchool(result.schoolName)}
                            className={cn(
                                "p-4 cursor-pointer flex justify-between items-center transition-colors",
                                isActive ? color.bg : "bg-white hover:bg-slate-50"
                            )}
                        >
                            <div>
                                <h3 className={cn("font-bold", isActive ? color.text : "text-slate-700")}>
                                    {result.schoolName}
                                </h3>
                                <div className="flex gap-2 items-center mt-1">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <div
                                                key={s}
                                                className={cn(
                                                    "w-3 h-1 rounded-full",
                                                    s <= result.scores.overall / 2 ? color.bg.replace('/20', '') : "bg-slate-200"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Overall {result.scores.overall.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-lg",
                                isActive ? "bg-white text-primary" : "bg-slate-50 text-slate-400"
                            )}>
                                {Math.round(result.scores.overall)}
                            </div>
                        </div>

                        {/* Content (Expanded) */}
                        {isActive && (
                            <div className="p-5 space-y-6 animate-in slide-in-from-top-2 duration-300">
                                {/* Reaction */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                        <Users className="w-3 h-3" /> Committee Vibe
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-200 pl-4">
                                        "{result.committee_reaction}"
                                    </p>
                                </div>

                                {/* Scoreboard */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                                        <ChartBar className="w-3 h-3" /> Scoreboard
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            { label: "Fit with School", score: result.scores.fit },
                                            { label: "Clarity of Message", score: result.scores.clarity },
                                            { label: "Likeability", score: result.scores.likeability },
                                            { label: "Accomplishments", score: result.scores.accomplishments },
                                        ].map((row) => (
                                            <div key={row.label} className="space-y-1">
                                                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                                                    <span>{row.label}</span>
                                                    <span>{row.score.toFixed(1)}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-1000"
                                                        style={{
                                                            width: `${Math.max(0, Math.min(100, (Number(row.score) || 0) * 10))}%`,
                                                            backgroundColor: color.hex
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Math Log (Experimental) */}
                                {result.math_log && (
                                    <div className="pt-4 border-t border-slate-100">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                            <ChartBar className="w-3 h-3" /> Math Log
                                        </h4>
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                            <p className="text-xs font-mono text-slate-600 whitespace-pre-wrap leading-relaxed">
                                                {result.math_log}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Evaluation Criteria */}
                                <div className="pt-4 border-t border-slate-100">
                                    <details className="group">
                                        <summary className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 list-none flex items-center gap-1">
                                            <Star className="w-3 h-3" /> View Evaluation Criteria
                                        </summary>
                                        <div className="mt-3 space-y-3">
                                            <div>
                                                <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-1">Must-Hit Signals</h5>
                                                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                                                    {result.criteria?.must_hits.map((hit: string, i: number) => (
                                                        <li key={i}>{hit}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            {result.criteria?.failure_modes && (
                                                <div>
                                                    <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-1">Avoid Failure Modes</h5>
                                                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                                                        {result.criteria.failure_modes.map((fm: string, i: number) => (
                                                            <li key={i}>{fm}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <div>
                                                <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-1">Overall Guidance</h5>
                                                <p className="text-xs text-slate-600 italic">{result.criteria?.overall_guidance}</p>
                                            </div>
                                        </div>
                                    </details>
                                </div>

                                {/* Debug Pane */}
                                <div className="pt-4 border-t border-slate-100">
                                    <details className="group">
                                        <summary className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 list-none flex items-center gap-1">
                                            <ChartBar className="w-3 h-3 rotate-90" /> Raw Prompt (Debug)
                                        </summary>
                                        <div className="mt-3 p-3 bg-slate-900 rounded-lg overflow-x-auto">
                                            <pre className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap leading-tight">
                                                {result.prompt}
                                            </pre>
                                        </div>
                                    </details>
                                </div>

                                {/* Annotations */}
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" /> Detailed Commentary
                                    </h4>
                                    <div className="space-y-3">
                                        {result.annotations.map((anno: any, i: number) => {
                                            const id = `${result.schoolName}-${i}`;
                                            const isFocused = activeAnnotationId === id;
                                            return (
                                                <div
                                                    key={id}
                                                    id={id}
                                                    className={cn(
                                                        "p-3 rounded-xl border transition-all text-sm",
                                                        isFocused ? "bg-slate-50 border-primary/30 ring-1 ring-primary/20 shadow-sm scale-[1.02]" : "bg-slate-50/50 border-slate-100 opacity-80"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={cn(
                                                            "text-[9px] font-bold uppercase py-0.5 px-1.5 rounded",
                                                            anno.type === 'strength' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                                        )}>
                                                            {anno.type}
                                                        </span>
                                                    </div>
                                                    {anno.anchor && (
                                                        <blockquote className="border-l-2 border-slate-300 pl-2 mb-2 italic text-xs text-slate-500 line-clamp-2">
                                                            "{anno.anchor}"
                                                        </blockquote>
                                                    )}
                                                    <p className="text-slate-700 leading-snug">{anno.comment}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
