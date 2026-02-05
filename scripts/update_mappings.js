const fs = require('fs');
const path = require('path');

const TOP_30_MAPPING = {
    "Princeton University": "Princeton",
    "Massachusetts Institute of Technology (MIT)": "MIT",
    "Harvard University": "Harvard",
    "Stanford University": "Stanford",
    "Yale University": "Yale",
    "University of Chicago": "University of Chicago",
    "Duke University": "Duke",
    "Johns Hopkins University": "Johns Hopkins",
    "Northwestern University": "Northwestern",
    "University of Pennsylvania": "University of Pennsylvania",
    "California Institute of Technology (Caltech)": "Caltech",
    "Cornell University": "Cornell",
    "Brown University": "Brown",
    "Dartmouth College": "Dartmouth",
    "Columbia University": "Columbia",
    "University of California, Berkeley": "UC Berkeley",
    "Rice University": "Rice",
    "University of California, Los Angeles (UCLA)": "UCLA",
    "Vanderbilt University": "Vanderbilt",
    "Carnegie Mellon University": "Carnegie Mellon (CMU)",
    "University of Michigan": "University of Michigan",
    "University of Notre Dame": "University of Notre Dame",
    "Washington University in St. Louis": "Washington University in St. Louis (WashU)",
    "Emory University": "Emory",
    "Georgetown University": "Georgetown",
    "University of North Carolina at Chapel Hill": "UNC Chapel Hill",
    "University of Virginia": "University of Virginia (UVA)",
    "University of Southern California (USC)": "USC",
    "University of California, San Diego (UC San Diego)": "UC San Diego (UCSD)",
    "University of Florida": "University of Florida (UF)"
};

const allSchoolsPath = 'src/lib/data/all_schools_list.json';
let allSchoolsList = JSON.parse(fs.readFileSync(allSchoolsPath, 'utf8'));

Object.entries(TOP_30_MAPPING).forEach(([fullName, activeName]) => {
    let school = allSchoolsList.find(s => s.name === fullName);
    if (school) {
        school.activeName = activeName;
        school.isActive = true;
    } else {
        // Try searching by a cleaner name if not found exactly
        const cleanFullName = fullName.replace(/\s*\(.*?\)\s*$/, '').trim();
        school = allSchoolsList.find(s => s.name === cleanFullName);

        if (school) {
            school.activeName = activeName;
            school.isActive = true;
            console.log(`Updated (fuzzy match): ${fullName} -> ${school.name}`);
        } else {
            // Add if completely missing
            allSchoolsList.push({
                name: fullName,
                isActive: true,
                activeName: activeName
            });
            console.log(`ADDED MISSING: ${fullName}`);
        }
    }
});

// Sort to keep it clean
allSchoolsList.sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(allSchoolsPath, JSON.stringify(allSchoolsList, null, 2));
console.log('Update complete.');
