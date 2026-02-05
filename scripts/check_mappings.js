const fs = require('fs');
const path = require('path');

const schoolColors = JSON.parse(fs.readFileSync('SchoolColors.json', 'utf8'));
const allSchoolsList = JSON.parse(fs.readFileSync('src/lib/data/all_schools_list.json', 'utf8'));

console.log('--- Missing Schools Audit ---');
schoolColors.forEach(s => {
    const found = allSchoolsList.find(m => m.name === s.school);
    if (!found) {
        console.log(`MISSING: ${s.school}`);
    } else if (!found.activeName) {
        console.log(`NO ACTIVE NAME: ${s.school}`);
    }
});
