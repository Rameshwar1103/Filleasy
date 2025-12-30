# Complete Profile Fields Mapping

## Overview
This document lists all profile fields that can be auto-filled by the Filleasy extension, organized by category.

## Core Personal Fields

| Google Form Label | Profile Field | Location | Example |
|------------------|---------------|----------|---------|
| Full Name / Student Name | `fullName` | `personal.fullName` | "John Doe" |
| First Name | `firstName` | `personal.firstName` | "John" |
| Last Name / Surname | `lastName` | `personal.lastName` | "Doe" |
| Middle Name | `middleName` | `personal.middleName` | "Michael" |
| PRN / Roll Number / University PRN / Student ID | `prnNumber` | `academic.prnNumber` | "123456789" |
| Student ID | `studentId` | `personal.studentId` | "STU001" |
| Roll Number | `rollNumber` | `academic.rollNumber` | "R123" |
| University Name / College Name / Institution | `collegeName` | `academic.collegeName` | "PCCOE" |
| University Name | `universityName` | `academic.universityName` | "SPPU" |
| Email ID (Personal / College) | `email` | `personal.email` | "john@email.com" |
| College Email | `collegeEmail` | `personal.collegeEmail` | "john@college.edu" |
| Phone Number / Mobile Number / Contact Number | `phone` | `personal.phone` | "9876543210" |
| Alternate Contact Number | `alternatePhone` | `personal.alternatePhone` | "9876543211" |
| Date of Birth / DOB | `dateOfBirth` | `personal.dateOfBirth` | "2000-01-01" |
| Gender | `gender` | `personal.gender` | "Male" |
| Address (Current / Permanent) | `street` | `address.street` | "123 Main St" |
| Current Address | `currentAddress` | `address.currentAddress` | "123 Main St" |
| Permanent Address | `permanentAddress` | `address.permanentAddress` | "456 Oak Ave" |
| City | `city` | `address.city` | "Pune" |
| Current Location | `city` | `address.city` | "Pune" |
| State | `state` | `address.state` | "Maharashtra" |
| PIN Code | `pin` | `address.pin` | "411001" |

## Academic Fields

| Google Form Label | Profile Field | Location | Example |
|------------------|---------------|----------|---------|
| Course / Branch / Specialization | `course` | `academic.course` | "B.Tech" |
| Branch / Department | `branch` | `academic.branch` | "Computer Science" |
| Specialization | `specialization` | `academic.specialization` | "AI/ML" |
| Semester / Year of Study | `semester` | `academic.semester` | "6" |
| Year of Study | `yearOfStudy` | `academic.yearOfStudy` | "3" |
| CGPA / SGPA / Aggregate Percentage | `cgpa` | `academic.cgpa` | "8.5" |
| SGPA | `sgpa` | `academic.sgpa` | "8.7" |
| Aggregate Percentage | `aggregatePercentage` | `academic.aggregatePercentage` | "85%" |
| 1st year percentage | `firstYearPercentage` | `academic.firstYearPercentage` | "80%" |
| 2nd year percentage | `secondYearPercentage` | `academic.secondYearPercentage` | "82%" |
| 3rd year percentage | `thirdYearPercentage` | `academic.thirdYearPercentage` | "85%" |
| 4th year percentage | `fourthYearPercentage` | `academic.fourthYearPercentage` | "88%" |
| 10th Percentage / SSC Marks | `tenthPercentage` | `academic.tenthPercentage` | "90%" |
| 12th Percentage / HSC Marks | `twelfthPercentage` | `academic.twelfthPercentage` | "88%" |
| Graduation Percentage | `graduationPercentage` | `academic.graduationPercentage` | "85%" |
| Backlogs / Arrears (Yes/No) | `backlogs` | `academic.backlogs` | "No" |
| Backlogs Count | `backlogsCount` | `academic.backlogsCount` | "0" |
| Arrears | `arrears` | `academic.arrears` | "No" |
| Arrears Count | `arrearsCount` | `academic.arrearsCount` | "0" |

## Technical Skills

| Google Form Label | Profile Field | Location | Example |
|------------------|---------------|----------|---------|
| Programming Languages Known | `programmingLanguages` | `technical.programmingLanguages` | "Java, Python, C++" |
| Technical Skills / Technologies | `technicalSkills` | `technical.technicalSkills` | ["React", "Node.js"] |
| Technical Achievements | `technicalAchievements` | `technical.technicalAchievements` | "Won hackathon" |
| Projects (Count) | `projectsCount` | `technical.projectsCount` | "5" |
| Projects (Description) | `projectsDescription` | `technical.projectsDescription` | "E-commerce app..." |
| Projects | `projects` | `technical.projects` | ["Project 1", "Project 2"] |
| GitHub Profile Link | `github` | `technical.github` | "github.com/johndoe" |
| Certifications (AWS, Google, etc.) | `certifications` | `technical.certifications` | "AWS Certified" |
| Internship Experience (Months) | `internshipMonths` | `technical.internshipMonths` | "6" |
| Internship Companies | `internshipCompanies` | `technical.internshipCompanies` | "Google, Microsoft" |

