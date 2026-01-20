/**
 * Test Cases for Field Matching Improvements
 * 
 * This file demonstrates the fixes for field matching issues in the Chrome extension.
 * Run this in a Node.js environment or browser console to test the matching logic.
 */

// Mock profile data structure
const mockProfile = {
  personal: {
    fullName: "John Doe",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "9876543210",
    dateOfBirth: "2000-01-01"
  },
  academic: {
    graduationPercentage: "85.5",
    specialization: "Computer Science",
    course: "BE",
    branch: "Computer Engineering"
  }
};

// Test cases for graduation percentage fields
const graduationPercentageTestCases = [
  { label: "BE/BTech %", expected: "graduationPercentage", description: "BE/BTech with % symbol" },
  { label: "% BE/BTech", expected: "graduationPercentage", description: "% symbol before BE/BTech" },
  { label: "Graduation %", expected: "graduationPercentage", description: "Graduation with % symbol" },
  { label: "B.Tech Percentage", expected: "graduationPercentage", description: "B.Tech with period" },
  { label: "BE/BTech Percentage", expected: "graduationPercentage", description: "BE/BTech Percentage" },
  { label: "BE Percentage", expected: "graduationPercentage", description: "BE Percentage" },
  { label: "BTech Percentage", expected: "graduationPercentage", description: "BTech Percentage" },
  { label: "Engineering Percentage", expected: "graduationPercentage", description: "Engineering Percentage" },
  { label: "Overall Graduation %", expected: "graduationPercentage", description: "Overall Graduation %" },
  { label: "Total Graduation Percentage", expected: "graduationPercentage", description: "Total Graduation Percentage" },
  { label: "Aggregate Percentage", expected: "graduationPercentage", description: "Aggregate Percentage" },
];

// Test cases for specialization and course fields
const specializationCourseTestCases = [
  { label: "Specialization", expected: "specialization", description: "Standalone Specialization" },
  { label: "Specialisation", expected: "specialization", description: "British spelling" },
  { label: "Course", expected: "course", description: "Standalone Course" },
  { label: "Branch", expected: "specialization", description: "Branch maps to specialization" },
  { label: "Department", expected: "specialization", description: "Department maps to specialization" },
  { label: "Dept", expected: "specialization", description: "Dept abbreviation" },
  { label: "Stream", expected: "specialization", description: "Stream maps to specialization" },
  { label: "Current Course", expected: "course", description: "Current Course" },
  { label: "Course Name", expected: "course", description: "Course Name" },
];

// Test cases to ensure personal fields are NOT matched incorrectly
const negativeTestCases = [
  { label: "BE/BTech %", notExpected: "dateOfBirth", description: "Should NOT match DOB" },
  { label: "BE/BTech %", notExpected: "phone", description: "Should NOT match phone" },
  { label: "Graduation %", notExpected: "dateOfBirth", description: "Should NOT match DOB" },
  { label: "% BE/BTech", notExpected: "phone", description: "Should NOT match phone" },
];

/**
 * Run tests - requires MLFieldMatcher to be loaded
 * Usage: runTests(window.MLFieldMatcher)
 */
