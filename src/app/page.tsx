"use client";

import { useState, useRef } from 'react';
import { IntakeForm } from '@/components/IntakeForm';
import { SchoolPicker } from '@/components/SchoolPicker';
import { SchoolGrid } from '@/components/SchoolGrid';
import { ReviewBoard } from '@/components/ReviewBoard';
import { Button } from '@/components/ui/Button';
import { Loader2, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import UserMenu from '@/components/auth/UserMenu';
import CreditModal from '@/components/auth/CreditModal';

export default function Home() {
  const { user, loading } = useAuth();
  const [essayText, setEssayText] = useState("");
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o");
  const [selectedTone, setSelectedTone] = useState("");
  const [scoringModel, setScoringModel] = useState("standard");
  const [forceActionable, setForceActionable] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditRefreshKey, setCreditRefreshKey] = useState(0);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(settingsRef, () => setShowSettings(false));

  const models = [
    { id: 'openai/gpt-4o', name: 'OpenAI GPT-4o' },
    { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'DeepSeek R1 Chimera (Free)' },
    { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B' }
  ];

  const handleSimulate = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
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
          modelId: selectedModel,
          tone: selectedTone,
          scoringModel: scoringModel,
          forceActionable: forceActionable
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

  const handleRetry = async (schoolName: string) => {
    if (!user) return;

    // Set status to analyzing for this school
    setResults((prev: any) => prev.map((r: any) =>
      r.schoolName === schoolName ? { ...r, status: 'loading' } : r
    ));

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essayText,
          schoolIds: [schoolName],
          modelId: selectedModel,
          tone: selectedTone,
          scoringModel: scoringModel,
          forceActionable: forceActionable,
          isRetry: true // Bypass credit deduction
        }),
      });

      const data = await response.json();
      if (data.results && data.results[0]) {
        setResults((prev: any) => prev.map((r: any) =>
          r.schoolName === schoolName ? data.results[0] : r
        ));
      }
    } catch (error) {
      console.error('Retry failed:', error);
      setResults((prev: any) => prev.map((r: any) =>
        r.schoolName === schoolName ? { ...r, status: 'error', error: 'Retry failed' } : r
      ));
    }
  };

  const Header = () => (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-[100] h-16">
      <div className="max-w-7xl mx-auto h-full px-8 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setResults(null)}>
          <span className="text-xl font-serif font-bold text-slate-900">Uncommon Essays</span>
          <span className="text-xs font-sans font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Beta</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={settingsRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-500 hover:text-slate-700 font-medium"
            >
              Settings
            </Button>
            {showSettings && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 z-50 text-left">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">AI Model Selection</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {models.map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m.id);
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

                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Feedback Tone</h4>
                    <select
                      value={selectedTone}
                      onChange={(e) => setSelectedTone(e.target.value)}
                      className="w-full p-2 text-sm border-slate-200 rounded-lg text-slate-600 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Neutral (Default)</option>
                      <option value="Blunt, direct, and brutally honest">Blunt & Brutally Honest</option>
                      <option value="Honest but supportive and encouraging">Supportive & Encouraging</option>
                      <option value="Honest, sharp, and delivered with humor">Humorous & Witty</option>
                    </select>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Actionable Feedback</h4>
                        <p className="text-[10px] text-slate-400">Force concrete next steps</p>
                      </div>
                      <button
                        onClick={() => setForceActionable(!forceActionable)}
                        className={cn(
                          "w-10 h-5 rounded-full transition-colors relative",
                          forceActionable ? "bg-primary" : "bg-slate-200"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                          forceActionable ? "left-6" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-slate-200" />

          {user ? (
            <UserMenu
              onOpenCredits={() => setIsCreditModalOpen(true)}
              refreshKey={creditRefreshKey}
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLoginModalOpen(true)}
              className="text-slate-600 font-medium flex items-center gap-2 hover:bg-slate-50"
              disabled={loading}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );

  if (results) {
    return (
      <main className="min-h-screen bg-slate-50 pt-24 p-8">
        <Header />
        <div className="max-w-7xl mx-auto">
          <ReviewBoard
            essayText={essayText}
            results={results}
            onBack={() => setResults(null)}
            onRetry={handleRetry}
          />
        </div>
        <CreditModal
          isOpen={isCreditModalOpen}
          onClose={() => setIsCreditModalOpen(false)}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24 p-8">
      <Header />
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold text-slate-900 mb-4">Uncommon Essays <span className="text-2xl font-sans font-medium text-slate-400 align-middle ml-2">(Beta)</span></h1>
          <p className="text-slate-600 text-lg">Get feedback from the admissions committees that matter most.</p>
        </header>

        <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Upload Your Essay</h2>
              <IntakeForm onTextUpdate={setEssayText} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">2. Select Your Committees</h2>
                <span className="text-sm text-slate-400">{selectedSchools.length} / 5 Selected</span>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Top Schools (Quick Pick)</h3>
                  <SchoolGrid
                    selected={selectedSchools}
                    onSelect={(school) => {
                      if (selectedSchools.includes(school)) {
                        setSelectedSchools(selectedSchools.filter(s => s !== school));
                      } else if (selectedSchools.length < 5) {
                        setSelectedSchools([...selectedSchools, school]);
                      }
                    }}
                  />
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Other Schools</h3>
                  <SchoolPicker selected={selectedSchools} onChange={setSelectedSchools} max={5} />
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-4">
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
                  "Analyze My Essays"
                )}
              </Button>

              {isSimulating && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">Committee Status</p>
                  <div className="space-y-2">
                    {selectedSchools.map(school => {
                      // If results contains this school, it's done.
                      const isDone = results?.some((r: any) => r.schoolName === school);
                      return (
                        <div key={school} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">{school}</span>
                          {isDone ? (
                            <span className="text-green-600 font-medium flex items-center gap-1">
                              Completed
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" /> Analyzing
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {errorDetails && (
              <div className={cn(
                "mt-8 p-4 rounded-xl border",
                errorDetails.error === "Insufficient credits"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"
              )}>
                <div className="flex justify-between items-start mb-2">
                  <p className={cn(
                    "font-medium font-sans",
                    errorDetails.error === "Insufficient credits" ? "text-amber-700" : "text-red-700"
                  )}>
                    {errorDetails.error === "Insufficient credits" ? "Out of Credits" : "Simulation Failed"}
                  </p>
                  <button
                    onClick={() => setShowDebug(!showDebug)}
                    className={cn(
                      "text-xs underline font-mono",
                      errorDetails.error === "Insufficient credits" ? "text-amber-500 hover:text-amber-700" : "text-red-500 hover:text-red-700"
                    )}
                  >
                    {showDebug ? "Hide Debug" : "Show Debug"}
                  </button>
                </div>
                <div className={cn(
                  "text-sm font-sans",
                  errorDetails.error === "Insufficient credits" ? "text-amber-600" : "text-red-600"
                )}>
                  {errorDetails.error === "Insufficient credits" ? (
                    <div className="flex items-center justify-between">
                      <span>{errorDetails.message || "You don't have enough credits for this simulation."}</span>
                      <button
                        onClick={() => setIsCreditModalOpen(true)}
                        className="text-amber-800 font-bold hover:underline"
                      >
                        Refill Credits →
                      </button>
                    </div>
                  ) : (
                    errorDetails.message || errorDetails.error
                  )}
                </div>
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

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <CreditModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        onSuccess={() => setCreditRefreshKey(prev => prev + 1)}
      />
    </main>
  );
}
