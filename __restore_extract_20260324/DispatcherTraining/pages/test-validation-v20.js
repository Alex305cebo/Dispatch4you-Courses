/**
 * Test script to validate scenarios-data-v20.js
 * This file is known to be correct, so validation should pass
 */

// Load the validation utility
const fs = require('fs');
const path = require('path');

// Read and evaluate the validation utility
const validationCode = fs.readFileSync(path.join(__dirname, 'validate-dialogue.js'), 'utf8');
eval(validationCode);

// Read and evaluate the scenarios-data-v20.js file
// Define allScenarios array that the file expects
const allScenarios = [];
let scenario20;
const v20Code = fs.readFileSync(path.join(__dirname, 'scenarios-data-v20.js'), 'utf8');
eval(v20Code);

// Get scenario20 from allScenarios array
scenario20 = allScenarios[0];

// Test validation on scenario20
console.log('Testing validation on scenarios-data-v20.js...\n');

const result = validateDialogue(scenario20);

console.log('Validation Result:');
console.log('Valid:', result.valid);
console.log('Errors:', result.errors.length);

if (result.errors.length > 0) {
    console.log('\nErrors found:');
    result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
    });
} else {
    console.log('\n✅ SUCCESS: scenarios-data-v20.js passed validation!');
    console.log('This confirms the validation utility is working correctly.');
}

// Generate full report
console.log('\n' + generateValidationReport(scenario20));
