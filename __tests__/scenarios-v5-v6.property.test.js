/**
 * Property-Based Tests for Dialogue #5 (Hazmat) and Dialogue #6 (Auto Transport)
 * Feature: add-two-new-dialogues
 * 
 * These tests verify universal properties that should hold across all dialogues.
 */

const fc = require('fast-check');

describe('Property-Based Tests for Dialogues #5 and #6', () => {
    let scenarios;

    beforeAll(() => {
        // Mock global allScenarios array
        global.allScenarios = [];

        // Load both scenarios
        require('../pages/scenarios-data-v5.js');
        require('../pages/scenarios-data-v6.js');

        // Get scenarios 5 and 6
        scenarios = global.allScenarios.filter(s => s.id === 5 || s.id === 6);
    });

    // Feature: add-two-new-dialogues, Property 1: Master path length validation
    test('Property 1: Master path should contain 8-12 conversation steps', () => {
        scenarios.forEach(scenario => {
            const masterPath = scenario.paths.master;
            // Exclude the final outcome step
            const conversationSteps = masterPath.filter(step => step.brokerQuestion);

            expect(conversationSteps.length).toBeGreaterThanOrEqual(8);
            expect(conversationSteps.length).toBeLessThanOrEqual(12);
        });
    });

    // Feature: add-two-new-dialogues, Property 2: Six quality levels per step
    test('Property 2: Each step should have exactly 6 quality levels', () => {
        scenarios.forEach(scenario => {
            const masterPath = scenario.paths.master;
            const conversationSteps = masterPath.filter(step => step.suggestions);

            conversationSteps.forEach((step, index) => {
                const qualities = step.suggestions.map(s => s.quality);
                const expectedQualities = ['excellent', 'good', 'normal', 'weak', 'aggressive', 'fail'];

                expect(qualities.length).toBe(6);
                expectedQualities.forEach(q => {
                    expect(qualities).toContain(q);
                });
            });
        });
    });

    // Feature: add-two-new-dialogues, Property 3: Reject path structure
    test('Property 3: Reject paths should start with empty object', () => {
        scenarios.forEach(scenario => {
            const rejectPaths = ['reject1', 'reject2', 'reject3'];

            rejectPaths.forEach(pathName => {
                if (scenario.paths[pathName] && scenario.paths[pathName].length > 0) {
                    const firstElement = scenario.paths[pathName][0];
                    expect(Object.keys(firstElement).length).toBe(0);
                }
            });
        });
    });

    // Feature: add-two-new-dialogues, Property 4: Required metadata fields
    test('Property 4: Scenarios should have all required metadata fields', () => {
        const requiredFields = [
            'id', 'route', 'distance', 'equipment', 'cargo',
            'difficulty', 'brokerStyle', 'weight', 'deadline', 'initialMessage'
        ];

        scenarios.forEach(scenario => {
            requiredFields.forEach(field => {
                expect(scenario).toHaveProperty(field);
                expect(scenario[field]).toBeDefined();
            });
        });
    });

    // Feature: add-two-new-dialogues, Property 5: Analytics prefix matches quality level
    test('Property 5: Analytics should have correct emoji prefix for quality level', () => {
        const prefixMap = {
            'excellent': '✨ Отлично!',
            'good': '✔️ Хорошо!',
            'normal': '⚪ Нормально.',
            'weak': '⚠️ Слабо.',
            'aggressive': '🔴 Агрессивно.',
            'fail': '❌ Провал.'
        };

        scenarios.forEach(scenario => {
            const masterPath = scenario.paths.master;
            const conversationSteps = masterPath.filter(step => step.suggestions);

            conversationSteps.forEach(step => {
                step.suggestions.forEach(suggestion => {
                    const expectedPrefix = prefixMap[suggestion.quality];
                    expect(suggestion.analytics).toContain(expectedPrefix);
                });
            });
        });
    });

    // Feature: add-two-new-dialogues, Property 6: Path routing based on quality
    test('Property 6: Path routing should match quality level', () => {
        scenarios.forEach(scenario => {
            const masterPath = scenario.paths.master;
            const conversationSteps = masterPath.filter(step => step.suggestions);

            conversationSteps.forEach(step => {
                step.suggestions.forEach(suggestion => {
                    if (['excellent', 'good', 'normal', 'weak'].includes(suggestion.quality)) {
                        expect(suggestion.path).toBe('master');
                    } else if (['aggressive', 'fail'].includes(suggestion.quality)) {
                        expect(['reject1', 'reject2', 'reject3']).toContain(suggestion.path);
                    }
                });
            });
        });
    });

    // Feature: add-two-new-dialogues, Property 7: Outcome object completeness
    test('Property 7: Final steps should have complete outcome objects', () => {
        const requiredOutcomeFields = [
            'type', 'quality', 'rate', 'ratePerMile', 'relationship',
            'dialogueTime', 'questionsAsked', 'detailLevel',
            'futureOpportunity', 'weeklyLoads', 'feedback'
        ];

        scenarios.forEach(scenario => {
            // Check master path outcome
            const masterPath = scenario.paths.master;
            const masterOutcome = masterPath[masterPath.length - 1].outcome;

            requiredOutcomeFields.forEach(field => {
                expect(masterOutcome).toHaveProperty(field);
            });

            // Check reject paths outcomes
            ['reject1', 'reject2', 'reject3'].forEach(pathName => {
                if (scenario.paths[pathName] && scenario.paths[pathName].length > 1) {
                    const rejectPath = scenario.paths[pathName];
                    const lastStep = rejectPath[rejectPath.length - 1];

                    if (lastStep.outcome) {
                        requiredOutcomeFields.forEach(field => {
                            expect(lastStep.outcome).toHaveProperty(field);
                        });
                    }
                }
            });
        });
    });

    // Feature: add-two-new-dialogues, Property 8: Outcome type matches path type
    test('Property 8: Outcome type should match path type', () => {
        scenarios.forEach(scenario => {
            // Master path should have success outcome
            const masterPath = scenario.paths.master;
            const masterOutcome = masterPath[masterPath.length - 1].outcome;
            expect(masterOutcome.type).toBe('success');

            // Reject paths should have failure outcomes
            ['reject1', 'reject2', 'reject3'].forEach(pathName => {
                if (scenario.paths[pathName] && scenario.paths[pathName].length > 1) {
                    const rejectPath = scenario.paths[pathName];
                    const lastStep = rejectPath[rejectPath.length - 1];

                    if (lastStep.outcome) {
                        expect(lastStep.outcome.type).toBe('failure');
                    }
                }
            });
        });
    });

    // Feature: add-two-new-dialogues, Property 9: Outcome rate format validation
    test('Property 9: Outcome rates should have correct format', () => {
        scenarios.forEach(scenario => {
            // Success outcome should have non-zero rate
            const masterPath = scenario.paths.master;
            const masterOutcome = masterPath[masterPath.length - 1].outcome;

            expect(masterOutcome.rate).toMatch(/\$\d+/);
            expect(masterOutcome.rate).not.toBe('$0');
            expect(masterOutcome.ratePerMile).toMatch(/\$\d+\.\d+\/mile/);
            expect(masterOutcome.ratePerMile).not.toBe('$0/mile');

            // Failure outcomes should have $0 rate
            ['reject1', 'reject2', 'reject3'].forEach(pathName => {
                if (scenario.paths[pathName] && scenario.paths[pathName].length > 1) {
                    const rejectPath = scenario.paths[pathName];
                    const lastStep = rejectPath[rejectPath.length - 1];

                    if (lastStep.outcome) {
                        expect(lastStep.outcome.rate).toBe('$0');
                        expect(lastStep.outcome.ratePerMile).toBe('$0/mile');
                    }
                }
            });
        });
    });

    // Feature: add-two-new-dialogues, Property 11: Language and emoji consistency
    test('Property 11: Language and emoji should be consistent', () => {
        scenarios.forEach(scenario => {
            const masterPath = scenario.paths.master;
            const conversationSteps = masterPath.filter(step => step.dispatcherPrompt);

            conversationSteps.forEach(step => {
                // dispatcherPrompt should start with 💎
                expect(step.dispatcherPrompt).toMatch(/^💎/);

                // brokerQuestion should be in English (contains common English words)
                if (step.brokerQuestion) {
                    expect(step.brokerQuestion).toMatch(/\b(the|is|are|have|can|will|what|how|your|our)\b/i);
                }
            });
        });
    });

    // Feature: add-two-new-dialogues, Property 12: Property naming consistency
    test('Property 12: Property names should be consistent', () => {
        const expectedProperties = [
            'id', 'route', 'distance', 'equipment', 'cargo', 'weight',
            'deadline', 'brokerStyle', 'difficulty', 'initialMessage', 'paths'
        ];

        scenarios.forEach(scenario => {
            expectedProperties.forEach(prop => {
                expect(scenario).toHaveProperty(prop);
            });

            // Check paths structure
            expect(scenario.paths).toHaveProperty('master');

            // Check step properties
            const masterPath = scenario.paths.master;
            const conversationSteps = masterPath.filter(step => step.suggestions);

            conversationSteps.forEach(step => {
                expect(step).toHaveProperty('brokerQuestion');
                expect(step).toHaveProperty('dispatcherPrompt');
                expect(step).toHaveProperty('suggestions');

                step.suggestions.forEach(suggestion => {
                    expect(suggestion).toHaveProperty('text');
                    expect(suggestion).toHaveProperty('quality');
                    expect(suggestion).toHaveProperty('analytics');
                    expect(suggestion).toHaveProperty('path');
                });
            });
        });
    });
});
