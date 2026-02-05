import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { addCredits } from '@/lib/credits';

export async function POST(request: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { amount } = await request.json();
        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const updatedData = await addCredits(user.id, amount);
        return NextResponse.json({ success: true, newTotal: updatedData.credits_remaining });
    } catch (error: any) {
        console.error('Error adding credits:', error);
        return NextResponse.json({ error: error.message || 'Failed to update credits' }, { status: 500 });
    }
}
