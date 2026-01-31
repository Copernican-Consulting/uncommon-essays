import { NextRequest, NextResponse } from 'next/server';
import { parseFile } from '@/lib/parser';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const text = await parseFile(buffer, file.type);

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error('Parse error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
