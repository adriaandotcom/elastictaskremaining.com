import { testSanitizeJsonInput } from "./sanitize.test.js";

const runAllTests = async () => {
  console.log("🚀 Running all tests...\n");

  const tests = [{ name: "sanitizeJsonInput", fn: testSanitizeJsonInput }];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`📋 Running ${test.name} tests:`);
    console.log("─".repeat(50));

    try {
      const result = await test.fn();
      if (result) {
        passed++;
        console.log(`✅ ${test.name} tests completed successfully\n`);
      } else {
        failed++;
        console.log(`❌ ${test.name} tests failed\n`);
      }
    } catch (error) {
      failed++;
      console.error(`❌ ${test.name} tests crashed:`, error.message);
      console.error(error.stack);
      console.log();
    }
  }

  console.log("═".repeat(50));
  console.log("📊 Test Summary:");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🔢 Total: ${passed + failed}`);

  if (failed > 0) {
    console.log("\n💥 Some tests failed!");
    process.exit(1);
  } else {
    console.log("\n🎉 All tests passed!");
    process.exit(0);
  }
};

runAllTests().catch((error) => {
  console.error("Test runner crashed:", error);
  process.exit(1);
});
