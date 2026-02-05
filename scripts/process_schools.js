const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'common_app_schools_clean_alphabetized.csv');
const activeSchoolsPath = path.join(__dirname, '..', 'src', 'lib', 'data', 'schools.json');
const outputPath = path.join(__dirname, '..', 'src', 'lib', 'data', 'all_schools_list.json');

try {
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const activeSchools = JSON.parse(fs.readFileSync(activeSchoolsPath, 'utf8'));
    const normalize = (n) => n.toLowerCase()
        .replace(/^the\s+/, '')
        .replace(/\s*\(.*?\)\s*$/, '')
        .replace(/ university$/, '')
        .replace(/ college$/, '')
        .trim();

    const activeMap = new Map();
    activeSchools.forEach(s => {
        activeMap.set(normalize(s.name), s.name);
    });

    const lines = csvData.split(/\r?\n/);
    const schools = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const name = lines[i].trim();
        if (!name) continue;

        const normalizedName = normalize(name);
        const matchedActiveName = activeMap.get(normalizedName);

        schools.push({
            name: name,
            isActive: !!matchedActiveName,
            activeName: matchedActiveName
        });
    }

    fs.writeFileSync(outputPath, JSON.stringify(schools, null, 2));
    console.log(`Processed ${schools.length} schools to ${outputPath}`);
} catch (err) {
    console.error('Error processing schools:', err);
    process.exit(1);
}
