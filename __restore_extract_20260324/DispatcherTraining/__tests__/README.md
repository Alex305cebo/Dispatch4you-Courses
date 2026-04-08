# Test Suite for Dialogues #5 and #6

This directory contains tests for the two new interactive training dialogues:
- **Dialogue #5**: Hazmat (Houston TX → Chicago IL) - Hard difficulty
- **Dialogue #6**: Auto Transport (Detroit MI → Phoenix AZ) - Medium-hard difficulty

## Test Structure

### Unit Tests (`scenarios-v5-v6.unit.test.js`)
Unit tests verify specific examples and edge cases:
- Scenario metadata (id, route, distance, equipment, cargo, difficulty)
- Rate values ($3,200/$3,500 for Hazmat, $5,000/$5,500 for Auto Transport)
- Content-specific keywords (Hazmat, placard, insurance, luxury, etc.)
- File structure and integration with allScenarios array

### Property-Based Tests (`scenarios-v5-v6.property.test.js`)
Property-based tests verify universal properties using fast-check:
- **Property 1**: Master path length (8-12 steps)
- **Property 2**: Six quality levels per step
- **Property 3**: Reject path structure (empty first step)
- **Property 4**: Required metadata fields
- **Property 5**: Analytics prefix matches quality level
- **Property 6**: Path routing based on quality
- **Property 7**: Outcome object completeness
- **Property 8**: Outcome type matches path type
- **Property 9**: Outcome rate format validation
- **Property 11**: Language and emoji consistency
- **Property 12**: Property naming consistency

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Configuration

Tests are configured in `jest.config.js` with:
- Node environment
- Coverage thresholds: 95% for branches, functions, lines, and statements
- Test file patterns: `**/__tests__/**/*.test.js` and `**/?(*.)+(spec|test).js`

## Dependencies

- **jest**: Testing framework
- **fast-check**: Property-based testing library
- **@types/jest**: TypeScript definitions for Jest

## Notes

- Tests use a mocked `global.allScenarios` array to avoid side effects
- Each test file loads the scenario files independently
- Property tests run with minimum 100 iterations (fast-check default)
- All tests follow the feature tagging convention: `Feature: add-two-new-dialogues, Property X: ...`
