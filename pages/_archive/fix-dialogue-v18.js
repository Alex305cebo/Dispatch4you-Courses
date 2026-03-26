/**
 * Script to fix dialogue #18 and create v22
 * Fixes all deadlock issues by converting intermediate paths to reject_*_final
 */

const fs = require('fs');
const path = require('path');

// Read v18 file
let v18Content = fs.readFileSync(path.join(__dirname, 'scenarios-data-v18.js'), 'utf8');

// Create v22 content by replacing v18 references
let v22Content = v18Content
    .replace(/DIALOGUE #18/g, 'DIALOGUE #22')
    .replace(/scenario18/g, 'scenario22')
    .replace(/scenarios-data-v18/g, 'scenarios-data-v22')
    .replace(/id: 18,/g, 'id: 22,')
    .replace(/Scenario 18/g, 'Scenario 22');

// Fix all path references in suggestions
// Replace "weak" with "reject_weak_final"
v22Content = v22Content.replace(/path: "weak"/g, 'path: "reject_weak_final"');

// Replace "warning" with "reject_attitude_final"
v22Content = v22Content.replace(/path: "warning"/g, 'path: "reject_attitude_final"');

// Add _final suffix to all reject paths that don't have it (if any exist in v18)
const rejectPaths = [
    'reject_nomc',
    'reject_weak',
    'reject_attitude',
    'reject_timing',
    'reject_experience',
    'reject_insurance',
    'reject_communication',
    'reject_commitment',
    'reject_equipment',
    'reject_temperature',
    'reject_references',
    'reject_terms',
    'reject_fsc',
    'reject_backup',
    'reject_rate',
    'reject_ultimatum',
    'reject_email'
];

rejectPaths.forEach(pathName => {
    // Replace path references in suggestions (only if not already _final)
    const regex1 = new RegExp(`path: "${pathName}"(?!_final)`, 'g');
    v22Content = v22Content.replace(regex1, `path: "${pathName}_final"`);

    // Replace path definitions in paths object (only if not already _final)
    const regex2 = new RegExp(`\\b${pathName}:\\s*\\[`, 'g');
    v22Content = v22Content.replace(regex2, `${pathName}_final: [`);
});

// Remove intermediate "weak" and "warning" paths
// Find and remove the "weak:" path definition
const weakPathRegex = /weak:\s*\[[\s\S]*?\],\s*(?=\n\s*(weak_success|warning|reject_))/;
v22Content = v22Content.replace(weakPathRegex, '');

// Find and remove the "weak_success:" path definition
const weakSuccessPathRegex = /weak_success:\s*\[[\s\S]*?\],\s*(?=\n\s*(warning|reject_))/;
v22Content = v22Content.replace(weakSuccessPathRegex, '');

// Find and remove the "warning:" path definition
const warningPathRegex = /warning:\s*\[[\s\S]*?\],\s*(?=\n\s*reject_)/;
v22Content = v22Content.replace(warningPathRegex, '');

// Add comment about fix
const headerComment = `// DIALOGUE #22 - Reefer Produce (FIXED VERSION - NO DEADLOCKS!)
// Phoenix AZ → Seattle WA
// FIXED: All weak/aggressive/fail answers lead DIRECTLY to reject_*_final paths!
// NO INTERMEDIATE PATHS - NO DEADLOCKS!`;

v22Content = v22Content.replace(/\/\/ DIALOGUE #22[\s\S]*?(?=\n\nconsole\.log)/, headerComment);

// Write v22 file
fs.writeFileSync(path.join(__dirname, 'scenarios-data-v22.js'), v22Content, 'utf8');

console.log('✅ Created scenarios-data-v22.js');
console.log('✅ Fixed all path references');
console.log('✅ Removed intermediate "weak", "weak_success", and "warning" paths');
console.log('✅ Added "_final" suffix to all reject paths');
console.log('\nNow validating v22...\n');

// Validate v22
const validationCode = fs.readFileSync(path.join(__dirname, 'validate-dialogue.js'), 'utf8');
eval(validationCode);

const allScenarios = [];
eval(v22Content);
const scenario22 = allScenarios[0];

const result = validateDialogue(scenario22);

console.log('VALIDATION RESULT:');
console.log('Valid:', result.valid);
console.log('Errors:', result.errors.length);

if (result.errors.length > 0) {
    console.log('\nERRORS FOUND:');
    result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
    });
} else {
    console.log('\n✅ SUCCESS! Dialogue #22 has NO DEADLOCKS!');
}
