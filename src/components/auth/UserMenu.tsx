'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User, Coins } from 'lucide-react'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function UserMenu() {
    const { user, signOut } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [credits, setCredits] = useState<number | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useOnClickOutside(menuRef, () => setIsOpen(false))

    useEffect(() => {
        if (user) {
            fetchCredits()
        }
    }, [user])

    const fetchCredits = async () => {
        const { data, error } = await supabase
            .from('user_credits')
            .select('credits_remaining')
            .eq('user_id', user?.id)
            .single()

        if (data) {
            setCredits(data.credits_remaining)
        }
    }

    if (!user) return null

    const getInitials = () => {
        if (user.user_metadata?.full_name) {
            return user.user_metadata.full_name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        return user.email?.slice(0, 2).toUpperCase() || 'U'
    }

    const handleSignOut = async () => {
        await signOut()
        setIsOpen(false)
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium text-sm">
                    {getInitials()}
                </div>
                <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-slate-900">
                        {user.user_metadata?.full_name || user.email}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        <span>{credits !== null ? `${credits} credits` : 'Loading...'}</span>
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-200">
                        <div className="font-medium text-slate-900">{user.user_metadata?.full_name || 'User'}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                    </div>

                    <div className="px-4 py-3 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Daily Credits</span>
                            <div className="flex items-center gap-1 font-medium text-primary">
                                <Coins className="w-4 h-4" />
                                <span>{credits ?? '...'}</span>
                            </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            Resets daily at midnight
                        </div>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    )
}
