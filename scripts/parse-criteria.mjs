import fs from 'fs';
import mammoth from 'mammoth';

async function parseCriteria() {
  const textContent = fs.readFileSync('TopColleges.txt', 'utf-8');
  const schools = {};

  // Simple parser for TopColleges.txt
  const blocks = textContent.split(/\d+\)/);
  blocks.forEach(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) return;

    const schoolName = lines[0];
    const data = {
      name: schoolName,
      must_hit_signals: [],
      common_failure_modes: [],
      tone_guidance: [],
      subject_matter_guidance: [],
      overall_guidance: ""
    };

    let currentSection = "";
    lines.slice(1).forEach(line => {
      const lower = line.toLowerCase();
      if (lower.includes("must-hit signals")) currentSection = "must_hit_signals";
      else if (lower.includes("common failure modes")) currentSection = "common_failure_modes";
      else if (lower.includes("tone guidance")) currentSection = "tone_guidance";
      else if (lower.includes("subject matter guidance")) currentSection = "subject_matter_guidance";
      else if (lower.includes("overall guidance")) currentSection = "overall_guidance";
      else if (currentSection) {
        if (currentSection === "overall_guidance") {
          data[currentSection] += line + " ";
        } else {
          data[currentSection].push(line);
        }
      }
    });
    
    data.overall_guidance = data.overall_guidance.trim();
    schools[schoolName.toLowerCase()] = data;
  });

  // Supplement with info from docx if possible
  try {
    const docxResult = await mammoth.extractRawText({ path: 'TopCollegeCriteria.docx' });
    console.log("Extracted from docx successfully");
    // We can add logic here if docx has different structure, but for now let's stick to the text version as it's cleaner
  } catch (err) {
    console.error("Error reading docx:", err);
  }

  fs.writeFileSync('lib/data/schools.json', JSON.stringify(Object.values(schools), null, 2));
  console.log(`Parsed ${Object.keys(schools).length} schools.`);
}

parseCriteria();
