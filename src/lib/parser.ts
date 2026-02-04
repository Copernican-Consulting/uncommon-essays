import mammoth from 'mammoth';

export async function parseFile(file: Buffer, mimeType: string): Promise<string> {
    console.log('Parsing file with mimeType:', mimeType);
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
        const result = await mammoth.extractRawText({ buffer: file });
        return result.value;
    } else if (mimeType === 'application/pdf') {
        try {
            // Lazy load pdf-parse strictly inside the function
            // This prevents server crashes if pdf-parse has top-level DOM dependency issues
            // @ts-ignore
            const pdf = require('pdf-parse');
            const data = await pdf(file);
            return data.text;
        } catch (error: any) {
            console.error('PDF parsing error:', error);
            // Handle specific DOMMatrix error which is common with pdf-parse in some node environments
            if (error.message?.includes('DOMMatrix')) {
                throw new Error('PDF Parse internal error: DOMMatrix. This is a server environment issue.');
            }
            throw new Error(`PDF parsing failed: ${error.message}`);
        }
    } else if (mimeType === 'text/plain') {
        return file.toString('utf-8');
    } else {
        console.error('Unsupported file type:', mimeType);
        throw new Error('Unsupported file type');
    }
}
