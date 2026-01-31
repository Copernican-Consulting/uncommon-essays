import mammoth from 'mammoth';

export async function parseFile(file: Buffer, mimeType: string): Promise<string> {
    console.log('Parsing file with mimeType:', mimeType);
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
        const result = await mammoth.extractRawText({ buffer: file });
        return result.value;
    } else if (mimeType === 'application/pdf') {
        try {
            const pdf = require('pdf-parse');
            const data = await pdf(file);
            return data.text;
        } catch (error) {
            console.error('PDF parsing error:', error);
            throw new Error('PDF parsing failed on server');
        }
    } else if (mimeType === 'text/plain') {
        return file.toString('utf-8');
    } else {
        console.error('Unsupported file type:', mimeType);
        throw new Error('Unsupported file type');
    }
}
