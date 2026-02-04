"use client";

import { useState, useMemo, useRef } from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import schoolsData from '@/lib/data/schools.json';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface SchoolPickerProps {
    selected: string[];
    onChange: (selected: string[]) => void;
    max?: number;
}

export function SchoolPicker({ selected, onChange, max = 5 }: SchoolPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useOnClickOutside(ref, () => setIsOpen(false));

    const filteredSchools = useMemo(() => {
        return schoolsData.filter(school =>
            school.name.toLowerCase().includes(search.toLowerCase()) &&
            !selected.includes(school.name)
        );
    }, [search, selected]);

    const toggleSchool = (schoolName: string) => {
        if (selected.includes(schoolName)) {
            onChange(selected.filter(s => s !== schoolName));
        } else if (selected.length < max) {
            onChange([...selected, schoolName]);
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative" ref={ref}>
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-all"
                >
                    <span className="text-slate-500 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        {selected.length === 0 ? "Search for schools..." : `${selected.length} school(s) selected`}
                    </span>
                    <ChevronsUpDown className="w-4 h-4 text-slate-400" />
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-2 border-b border-slate-100">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Type to filter..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-slate-50 border-none focus:ring-0 rounded-lg"
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1">
                            {filteredSchools.length > 0 ? (
                                filteredSchools.map((school) => (
                                    <button
                                        key={school.name}
                                        onClick={() => {
                                            toggleSchool(school.name);
                                            setSearch("");
                                            if (selected.length + 1 >= max) setIsOpen(false);
                                        }}
                                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5 hover:text-primary rounded-lg transition-colors flex items-center justify-between group"
                                    >
                                        {school.name}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-slate-400">No schools found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {selected.map((schoolName) => (
                    <div
                        key={schoolName}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium animate-in slide-in-from-left-2 duration-200"
                    >
                        {schoolName}
                        <button
                            onClick={() => toggleSchool(schoolName)}
                            className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                {selected.length === 0 && (
                    <p className="text-sm text-slate-400 italic">No committees selected yet (maximum 5)</p>
                )}
            </div>
        </div>
    );
}
