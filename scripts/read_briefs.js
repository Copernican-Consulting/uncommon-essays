const mammoth = require('mammoth');
const fs = require('fs');

async function extractText(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        console.log(`--- START ${filePath} ---`);
        console.log(result.value);
        console.log(`--- END ${filePath} ---`);
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err);
    }
}

// Map files to extract
const files = [
    'DesignBrief Common App App MVP V2.docx',
    'DesignBrief Common App App MVP.docx',
    'TopCollegeCriteria.docx'
];

(async () => {
    for (const file of files) {
        await extractText(file);
    }
})();