function runTests(MLFieldMatcher) {
  if (!MLFieldMatcher || !MLFieldMatcher.matchField) {
    console.error("MLFieldMatcher not available. Make sure the extension is loaded.");
    return;
  }

  console.log("=".repeat(80));
  console.log("FIELD MATCHING TEST SUITE");
  console.log("=".repeat(80));
  
  let passed = 0;
  let failed = 0;

  // Test graduation percentage fields
  console.log("\n📊 TESTING GRADUATION PERCENTAGE FIELDS");
  console.log("-".repeat(80));
  graduationPercentageTestCases.forEach((testCase, index) => {
    const result = MLFieldMatcher.matchField(testCase.label);
    const success = result.predictedField === testCase.expected;
    
    if (success) {
      passed++;
      console.log(`✅ Test ${index + 1}: "${testCase.label}"`);
      console.log(`   → Matched: ${result.predictedField} (confidence: ${Math.round(result.confidence * 100)}%)`);
      console.log(`   ${testCase.description}`);
    } else {
      failed++;
      console.log(`❌ Test ${index + 1}: "${testCase.label}"`);
      console.log(`   Expected: ${testCase.expected}, Got: ${result.predictedField} (confidence: ${Math.round(result.confidence * 100)}%)`);
      console.log(`   ${testCase.description}`);
    }
  });

  // Test specialization and course fields
  console.log("\n🎓 TESTING SPECIALIZATION AND COURSE FIELDS");
  console.log("-".repeat(80));
  specializationCourseTestCases.forEach((testCase, index) => {
    const result = MLFieldMatcher.matchField(testCase.label);
    const success = result.predictedField === testCase.expected;
    
    if (success) {
      passed++;
      console.log(`✅ Test ${index + 1}: "${testCase.label}"`);
      console.log(`   → Matched: ${result.predictedField} (confidence: ${Math.round(result.confidence * 100)}%)`);
      console.log(`   ${testCase.description}`);
    } else {
      failed++;
      console.log(`❌ Test ${index + 1}: "${testCase.label}"`);
      console.log(`   Expected: ${testCase.expected}, Got: ${result.predictedField} (confidence: ${Math.round(result.confidence * 100)}%)`);
      console.log(`   ${testCase.description}`);
    }
  });

  // Test negative cases (should NOT match)
  console.log("\n🚫 TESTING NEGATIVE CASES (Should NOT match incorrect fields)");
  console.log("-".repeat(80));
  negativeTestCases.forEach((testCase, index) => {
    const result = MLFieldMatcher.matchField(testCase.label);
    const success = result.predictedField !== testCase.notExpected;
    
    if (success) {
      passed++;
      console.log(`✅ Test ${index + 1}: "${testCase.label}"`);
      console.log(`   → Correctly did NOT match: ${testCase.notExpected}`);
      console.log(`   → Actually matched: ${result.predictedField} (confidence: ${Math.round(result.confidence * 100)}%)`);
      console.log(`   ${testCase.description}`);
    } else {
      failed++;
      console.log(`❌ Test ${index + 1}: "${testCase.label}"`);
      console.log(`   Incorrectly matched: ${testCase.notExpected}`);
      console.log(`   ${testCase.description}`);
    }
  });

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("TEST SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total Tests: ${passed + failed}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log("=".repeat(80));

  return { passed, failed, total: passed + failed };
}

/**
 * Test field matching with values
 * Usage: testFieldMatching(window.MLFieldMatcher, mockProfile)
 */
function testFieldMatching(MLFieldMatcher, profile) {
  if (!MLFieldMatcher || !MLFieldMatcher.matchFieldWithValue) {
    console.error("MLFieldMatcher not available. Make sure the extension is loaded.");
    return;
  }

  console.log("=".repeat(80));
  console.log("FIELD MATCHING WITH VALUES TEST");
  console.log("=".repeat(80));

  const testFields = [
    "BE/BTech %",
    "% BE/BTech",
    "Graduation %",
    "B.Tech Percentage",
    "Specialization",
    "Course",
    "Branch"
  ];

  testFields.forEach(fieldLabel => {
    console.log(`\nField: '${fieldLabel}'`);
    const result = MLFieldMatcher.matchFieldWithValue(fieldLabel, profile);
    
    if (result) {
      console.log(`  → Data: '${result.field}' (confidence: ${Math.round(result.confidence * 100)}%)`);
      console.log(`  → Value: '${result.value}'`);
    } else {
      console.log(`  → No match found`);
    }
  });
}

// Export for use in browser console or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests, testFieldMatching, mockProfile };
}

// Auto-run if in browser and MLFieldMatcher is available
if (typeof window !== 'undefined' && window.MLFieldMatcher) {
  console.log("MLFieldMatcher detected. Run runTests(window.MLFieldMatcher) to test.");
}