## Placement Preferences

| Google Form Label | Profile Field | Location | Example |
|------------------|---------------|----------|---------|
| Eligible Companies / Companies Interested | `eligibleCompanies` | `placement.eligibleCompanies` | "Google, Microsoft" |
| Job Role Preference (SDE, Analyst, etc.) | `jobRolePreference` | `placement.jobRolePreference` | "Software Engineer" |
| Expected CTC / Salary Expectations | `expectedCTC` | `placement.expectedCTC` | "10 LPA" |
| Willing to Relocate (Yes/No) | `willingToRelocate` | `placement.willingToRelocate` | "Yes" |
| Notice Period | `noticePeriod` | `placement.noticePeriod` | "30 days" |
| Available From Date | `availableFromDate` | `placement.availableFromDate` | "2024-06-01" |
| Resume Upload / LinkedIn Profile | `resumeLink` | `placement.resumeLink` | "resume.pdf" |
| LinkedIn Profile | `linkedin` | `placement.linkedin` | "linkedin.com/in/johndoe" |

## Additional Fields

| Google Form Label | Profile Field | Location | Example |
|------------------|---------------|----------|---------|
| Parent/Guardian Contact number | `parentContact` | `additional.parentContact` | "9876543212" |
| Alternate Contact Number | `alternateContact` | `additional.alternateContact` | "9876543213" |
| Category (General/OBC/SC/ST) | `category` | `personal.category` | "General" |
| Physically Challenged (Yes/No) | `physicallyChallenged` | `personal.physicallyChallenged` | "No" |
| Photo Upload | `photoLink` | `personal.photoLink` | "photo.jpg" |
| Resume Upload | `resumeLink` | `placement.resumeLink` | "resume.pdf" |
| Declaration/Authorization Checkbox | `declaration` | `additional.declaration` | true/false |

## Profile Structure

```javascript
{
  personal: {
    firstName, middleName, lastName, fullName,
    dateOfBirth, gender, bloodGroup,
    phone, alternatePhone, email, collegeEmail,
    aadhaarNumber, pan, studentId, prnNumber,
    rollNumber, category, physicallyChallenged, photoLink
  },
  address: {
    house, street, city, state, pin, country,
    currentAddress, permanentAddress
  },
  academic: {
    // 10th
    tenthBoard, tenthYear, tenthPercentage,
    // 12th
    twelfthBoard, twelfthYear, twelfthPercentage, twelfthStream,
    // College
    collegeName, universityName, course, branch, specialization,
    // Progress
    semester, year, yearOfStudy,
    // Performance
    cgpa, sgpa, aggregatePercentage,
    firstYearPercentage, secondYearPercentage,
    thirdYearPercentage, fourthYearPercentage,
    graduationPercentage, percentage,
    // Backlogs
    backlogs, backlogsCount, arrears, arrearsCount,
    // Registration
    registrationNumber, prnNumber, rollNumber
  },
  technical: {
    programmingLanguages, technicalSkills, technicalAchievements,
    projects, projectsCount, projectsDescription,
    github, certifications,
    internshipMonths, internshipCompanies
  },
  placement: {
    eligibleCompanies, companiesInterested,
    jobRolePreference, expectedCTC, salaryExpectations,
    willingToRelocate, noticePeriod, availableFromDate,
    resumeLink, linkedin
  },
  documents: {
    tenthMarksheetLink, twelfthMarksheetLink,
    collegeIdCardLink, passportPhotoLink, resumeLink
  },
  social: {
    linkedin, github, portfolio, behance,
    instagram, twitter, whatsapp, telegram
  },
  additional: {
    parentContact, guardianContact, alternateContact,
    declaration
  }
}
```

## Keyword Matching Examples

### Example 1: "Programming Languages Known"
- Keywords: `programming`, `languages`
- Matches: `programmingLanguages`
- Retrieves: `profile.technical.programmingLanguages`

### Example 2: "1st year percentage"
- Keywords: `%`, `1st year`
- Matches: `firstYearPercentage`
- Retrieves: `profile.academic.firstYearPercentage`

### Example 3: "Expected CTC"
- Keywords: `expected`, `ctc`
- Matches: `expectedCTC`
- Retrieves: `profile.placement.expectedCTC`

### Example 4: "Parent/Guardian Contact number"
- Keywords: `parent`, `guardian`, `contact`, `number`
- Matches: `parentContact`
- Retrieves: `profile.additional.parentContact`

## Notes

1. **Field Priority**: More specific patterns are checked first (e.g., "Graduation College Name" before generic "Name")
2. **Context Awareness**: Uses surrounding words to determine field type (e.g., "Current Location" → `city`)
3. **Multiple Locations**: Some fields can be in multiple locations (e.g., `github` in `technical` or `social`)
4. **Array Handling**: Arrays are automatically joined with commas (e.g., `technicalSkills`)
5. **Boolean Fields**: Boolean values are converted to "Yes"/"No" (e.g., `declaration`)

