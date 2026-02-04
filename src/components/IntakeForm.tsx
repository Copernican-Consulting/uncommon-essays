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

    const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[]) => {
        console.log("onDrop triggered. Accepted:", acceptedFiles, "Rejected:", fileRejections);

        const file = acceptedFiles[0];
        if (!file) {
            if (fileRejections.length > 0) {
                alert(`File rejected: ${fileRejections[0].errors[0].message}`);
            }
            return;
        }

        setFileName(file.name);
        setIsParsing(true);

        try {
            let extractedText = "";

            // Handle PDF files client-side
            if (file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdfjsLib = await import('pdfjs-dist');

                // Set worker path
                pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const textParts: string[] = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    textParts.push(pageText);
                }

                extractedText = textParts.join('\n\n');
            } else {
                // For Word/Text files, use server-side parsing
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/parse', {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();

                if (!response.ok || data.error) {
                    throw new Error(data.error || "Failed to parse file");
                }

                extractedText = data.text;
            }

            setText(extractedText);
            onTextUpdate(extractedText);
        } catch (error: any) {
            console.error("Parsing error:", error);
            alert(`Error reading file: ${error.message}`);
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
            {isParsing ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-slate-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p className="text-lg font-medium text-slate-700">Reading your essay...</p>
                    <p className="text-sm text-slate-500">This may take a moment</p>
                </div>
            ) : !text ? (
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
                    {/* Debug info for file type */}
                    <p className="text-[10px] text-slate-400 mt-4">Debug: PDF/Docx/Txt supported</p>
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
