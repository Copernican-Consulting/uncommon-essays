import mammoth from 'mammoth';

export async function parseFile(file: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
        const result = await mammoth.extractRawText({ buffer: file });
        return result.value;
    } else if (mimeType === 'text/plain') {
        return file.toString('utf-8');
    } else {
        throw new Error('Unsupported file type');
    }
}
