'use client'

import { useState } from 'react'
import { X, Coins, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreditModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: (newTotal: number) => void
}

export default function CreditModal({ isOpen, onClose, onSuccess }: CreditModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    if (!isOpen) return null

    const handleAddCredits = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/credits/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 20 }),
            })

            const data = await response.json()

            if (data.success) {
                setSuccess(true)
                if (onSuccess) onSuccess(data.newTotal)
                setTimeout(() => {
                    onClose()
                    setSuccess(false)
                }, 2000)
            } else {
                setError(data.error || 'Failed to add credits')
            }
        } catch (err: any) {
            setError('A network error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 overflow-hidden">
                {/* Background Sparkle Effect */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors z-10"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                <div className="relative z-10">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                        <Coins className="w-6 h-6 text-primary" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Need more credits?
                    </h2>
                    <p className="text-slate-600 mb-8">
                        Add more credits to your account to continue simulating admissions committees.
                    </p>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Sparkles className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Credits Added!</h3>
                            <p className="text-slate-500">Your balance has been updated.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 border-2 border-primary/20 bg-primary/5 rounded-xl flex items-center justify-between group hover:border-primary/40 transition-all">
                                <div>
                                    <h4 className="font-bold text-slate-900">20 Bonus Credits</h4>
                                    <p className="text-sm text-slate-500 italic">Free (for now)</p>
                                </div>
                                <button
                                    onClick={handleAddCredits}
                                    disabled={loading}
                                    className="px-4 py-2 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Get Credits
                                </button>
                            </div>

                            <p className="text-center text-[11px] text-slate-400 uppercase tracking-widest font-bold pt-4">
                                Premium Refills Coming Soon
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
