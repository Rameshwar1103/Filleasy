# Intelligent Field Matching for Radio Buttons and Dropdowns

## What's New

The extension now intelligently matches your profile values to radio button and dropdown options in Google Forms, even when the values don't exactly match.

## How It Works

### Example Scenarios

**1. Gender Matching:**
- Your Profile: "Male"
- Form Options: "Male", "Female", "Other"
- ✅ **Result**: Automatically selects "Male"

**2. Branch Matching:**
- Your Profile: "Computer Science"
- Form Options: "CS", "IT", "Civil", "Mechanical"
- ✅ **Result**: Automatically selects "CS" (recognizes abbreviation)

**3. College Name Matching:**
- Your Profile: "IIT Delhi"
- Form Options: "IIT Delhi", "IIT Bombay", "MIT", "Stanford"
- ✅ **Result**: Automatically selects "IIT Delhi" (exact match)

**4. Partial Matching:**
- Your Profile: "Electrical Engineering"
- Form Options: "EE", "ECE", "CS", "ME"
- ✅ **Result**: Automatically selects "EE" (recognizes abbreviation)

## Matching Priority

The extension uses a 4-level matching strategy:

### Level 1: Exact Match (Highest Priority)
- Compares values ignoring case and special characters
- Example: "Male" matches "male" or "MALE"

### Level 2: Contains Match
- Checks if profile value contains option value or vice versa
- Example: "Computer Science" contains "Computer" → matches "Computer Science Engineering"

### Level 3: Abbreviation Match
- Recognizes common abbreviations and variations
- Supports:
  - **Gender**: Male/M, Female/F, Other/O
  - **Branches**: CS/Computer Science, IT/Information Technology, CE/Civil Engineering, etc.
  - **Institutes**: IIT, NIT, IIM, etc.

### Level 4: Word-Based Match
- Matches key words (3+ characters) from your profile to options
- Example: "Mechanical Engineering" → matches option with "Mechanical" or "Engineering"

## Supported Abbreviations

### Gender
- Male → M, Male
- Female → F, Female, Fem
- Other → O, Other

### Engineering Branches
- Computer Science → CS, CSE, Computer Science, Computer Science Engineering
- Information Technology → IT, Information Technology
- Civil Engineering → CE, Civil, Civil Engineering
- Mechanical Engineering → ME, Mechanical, Mechanical Engineering
- Electrical Engineering → EE, ECE, Electrical, Electrical Engineering, Electronics
- Electronics Engineering → ECE, EC, Electronics, Electronics Engineering
- Chemical Engineering → CHE, CH, Chemical, Chemical Engineering

### Institutes
- Institute → Inst, Institute, IIT, NIT, IIM
- University → Univ, University, Uni
- Technology → Tech, Technology

## How to Use

1. **Fill Your Profile:**
   - Go to Settings → Profile tab
   - Fill in fields like:
     - Gender: "Male" or "Female"
     - Branch: "Computer Science" or "CS"
     - College Name: Full name (e.g., "IIT Delhi")

2. **Open Google Form:**
   - Navigate to a Google Form
   - Form can have radio buttons or dropdowns with various option formats

3. **Fill Form:**
   - Click Filleasy icon
   - Click "Fill All Fields"
   - Extension will automatically match and select the correct option

4. **Review:**
   - Check that correct options are selected
   - Make manual corrections if needed

## Tips for Best Results

1. **Use Full Names in Profile:**
   - Better to use "Computer Science" than "CS" in profile
   - Extension can match both ways, but full names work better

2. **Be Consistent:**
   - Use standard names (e.g., "Male" not "M" in profile)
   - Extension handles variations but consistency helps

3. **Check Preview:**
   - Use "Preview & Edit" to see which options will be selected
   - Verify matches before filling

4. **Manual Override:**
   - If automatic matching doesn't work, you can still manually select options
   - The extension won't override manual selections

## Examples

### Example 1: Branch Selection
**Your Profile:**
- Branch: "Information Technology"

**Form Has Radio Buttons:**
- CS
- IT
- Civil
- Mechanical

**Result:** ✅ Selects "IT" automatically

### Example 2: Gender Selection
**Your Profile:**
- Gender: "Male"

**Form Has Options:**
- Male
- Female
- Other
- Prefer not to say

**Result:** ✅ Selects "Male" automatically

### Example 3: College Name
**Your Profile:**
- College: "Indian Institute of Technology Delhi"

**Form Has Dropdown:**
- IIT Delhi
- IIT Bombay
- MIT
- Stanford

**Result:** ✅ Selects "IIT Delhi" (matches key words)

## Technical Details

The matching algorithm:
1. Normalizes strings (lowercase, removes special characters)
2. Tries exact match first
3. Falls back to contains match
4. Uses abbreviation dictionary for common terms
5. Finally uses word-based matching for complex cases

All matching is case-insensitive and handles variations in formatting.

