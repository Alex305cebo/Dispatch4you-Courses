/**
 * Dialogue Validation Utility
 * 
 * This utility validates dialogue structure to prevent deadlocks.
 * A deadlock occurs when a dispatcher selects a weak answer (variants 4-6)
 * and gets redirected to an intermediate reject path instead of a final outcome.
 * 
 * RULES:
 * 1. Only two path types: "master" (multi-step) and "reject_*_final" (single outcome)
 * 2. Variants 1-3 (excellent/good/normal) must lead to "master"
 * 3. Variants 4-6 (weak/aggressive/fail) must lead to "reject_*_final"
 * 4. All reject paths must have "_final" suffix (except master)
 * 5. All reject_*_final paths must contain exactly 1 element with outcome
 * 6. Master path should have 15-17 steps
 */

/**
 * Validates a dialogue scenario structure
 * @param {Object} scenario - The dialogue scenario object
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateDialogue(scenario) {
    const errors = [];

    // Check 1: Scenario has paths object
    if (!scenario.paths) {
        errors.push("ERROR: Missing 'paths' object in scenario");
        return { valid: false, errors };
    }

    // Check 2: Master path exists
    if (!scenario.paths.master) {
        errors.push("ERROR: Missing 'master' path");
    }

    // Check 3: Master path has 15-17 steps
    if (scenario.paths.master) {
        const masterLength = scenario.paths.master.length;
        if (masterLength < 15 || masterLength > 17) {
            errors.push(`ERROR: Master path has ${masterLength} steps, expected 15-17`);
        }
    }

    // Check 4: All suggestions in master lead to existing paths
    if (scenario.paths.master) {
        scenario.paths.master.forEach((step, stepIndex) => {
            // Skip final outcome steps (they don't have suggestions)
            if (step.outcome) {
                return;
            }

            if (!step.suggestions) {
                errors.push(`ERROR: Step ${stepIndex + 1} missing 'suggestions' array`);
                return;
            }

            step.suggestions.forEach((suggestion, suggIndex) => {
                if (!suggestion.path) {
                    errors.push(`ERROR: Step ${stepIndex + 1}, suggestion ${suggIndex + 1}: missing 'path' property`);
                    return;
                }

                if (!scenario.paths[suggestion.path]) {
                    errors.push(`ERROR: Step ${stepIndex + 1}, suggestion ${suggIndex + 1}: path "${suggestion.path}" does not exist in paths object`);
                }
            });
        });
    }

    // Check 5: Variants 1-3 (excellent/good/normal) lead to "master"
    if (scenario.paths.master) {
        scenario.paths.master.forEach((step, stepIndex) => {
            const suggestions = step.suggestions || [];

            // Check suggestion 1 (excellent)
            if (suggestions[0]) {
                if (suggestions[0].quality === "excellent" && suggestions[0].path !== "master") {
                    errors.push(`ERROR: Step ${stepIndex + 1}, suggestion 1 (excellent): should lead to "master", got "${suggestions[0].path}"`);
                }
            }

            // Check suggestion 2 (good)
            if (suggestions[1]) {
                if (suggestions[1].quality === "good" && suggestions[1].path !== "master") {
                    errors.push(`ERROR: Step ${stepIndex + 1}, suggestion 2 (good): should lead to "master", got "${suggestions[1].path}"`);
                }
            }

            // Check suggestion 3 (normal)
            if (suggestions[2]) {
                if (suggestions[2].quality === "normal" && suggestions[2].path !== "master") {
                    errors.push(`ERROR: Step ${stepIndex + 1}, suggestion 3 (normal): should lead to "master", got "${suggestions[2].path}"`);
                }
            }
        });
    }

    // Check 6: Variants 4-6 (weak/aggressive/fail) lead to "reject_*_final"
    if (scenario.paths.master) {
        scenario.paths.master.forEach((step, stepIndex) => {
            const suggestions = step.suggestions || [];

            // Check suggestions 4-6
            [3, 4, 5].forEach(i => {
                if (suggestions[i]) {
                    const suggestion = suggestions[i];
                    const quality = suggestion.quality;

                    // Special case: "I'll take posted rate" or "I'll take $X posted" on negotiation steps can lead to master
                    // This is accepting terms, not a failure
                    const textLower = suggestion.text ? suggestion.text.toLowerCase() : '';
                    const isPostedRateAcceptance = quality === "fail" &&
                        suggestion.text &&
                        (textLower.includes("posted rate") || textLower.includes("posted")) &&
                        textLower.includes("take") &&
                        suggestion.path === "master";

                    // These qualities should lead to reject_*_final paths (except posted rate acceptance)
                    if ((quality === "weak" || quality === "aggressive" || quality === "fail") && !isPostedRateAcceptance) {
                        if (!suggestion.path.endsWith("_final")) {
                            errors.push(`ERROR: Step ${stepIndex + 1}, suggestion ${i + 1} (${quality}): should lead to "reject_*_final" path, got "${suggestion.path}"`);
                        }
                    }
                }
            });
        });
    }

    // Check 7: All reject paths have "_final" suffix (except master)
    Object.keys(scenario.paths).forEach(pathName => {
        if (pathName !== "master" && !pathName.endsWith("_final")) {
            errors.push(`ERROR: Path "${pathName}" should end with "_final" suffix (only master path can be without _final)`);
        }
    });

    // Check 8: All reject_*_final paths contain exactly 1 element with outcome
    Object.keys(scenario.paths).forEach(pathName => {
        if (pathName.endsWith("_final")) {
            const path = scenario.paths[pathName];

            if (!Array.isArray(path)) {
                errors.push(`ERROR: Path "${pathName}" should be an array`);
                return;
            }

            if (path.length !== 1) {
                errors.push(`ERROR: Path "${pathName}" should have exactly 1 element, got ${path.length} elements`);
            }

            if (path[0] && !path[0].outcome) {
                errors.push(`ERROR: Path "${pathName}" should have 'outcome' property in first element`);
            }

            if (path[0] && !path[0].brokerResponse) {
                errors.push(`WARNING: Path "${pathName}" missing 'brokerResponse' property (broker should give final response)`);
            }
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Generates a detailed validation report
 * @param {Object} scenario - The dialogue scenario object
 * @returns {string} - Formatted validation report
 */
