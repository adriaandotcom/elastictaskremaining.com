# Test Suite

This directory contains tests for the Elastic Task Remaining calculator.

## Running Tests

To run all tests:

```bash
npm test
```

Or run directly with Node.js:

```bash
node tests/test-runner.js
```

## Test Structure

- `test-runner.js` - Main test runner that executes all test suites
- `sanitize.test.js` - Tests for the `sanitizeJsonInput` function
- `../lib/sanitize.js` - The actual module being tested

## Test Coverage

### sanitizeJsonInput Tests

1. **Basic triple-quoted string conversion** - Tests simple conversion with quotes and newlines
2. **Complex Elasticsearch task** - Tests real-world Elasticsearch task JSON with complex scripts
3. **Multiple triple-quoted descriptions** - Tests handling multiple description fields
4. **Edge case handling** - Tests normal JSON without triple quotes
5. **Comment removal** - Tests that single-line comments are properly removed

## Adding New Tests

To add new tests:

1. Create a new test file: `[feature].test.js`
2. Export a test function that returns `true` on success, `false` on failure
3. Add the test to the `tests` array in `test-runner.js`

Example:

```javascript
// myfeature.test.js
export const testMyFeature = () => {
  // Run tests...
  return true; // or false if failed
};

// test-runner.js
import { testMyFeature } from "./myfeature.test.js";

const tests = [
  { name: "sanitizeJsonInput", fn: testSanitizeJsonInput },
  { name: "myFeature", fn: testMyFeature }, // Add here
];
```
