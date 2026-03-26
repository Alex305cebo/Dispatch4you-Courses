/**
 * Script to fix dialogue #17 and create v21
 * Fixes all deadlock issues by converting intermediate paths to reject_*_final
 */

const fs = require('fs');
const path = require('path');

// Read v17 file
let v17Content = fs.readFileSync(path.join(__dirname, 'scenarios-data-v17.js'), 'utf8');

// Create v21 content by replacing v17 references
let v21Content = v17Content
    .replace(/DIALOGUE #17/g, 'DIALOGUE #21')
    .replace(/scenario17/g, 'scenario21')
    .replace(/scenarios-data-v17/g, 'scenarios-data-v21')
    .replace(/id: 17,/g, 'id: 21,')
    .replace(/Scenario 17/g, 'Scenario 21');

// Fix all path references in suggestions
// Replace "weak" with "reject_weak_final"
v21Content = v21Content.replace(/path: "weak"/g, 'path: "reject_weak_final"');

// Replace "warning" with "reject_attitude_final"
v21Content = v21Content.replace(/path: "warning"/g, 'path: "reject_attitude_final"');

// Add _final suffix to all reject paths that don't have it
const rejectPaths = [
    'reject_early',
    'reject_weak',
    'reject_attitude',
    'reject_timing',
    'reject_experience',
    'reject_insurance',
    'reject_communication',
    'reject_commitment',
    'reject_equipment',
    'reject_security',
    'reject_references',
    'reject_terms',
    'reject_fsc',
    'reject_backup',
    'reject_rate',
    'reject_ultimatum',
    'reject_email'
];

rejectPaths.forEach(pathName => {
    // Replace path references in suggestions
    const regex1 = new RegExp(`path: "${pathName}"`, 'g');
    v21Content = v21Content.replace(regex1, `path: "${pathName}_final"`);

    // Replace path definitions in paths object
    const regex2 = new RegExp(`\\b${pathName}:\\s*\\[`, 'g');
    v21Content = v21Content.replace(regex2, `${pathName}_final: [`);
});

// Remove intermediate "weak" and "warning" paths
// Find and remove the "weak:" path definition
const weakPathRegex = /weak:\s*\[[\s\S]*?\],\s*(?=\n\s*(weak_success|warning|reject_))/;
v21Content = v21Content.replace(weakPathRegex, '');

// Find and remove the "weak_success:" path definition
const weakSuccessPathRegex = /weak_success:\s*\[[\s\S]*?\],\s*(?=\n\s*(warning|reject_))/;
v21Content = v21Content.replace(weakSuccessPathRegex, '');

// Find and remove the "warning:" path definition
const warningPathRegex = /warning:\s*\[[\s\S]*?\],\s*(?=\n\s*reject_)/;
v21Content = v21Content.replace(warningPathRegex, '');

// Add comment about fix
const headerComment = `// DIALOGUE #21 - Dry Van Electronics (FIXED VERSION - NO DEADLOCKS!)
// Los Angeles CA → Dallas TX, 1,390 miles
// Posted: $2,800 ($2.01/mile), Target: $3,100-3,300
// Created: March 8, 2026
// FIXED: All weak/aggressive/fail answers lead DIRECTLY to reject_*_final paths!
// NO INTERMEDIATE PATHS - NO DEADLOCKS!`;

v21Content = v21Content.replace(/\/\/ DIALOGUE #21[\s\S]*?Created: March 8, 2026/, headerComment);

// Write v21 file
fs.writeFileSync(path.join(__dirname, 'scenarios-data-v21.js'), v21Content, 'utf8');

console.log('✅ Created scenarios-data-v21.js');
console.log('✅ Fixed all path references');
console.log('✅ Removed intermediate "weak", "weak_success", and "warning" paths');
console.log('✅ Added "_final" suffix to all reject paths');
console.log('\nNow validating v21...\n');

// Validate v21
const validationCode = fs.readFileSync(path.join(__dirname, 'validate-dialogue.js'), 'utf8');
eval(validationCode);

const allScenarios = [];
eval(v21Content);
const scenario21 = allScenarios[0];

const result = validateDialogue(scenario21);

console.log('VALIDATION RESULT:');
console.log('Valid:', result.valid);
console.log('Errors:', result.errors.length);

if (result.errors.length > 0) {
    console.log('\nERRORS FOUND:');
    result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
    });
} else {
    console.log('\n✅ SUCCESS! Dialogue #21 has NO DEADLOCKS!');
}
