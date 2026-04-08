/**
 * Unit Tests for Dialogue #5 (Hazmat) and Dialogue #6 (Auto Transport)
 * Feature: add-two-new-dialogues
 * 
 * These tests verify specific examples and edge cases for the two new dialogues.
 */

describe('Dialogue #5: Hazmat (Houston TX → Chicago IL)', () => {
    let scenario5;

    beforeAll(() => {
        // Mock global allScenarios array
        global.allScenarios = [];

        // Load scenario5
        require('../pages/scenarios-data-v5.js');

        // Find scenario5 in the array
        scenario5 = global.allScenarios.find(s => s.id === 5);
    });

    describe('Scenario Metadata', () => {
        test('should have correct id, route, and distance', () => {
            expect(scenario5).toBeDefined();
            expect(scenario5.id).toBe(5);
            expect(scenario5.route).toBe('Houston TX → Chicago IL');
            expect(scenario5.distance).toBe(1100);
        });

        test('should have correct equipment and cargo', () => {
            expect(scenario5.equipment).toBe('Tanker');
            expect(scenario5.cargo).toContain('Chemical materials');
            expect(scenario5.cargo).toContain('Class 3 Flammable');
        });

        test('should have hard difficulty level', () => {
            expect(scenario5.difficulty).toBe('hard');
        });

        test('should have correct weight', () => {
            expect(scenario5.weight).toBe('44,000 lbs');
        });
    });

    describe('Rate Values', () => {
        test('should include initial rate of $3,200', () => {
            const content = JSON.stringify(scenario5);
            expect(content).toContain('3,200');
        });

        test('should include target rate of $3,500', () => {
            const content = JSON.stringify(scenario5);
            expect(content).toContain('3,500');
        });
    });

    describe('Hazmat-Specific Content', () => {
        test('should include Hazmat-related keywords', () => {
            const content = JSON.stringify(scenario5).toLowerCase();
            expect(content).toMatch(/hazmat|placard|class 3|emergency/);
        });
    });

    describe('File Structure', () => {
        test('should be added to allScenarios array', () => {
            expect(global.allScenarios).toContain(scenario5);
        });
    });
});

describe('Dialogue #6: Auto Transport (Detroit MI → Phoenix AZ)', () => {
    let scenario6;

    beforeAll(() => {
        // Reset global array
        global.allScenarios = [];

        // Load scenario6
        require('../pages/scenarios-data-v6.js');

        // Find scenario6 in the array
        scenario6 = global.allScenarios.find(s => s.id === 6);
    });

    describe('Scenario Metadata', () => {
        test('should have correct id, route, and distance', () => {
            expect(scenario6).toBeDefined();
            expect(scenario6.id).toBe(6);
            expect(scenario6.route).toBe('Detroit MI → Phoenix AZ');
            expect(scenario6.distance).toBe(1900);
        });

        test('should have correct equipment and cargo', () => {
            expect(scenario6.equipment).toContain('Car Carrier');
            expect(scenario6.cargo).toContain('Luxury vehicles');
        });

        test('should have medium-hard difficulty level', () => {
            expect(scenario6.difficulty).toBe('medium-hard');
        });
    });

    describe('Rate Values', () => {
        test('should include initial rate of $5,000', () => {
            const content = JSON.stringify(scenario6);
            expect(content).toContain('5,000');
        });

        test('should include target rate of $5,500', () => {
            const content = JSON.stringify(scenario6);
            expect(content).toContain('5,500');
        });
    });

    describe('Auto Transport-Specific Content', () => {
        test('should include auto transport-related keywords', () => {
            const content = JSON.stringify(scenario6).toLowerCase();
            expect(content).toMatch(/insurance|luxury|inspection|enclosed/);
        });
    });
});
