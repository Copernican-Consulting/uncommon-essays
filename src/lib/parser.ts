import mammoth from 'mammoth';

export async function parseFile(file: Buffer, mimeType: string): Promise<string> {
    console.log(`Parsing file: Size=${file.length} bytes, MimeType=${mimeType}`);
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
        const result = await mammoth.extractRawText({ buffer: file });
        return result.value;
    } else if (mimeType === 'application/pdf') {
        try {
            // Polyfill Promise.withResolvers if missing (Node < 22)
            // @ts-ignore
            if (typeof Promise.withResolvers === 'undefined') {
                // @ts-ignore
                Promise.withResolvers = function () {
                    let resolve, reject;
                    const promise = new Promise((res, rej) => {
                        resolve = res;
                        reject = rej;
                    });
                    return { promise, resolve, reject };
                };
            }

            // Polyfill DOMMatrix for pdf-parse in Node environment
            // @ts-ignore
            if (!global.DOMMatrix) {
                // @ts-ignore
                global.DOMMatrix = class DOMMatrix {
                    constructor() { return this; }
                    toFloat32Array() { return [1, 0, 0, 1, 0, 0]; }
                    translate() { return this; }
                    scale() { return this; }
                };
            }

            // Lazy load pdf-parse strictly inside the function
            // @ts-ignore
            const pdfModule = await import('pdf-parse');

            console.error('PDF Module Loaded Keys:', Object.keys(pdfModule));
            console.error('PDF Module.default type:', typeof pdfModule.default);

            // Try multiple export patterns
            let pdf = pdfModule.default || pdfModule.parse || pdfModule;

            // If still an object, dig deeper
            if (typeof pdf === 'object' && pdf !== null) {
                console.error('PDF is object. Keys:', Object.keys(pdf));
                // Check for nested default
                if (typeof pdf.default === 'function') {
                    pdf = pdf.default;
                } else if (typeof pdf.parse === 'function') {
                    pdf = pdf.parse;
                }
            }

            // Final validation
            if (typeof pdf !== 'function') {
                const structure = {
                    moduleKeys: Object.keys(pdfModule),
                    defaultType: typeof pdfModule.default,
                    pdfType: typeof pdf
                };
                throw new Error(`PDF Library Import Failed. Structure: ${JSON.stringify(structure)}`);
            }

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
