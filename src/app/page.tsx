"use client";

import { useState } from 'react';
import { IntakeForm } from '@/components/IntakeForm';
import { SchoolPicker } from '@/components/SchoolPicker';
import { ReviewBoard } from '@/components/ReviewBoard';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [essayText, setEssayText] = useState("");
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o");
  const [showSettings, setShowSettings] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  const models = [
    { id: 'openai/gpt-4o', name: 'OpenAI GPT-4o' },
    { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'DeepSeek R1 Chimera (Free)' },
    { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B' }
  ];

  const handleSimulate = async () => {
    if (!essayText || selectedSchools.length === 0) return;

    setIsSimulating(true);
    setErrorDetails(null);
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essayText,
          schoolIds: selectedSchools,
          modelId: selectedModel
        }),
      });
      const data = await response.json();
      if (data.error) {
        setErrorDetails(data);
        setResults(null);
      } else {
        setResults(data.results);
        setErrorDetails(null);
      }
    } catch (error: any) {
      console.error(error);
      setErrorDetails({ error: "Network Error", details: error.message });
    } finally {
      setIsSimulating(false);
    }
  };

  if (results) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-slate-900">Uncommon Essays</h1>
          </header>
          <ReviewBoard
            essayText={essayText}
            results={results}
            onBack={() => setResults(null)}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto mt-12">
        <header className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-slate-400 hover:text-slate-600"
              >
                Settings
              </Button>
              {showSettings && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 z-50 text-left">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">AI Model Selection</h4>
                  <div className="space-y-2">
                    {models.map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m.id);
                          setShowSettings(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          selectedModel === m.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-slate-50 text-slate-600"
                        )}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <h1 className="text-5xl font-serif font-bold text-slate-900 mb-4">Uncommon Essays</h1>
          <p className="text-slate-600 text-lg">Get feedback from the admissions committees that matter most.</p>
        </header>

        <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">1. The Intake Studio</h2>
              <IntakeForm onTextUpdate={setEssayText} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Select Your Committees</h2>
              <SchoolPicker selected={selectedSchools} onChange={setSelectedSchools} max={5} />
            </div>

            <div className="pt-6">
              <Button
                onClick={handleSimulate}
                disabled={!essayText || selectedSchools.length === 0 || isSimulating}
                className="w-full py-8 text-xl font-semibold rounded-xl"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Simulating Committees...
                  </>
                ) : (
                  "Enter Committee Room"
                )}
              </Button>
            </div>

            {errorDetails && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-red-700 font-medium font-sans">Simulation Failed</p>
                  <button
                    onClick={() => setShowDebug(!showDebug)}
                    className="text-xs text-red-500 hover:text-red-700 underline font-mono"
                  >
                    {showDebug ? "Hide Debug" : "Show Debug"}
                  </button>
                </div>
                <p className="text-sm text-red-600 font-sans">{errorDetails.error}</p>
                {showDebug && (
                  <pre className="mt-4 p-4 bg-slate-900 text-slate-300 text-[10px] overflow-auto rounded-lg max-h-64 font-mono text-left">
                    {JSON.stringify(errorDetails, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
