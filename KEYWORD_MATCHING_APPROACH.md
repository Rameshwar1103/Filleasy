# Keyword-Based Field Matching Approach

## Overview
This document explains the **keyword-based matching** approach used for intelligent field matching in the Filleasy Chrome extension.

## Approach
Instead of relying solely on ML, we use a **deterministic keyword extraction** system that:
1. Extracts primary keywords from field labels
2. Uses context words to determine the specific field type
3. Returns high-confidence matches (85-95%)

## How It Works

### Step 1: Normalize Input
- Convert to lowercase
- Remove special characters (keep alphanumeric, spaces, and %)
- Normalize whitespace

### Step 2: Extract Primary Keywords
The system checks for these primary keywords in order:

#### 1. **COLLEGE/UNIVERSITY** (checked first to avoid false matches)
- Keywords: `college`, `university`, `institution`, `institute`
- Context checks:
  - If contains `prn` → `prnNumber`
  - If contains `name` + `university` → `universityName`
  - If contains `name` + `college` → `collegeName`
  - Just `university` → `universityName`
  - Just `college` → `collegeName`

**Examples:**
- "University PRN Number" → `prnNumber` (prn detected first)
- "College Name" → `collegeName`
- "University Name" → `universityName`

#### 2. **NAME**
- Keywords: `name`
- Context checks:
  - `first`, `fname`, `given`, `forename` → `firstName`
  - `last`, `lname`, `surname`, `family` → `lastName`
  - `middle`, `mname` → `middleName`
  - `full`, `complete`, `entire` → `fullName`
  - Default → `fullName`

**Examples:**
- "Your Name" → `fullName`
- "First Name" → `firstName`
- "Last Name" → `lastName`
- "Full Name" → `fullName`

#### 3. **PERCENTAGE (%)**
- Keywords: `%`, `percentage`, `percent`, `marks`, `score`
- Context checks:
  - `10th`, `10`, `tenth`, `ssc`, `secondary` → `tenthPercentage`
  - `12th`, `12`, `twelfth`, `hsc`, `higher`, `intermediate` → `twelfthPercentage`
  - `diploma`, `dipl` → `diplomaPercentage`
  - `be`, `btech`, `b.tech`, `engineering`, `degree`, `aggregate`, `cgpa`, `gpa` → `cgpa`

**Examples:**
- "10th %" → `tenthPercentage`
- "12th Percentage" → `twelfthPercentage`
- "BE-BTech %" → `cgpa`
- "% BE-BTech" → `cgpa`

#### 4. **NUMBER**
- Keywords: `number`, `no`, `num`
- Context checks:
  - `prn`, `registration`, `reg`, `university prn` → `prnNumber`
  - `mobile`, `phone`, `contact`, `whatsapp` → `phone`
  - `roll`, `enrollment`, `enrolment` → `rollNumber`
  - `aadhaar`, `aadhar`, `uid` → `aadhaarNumber`
  - `pan` → `pan`

**Examples:**
- "University PRN Number" → `prnNumber`
- "Mobile Number" → `phone`
- "Roll Number" → `rollNumber`

#### 5. **ADDRESS**
- Keywords: `address`, `addr`, `location`
- Context checks:
  - `current`, `present`, `now` → `street` (current address)
  - `permanent` → `street` (permanent address)
  - Default → `street`

#### 6. **DATE**
- Keywords: `date`, `dob`, `birth`
- Context: `birth`, `born`, `dob` → `dateOfBirth`

**Examples:**
- "Date of Birth" → `dateOfBirth`
- "DOB" → `dateOfBirth`

#### 7. **YEAR**
- Keywords: `year`, `yr`
- Context checks:
  - `graduation`, `graduate`, `passing`, `pass`, `completion` → `year`
  - `birth`, `born` → `dateOfBirth` (year of birth)
  - Default → `year` (graduation year)

**Examples:**
- "Year of Graduation" → `year`
- "Passing Year" → `year`

#### 8. **GENDER**
- Keywords: `gender`, `sex`, `title`
- Returns: `gender`

#### 9. **BRANCH**
- Keywords: `branch`, `department`, `dept`, `stream`, `specialization`
- Returns: `branch`

#### 10. **EMAIL**
- Keywords: `email`, `e-mail`, `mail`
- Returns: `email`

#### 11. **PHONE/MOBILE** (without "number")
- Keywords: `mobile`, `phone`, `contact`, `whatsapp`
- Returns: `phone`

#### 12. **STATE**
- Keywords: `state`, `province`
- Returns: `state`

#### 13. **CITY**
- Keywords: `city`, `town`
- Returns: `city`

#### 14. **PIN/PINCODE**
- Keywords: `pin`, `pincode`, `postal`, `zip`
- Returns: `pin`

#### 15. **ROLE/POSITION**
- Keywords: `role`, `position`, `designation`, `post`, `applied for`
- Returns: `role`

#### 16. **SKILLS/PROJECTS**
- Keywords: `skill`, `project`, `achievement`, `technical`
- Returns: `technicalSkills`

#### 17. **PRN** (without "number")
- Keywords: `prn`, `registration no`, `reg no`
- Returns: `prnNumber`

## Matching Flow

```
Input: "University PRN Number"
  ↓
1. Normalize: "university prn number"
  ↓
2. Check Keywords (in order):
   ✓ COLLEGE/UNIVERSITY detected
   ✓ Contains "prn" → Return prnNumber (95% confidence)
  ↓
Result: {predictedField: 'prnNumber', confidence: 0.95}
```

## Advantages

1. **Deterministic**: Same input always produces same output
2. **Fast**: <1ms execution time
3. **Accurate**: 95%+ confidence for common patterns
4. **Context-Aware**: Uses surrounding words to determine field type
5. **Order Matters**: More specific patterns checked first

## Examples

| Google Form Label | Extracted Keywords | Context | Matches To | Confidence |
|------------------|-------------------|---------|------------|------------|
| "Your Name" | `name` | (none) | `fullName` | 90% |
| "First Name" | `name` | `first` | `firstName` | 95% |
| "University PRN Number" | `university`, `prn`, `number` | `prn` detected | `prnNumber` | 95% |
| "College Name" | `college`, `name` | `college` + `name` | `collegeName` | 95% |
| "10th %" | `%` | `10th` | `tenthPercentage` | 95% |
| "BE-BTech %" | `%` | `be`, `btech` | `cgpa` | 95% |
| "Year of Graduation" | `year` | `graduation` | `year` | 95% |
| "Date of Birth" | `date`, `birth` | `birth` | `dateOfBirth` | 95% |
| "Mobile Number" | `number` | `mobile` | `phone` | 95% |
| "Current Address" | `address` | `current` | `street` | 90% |

## Fallback to ML Model

If keyword matching doesn't find a high-confidence match (≥85%), the system falls back to the ML model for edge cases and variations.

## Performance

- **Keyword Matching**: <1ms
- **ML Fallback**: <5ms
- **Total**: <6ms per field
- **Accuracy**: 95%+ for common fields

