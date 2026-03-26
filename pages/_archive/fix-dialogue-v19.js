/**
 * Script to fix dialogue #19 and create v23
 * Fixes all deadlock issues by converting intermediate paths to reject_*_final
 */

const fs = require('fs');
const path = require('path');

// Read v19 file
let v19Content = fs.readFileSync(path.join(__dirname, 'scenarios-data-v19.js'), 'utf8');

// Create v23 content by replacing v19 references
let v23Content = v19Content
    .replace(/DIALOGUE #19/g, 'DIALOGUE #23')
    .replace(/scenario19/g, 'scenario23')
    .replace(/scenarios-data-v19/g, 'scenarios-data-v23')
    .replace(/id: 19,/g, 'id: 23,')
    .replace(/Scenario 19/g, 'Scenario 23');

// Fix all path references in suggestions
// Replace "weak" with "reject_weak_final"
v23Content = v23Content.replace(/path: "weak"/g, 'path: "reject_weak_final"');

// Replace "warning" with "reject_attitude_final"
v23Content = v23Content.replace(/path: "warning"/g, 'path: "reject_attitude_final"');

// Add _final suffix to all reject paths that don't have it (if any exist in v19)
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
    'reject_fragile',
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
    v23Content = v23Content.replace(regex1, `path: "${pathName}_final"`);

    // Replace path definitions in paths object (only if not already _final)
    const regex2 = new RegExp(`\\b${pathName}:\\s*\\[`, 'g');
    v23Content = v23Content.replace(regex2, `${pathName}_final: [`);
});

// Remove intermediate "weak" and "warning" paths
// Find and remove the "weak:" path definition
const weakPathRegex = /weak:\s*\[[\s\S]*?\],\s*(?=\n\s*(weak_success|warning|reject_))/;
v23Content = v23Content.replace(weakPathRegex, '');

// Find and remove the "weak_success:" path definition
const weakSuccessPathRegex = /weak_success:\s*\[[\s\S]*?\],\s*(?=\n\s*(warning|reject_))/;
v23Content = v23Content.replace(weakSuccessPathRegex, '');

// Find and remove the "warning:" path definition
const warningPathRegex = /warning:\s*\[[\s\S]*?\],\s*(?=\n\s*reject_)/;
v23Content = v23Content.replace(warningPathRegex, '');

// Add comment about fix
const headerComment = `// DIALOGUE #23 - Dry Van Furniture (FIXED VERSION - NO DEADLOCKS!)
// Miami FL → New York NY
// FIXED: All weak/aggressive/fail answers lead DIRECTLY to reject_*_final paths!
// NO INTERMEDIATE PATHS - NO DEADLOCKS!`;

v23Content = v23Content.replace(/\/\/ DIALOGUE #23[\s\S]*?(?=\n\nconsole\.log)/, headerComment);

// Write v23 file
fs.writeFileSync(path.join(__dirname, 'scenarios-data-v23.js'), v23Content, 'utf8');

console.log('✅ Created scenarios-data-v23.js');
console.log('✅ Fixed all path references');
console.log('✅ Removed intermediate "weak", "weak_success", and "warning" paths');
console.log('✅ Added "_final" suffix to all reject paths');
console.log('\nNow validating v23...\n');

// Validate v23
const validationCode = fs.readFileSync(path.join(__dirname, 'validate-dialogue.js'), 'utf8');
eval(validationCode);

const allScenarios = [];
eval(v23Content);
const scenario23 = allScenarios[0];

const result = validateDialogue(scenario23);

console.log('VALIDATION RESULT:');
console.log('Valid:', result.valid);
console.log('Errors:', result.errors.length);

if (result.errors.length > 0) {
    console.log('\nERRORS FOUND:');
    result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
    });
} else {
    console.log('\n✅ SUCCESS! Dialogue #23 has NO DEADLOCKS!');
}