function generateValidationReport(scenario) {
    const result = validateDialogue(scenario);

    let report = "=".repeat(60) + "\n";
    report += "DIALOGUE VALIDATION REPORT\n";
    report += "=".repeat(60) + "\n\n";

    if (scenario.id) {
        report += `Dialogue ID: ${scenario.id}\n`;
    }
    if (scenario.route) {
        report += `Route: ${scenario.route}\n`;
    }

    report += `\nValidation Status: ${result.valid ? "✅ PASSED" : "❌ FAILED"}\n`;
    report += `Total Errors: ${result.errors.length}\n\n`;

    if (result.errors.length > 0) {
        report += "ERRORS FOUND:\n";
        report += "-".repeat(60) + "\n";
        result.errors.forEach((error, index) => {
            report += `${index + 1}. ${error}\n`;
        });
    } else {
        report += "✅ No errors found! Dialogue structure is correct.\n";
    }

    report += "\n" + "=".repeat(60) + "\n";

    return report;
}

/**
 * Validates multiple scenarios and returns summary
 * @param {Array} scenarios - Array of scenario objects
 * @returns {Object} - { totalScenarios, validScenarios, invalidScenarios, results }
 */
function validateMultipleDialogues(scenarios) {
    const results = scenarios.map(scenario => {
        const validation = validateDialogue(scenario);
        return {
            id: scenario.id,
            route: scenario.route,
            valid: validation.valid,
            errorCount: validation.errors.length,
            errors: validation.errors
        };
    });

    const validScenarios = results.filter(r => r.valid).length;
    const invalidScenarios = results.filter(r => !r.valid).length;

    return {
        totalScenarios: scenarios.length,
        validScenarios,
        invalidScenarios,
        results
    };
}

/**
 * Generates summary report for multiple dialogues
 * @param {Array} scenarios - Array of scenario objects
 * @returns {string} - Formatted summary report
 */
function generateSummaryReport(scenarios) {
    const summary = validateMultipleDialogues(scenarios);

    let report = "=".repeat(60) + "\n";
    report += "MULTIPLE DIALOGUES VALIDATION SUMMARY\n";
    report += "=".repeat(60) + "\n\n";

    report += `Total Dialogues: ${summary.totalScenarios}\n`;
    report += `Valid: ${summary.validScenarios} ✅\n`;
    report += `Invalid: ${summary.invalidScenarios} ❌\n\n`;

    if (summary.invalidScenarios > 0) {
        report += "INVALID DIALOGUES:\n";
        report += "-".repeat(60) + "\n";

        summary.results.forEach(result => {
            if (!result.valid) {
                report += `\nDialogue #${result.id} - ${result.route}\n`;
                report += `  Errors: ${result.errorCount}\n`;
                result.errors.forEach((error, index) => {
                    report += `  ${index + 1}. ${error}\n`;
                });
            }
        });
    }

    report += "\n" + "=".repeat(60) + "\n";

    return report;
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateDialogue,
        generateValidationReport,
        validateMultipleDialogues,
        generateSummaryReport
    };
}
