"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntakeFormProps {
    onTextUpdate: (text: string) => void;
}

export function IntakeForm({ onTextUpdate }: IntakeFormProps) {
    const [text, setText] = useState("");
    const [fileName, setFileName] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setFileName(file.name);
        setIsParsing(true);

        const formData = new FormData();
        formData.append('file', file);

        // We'll create a simple API route for file parsing to keep secrets server-side if needed,
        // though mammoth/pdf-parse run fine in edge/server.
        try {
            const response = await fetch('/api/parse', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setText(data.text);
            onTextUpdate(data.text);
        } catch (error) {
            console.error("Parsing error:", error);
        } finally {
            setIsParsing(false);
        }
    }, [onTextUpdate]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc'],
            'text/plain': ['.txt'],
            'application/pdf': ['.pdf'],
        },
        multiple: false
    });

    return (
        <div className="space-y-4">
            {!text ? (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center text-center",
                        isDragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                        <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium text-slate-700">Drag & drop your essay</p>
                    <p className="text-sm text-slate-500 mt-1 mb-4">Accepts Word, PDF, or Plain Text</p>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setText(" "); // Space to trigger the textarea view
                        }}
                        className="text-primary font-medium hover:underline"
                    >
                        or paste essay manually
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <textarea
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            onTextUpdate(e.target.value);
                        }}
                        className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-sans leading-relaxed text-slate-700"
                        placeholder="Paste your essay here or edit the uploaded text..."
                    />
                    <button
                        onClick={() => {
                            setText("");
                            setFileName(null);
                            onTextUpdate("");
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-500 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    {fileName && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                            <FileText className="w-3 h-3" />
                            {fileName}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
