import { createClient } from '@supabase/supabase-js'

// Using the service role key for server-side credit management
// This bypasses RLS to allow our API to manage credits
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
)

const DAILY_CREDIT_LIMIT = 5

export async function getUserCredits(userId: string) {
    // Try to get existing credits
    let { data, error } = await supabaseAdmin
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error && error.code === 'PGRST116') {
        // No record found, create one
        const { data: newData, error: insertError } = await supabaseAdmin
            .from('user_credits')
            .insert({
                user_id: userId,
                credits_remaining: DAILY_CREDIT_LIMIT,
                last_grant_date: new Date().toISOString().split('T')[0]
            })
            .select()
            .single()

        if (insertError) throw insertError
        return newData
    }

    if (error) throw error

    // Check if we need to grant daily credits
    const today = new Date().toISOString().split('T')[0]
    if (data.last_grant_date !== today) {
        const { data: updatedData, error: updateError } = await supabaseAdmin
            .from('user_credits')
            .update({
                credits_remaining: DAILY_CREDIT_LIMIT,
                last_grant_date: today
            })
            .eq('user_id', userId)
            .select()
            .single()

        if (updateError) throw updateError
        return updatedData
    }

    return data
}

export async function deductCredit(userId: string) {
    const credits = await getUserCredits(userId)

    if (credits.credits_remaining <= 0) {
        throw new Error('Insufficient credits')
    }

    const { error } = await supabaseAdmin
        .from('user_credits')
        .update({
            credits_remaining: credits.credits_remaining - 1,
            total_credits_used: credits.total_credits_used + 1
        })
        .eq('user_id', userId)

    if (error) throw error
    return true
}
