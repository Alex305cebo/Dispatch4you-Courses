/**
 * Test script to validate scenarios-data-v17.js, v18.js, v19.js
 * These files are expected to have deadlock issues
 */

// Load the validation utility
const fs = require('fs');
const path = require('path');

// Read and evaluate the validation utility
const validationCode = fs.readFileSync(path.join(__dirname, 'validate-dialogue.js'), 'utf8');
eval(validationCode);

// Test each scenario file
const scenarioFiles = ['v17', 'v18', 'v19'];

scenarioFiles.forEach(version => {
    console.log('\n' + '='.repeat(70));
    console.log(`TESTING scenarios-data-${version}.js`);
    console.log('='.repeat(70));

    try {
        // Define allScenarios array that the file expects
        const allScenarios = [];

        // Read and evaluate the scenario file
        const scenarioCode = fs.readFileSync(path.join(__dirname, `scenarios-data-${version}.js`), 'utf8');
        eval(scenarioCode);

        // Get the scenario from allScenarios array
        const scenario = allScenarios[0];

        if (!scenario) {
            console.log('❌ ERROR: No scenario found in file');
            return;
        }

        console.log(`\nDialogue ID: ${scenario.id}`);
        console.log(`Route: ${scenario.route}`);
        console.log(`Difficulty: ${scenario.difficulty}`);

        // Run validation
        const result = validateDialogue(scenario);

        console.log(`\nValidation Status: ${result.valid ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Total Errors: ${result.errors.length}`);

        if (result.errors.length > 0) {
            console.log('\nERRORS FOUND:');
            console.log('-'.repeat(70));
            result.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }

    } catch (error) {
        console.log(`\n❌ ERROR loading or validating file: ${error.message}`);
    }
});

console.log('\n' + '='.repeat(70));
console.log('VALIDATION COMPLETE');
console.log('='.repeat(70));
