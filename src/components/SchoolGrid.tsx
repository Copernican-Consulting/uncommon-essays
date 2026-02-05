"use client";

import { useMemo } from 'react';
import schoolColors from '@/../SchoolColors.json';
import allSchoolsList from '@/lib/data/all_schools_list.json';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SchoolColor {
    school: string;
    background_color_hex: string;
    text_color_hex: string;
}

interface SchoolGridProps {
    selected: string[];
    onSelect: (schoolName: string) => void;
    max?: number;
}

export function SchoolGrid({ selected, onSelect, max = 5 }: SchoolGridProps) {
    // Map colors to the robust school list to get correct internal names (activeName)
    const normalizedColors = useMemo(() => {
        return (schoolColors as SchoolColor[]).map(s => {
            // Find the corresponding school in the all_schools_list
            // We match by the 'school' field in SchoolColors.json which should match 'name' in all_schools_list.json
            const masterSchool = (allSchoolsList as any[]).find(m => m.name === s.school);

            // Use activeName (internal ID) if available, otherwise fallback to the name
            const internalName = masterSchool?.activeName || s.school;

            // For display, we want the clean name without technical suffixes
            // If masterData has a clean display name (usually the 'name' field), use that
            // otherwise use the school field from colors
            let displayName = s.school;

            // Special cases for display cleaning if needed, or just use the master name
            if (masterSchool) {
                // If it has a parenthetical we want to keep (like MIT), or if we want to strip the "University"
                displayName = masterSchool.name.replace(/\s+University$/, '')
                    .replace(/\s+College$/, '')
                    .replace(/University\s+of\s+/, '')
                    .replace(/College\s+of\s+/, '');

                // Specific manual overrides for best UI appearance
                if (masterSchool.name.includes("Johns Hopkins")) displayName = "Johns Hopkins";
                if (masterSchool.name.includes("UPenn") || masterSchool.name.includes("Pennsylvania")) displayName = "UPenn";
                if (masterSchool.name.includes("Berkeley")) displayName = "UC Berkeley";
                if (masterSchool.name.includes("UCLA")) displayName = "UCLA";
                if (masterSchool.name.includes("WashU") || masterSchool.name.includes("Washington University in St. Louis")) displayName = "WashU";
                if (masterSchool.name.includes("MIT")) displayName = "MIT";
                if (masterSchool.name.includes("Caltech")) displayName = "Caltech";
                if (masterSchool.name.includes("Georgia Tech")) displayName = "Georgia Tech";
                if (masterSchool.name.includes("USC")) displayName = "USC";
            }

            return {
                ...s,
                internalName,
                displayName
            };
        });
    }, []);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {normalizedColors.map((item) => {
                const isSelected = selected.includes(item.internalName);
                const isMax = selected.length >= max && !isSelected;

                return (
                    <button
                        key={item.school}
                        disabled={isMax}
                        onClick={() => onSelect(item.internalName)}
                        className={cn(
                            "relative h-20 rounded-xl px-2 transition-all duration-300 group overflow-hidden border-2 flex items-center justify-center",
                            isSelected
                                ? "ring-2 ring-primary ring-offset-2 scale-95 opacity-100"
                                : "opacity-90 hover:opacity-100 hover:scale-[1.02] border-transparent",
                            isMax && "grayscale opacity-40 cursor-not-allowed"
                        )}
                        style={{
                            backgroundColor: item.background_color_hex,
                            color: item.text_color_hex,
                            borderColor: isSelected ? 'white' : 'transparent'
                        }}
                    >
                        {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-white/20 backdrop-blur-md p-1 rounded-full border border-white/30 z-10">
                                <Check className="w-2.5 h-2.5" style={{ color: item.text_color_hex }} />
                            </div>
                        )}
                        <span className="text-lg font-bold leading-tight text-center">
                            {item.displayName}
                        </span>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </button>
                );
            })}
        </div>
    );
}
