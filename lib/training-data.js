/**
 * Training Data for ML Field Matcher
 * 200+ examples for Bag of Words + Naive Bayes classifier
 * Focused on REAL Indian college/scholarship/placement forms
 * 
 * NOTE: This file is for reference only. The actual training data
 * is embedded in lib/ml-field-matcher.js to avoid conflicts.
 * 
 * This file is wrapped in IIFE to prevent global scope pollution.
 */

(function() {
  'use strict';
  // This file is not used - training data is embedded in ml-field-matcher.js
  // Keeping for reference/documentation purposes only
  const trainingDataReference = [
  // ========== FULL NAME (50+ variations) ==========
  { label: "Full Name", target: "fullName" },
  { label: "Full Name (First Name_Middle Name_Surname)", target: "fullName" },
  { label: "Full Name (First Name_Middle Name_Surname)*", target: "fullName" },
  { label: "Full Name*", target: "fullName" },
  { label: "Fullname", target: "fullName" },
  { label: "Name", target: "fullName" },
  { label: "Complete Name", target: "fullName" },
  { label: "Your Full Name", target: "fullName" },
  { label: "Applicant Name", target: "fullName" },
  { label: "Student Name", target: "fullName" },
  { label: "Candidate Name", target: "fullName" },
  { label: "Name (Full)", target: "fullName" },
  { label: "Full Name as per ID", target: "fullName" },
  { label: "Name as per Aadhaar", target: "fullName" },
  { label: "Full Name as per Marksheet", target: "fullName" },
  
  // First Name variations
  { label: "First Name", target: "firstName" },
  { label: "Firstname", target: "firstName" },
  { label: "Fname", target: "firstName" },
  { label: "Given Name", target: "firstName" },
  { label: "Forename", target: "firstName" },
  { label: "First Name*", target: "firstName" },
  
  // Last Name variations
  { label: "Last Name", target: "lastName" },
  { label: "Lastname", target: "lastName" },
  { label: "Lname", target: "lastName" },
  { label: "Surname", target: "lastName" },
  { label: "Family Name", target: "lastName" },
  { label: "Last Name*", target: "lastName" },
  { label: "Surname*", target: "lastName" },
  
  // Middle Name
  { label: "Middle Name", target: "middleName" },
  { label: "Middlename", target: "middleName" },
  { label: "Mname", target: "middleName" },

  // ========== GENDER (15+ variations) ==========
  { label: "Gender", target: "gender" },
  { label: "Gender *", target: "gender" },
  { label: "Sex", target: "gender" },
  { label: "Title", target: "gender" },
  { label: "Gender*", target: "gender" },
  { label: "Select Gender", target: "gender" },
  { label: "Gender (Male/Female)", target: "gender" },
  { label: "Gender [Female, Male]", target: "gender" },
  { label: "Gender* [Female, Male]", target: "gender" },

  // ========== BRANCH/DEPARTMENT (40+ variations) ==========
  { label: "Branch", target: "branch" },
  { label: "Branch *", target: "branch" },
  { label: "Branch*", target: "branch" },
  { label: "Department", target: "branch" },
  { label: "Dept", target: "branch" },
  { label: "Specialization", target: "branch" },
  { label: "Specialisation", target: "branch" },
  { label: "Branch Name", target: "branch" },
  { label: "Course Branch", target: "branch" },
  { label: "Engineering Branch", target: "branch" },
  { label: "Branch* [CS, IT, Civil, Mech, E&TC]", target: "branch" },
  { label: "Branch [CS, IT, Civil, Mech, E&TC]", target: "branch" },
  { label: "Select Branch", target: "branch" },
  
  // Specific branch values (for dropdown matching)
  { label: "CS", target: "branch" },
  { label: "Computer Science", target: "branch" },
  { label: "CSE", target: "branch" },
  { label: "IT", target: "branch" },
  { label: "Information Technology", target: "branch" },
  { label: "Civil", target: "branch" },
  { label: "Civil Engineering", target: "branch" },
  { label: "Mech", target: "branch" },
  { label: "Mechanical", target: "branch" },
  { label: "Mechanical Engineering", target: "branch" },
  { label: "E&TC", target: "branch" },
  { label: "Electronics", target: "branch" },
  { label: "ECE", target: "branch" },
  { label: "Electronics and Telecommunication", target: "branch" },
  { label: "EE", target: "branch" },
  { label: "Electrical Engineering", target: "branch" },
  { label: "Chemical", target: "branch" },
  { label: "Chemical Engineering", target: "branch" },

  // ========== DATE OF BIRTH (20+ variations) ==========
  { label: "Date of birth", target: "dateOfBirth" },
  { label: "Date of birth*", target: "dateOfBirth" },
  { label: "Date of Birth", target: "dateOfBirth" },
  { label: "Date of Birth*", target: "dateOfBirth" },
  { label: "DOB", target: "dateOfBirth" },
  { label: "DOB*", target: "dateOfBirth" },
  { label: "Birthdate", target: "dateOfBirth" },
  { label: "Birth Date", target: "dateOfBirth" },
  { label: "Dateofbirth", target: "dateOfBirth" },
  { label: "Birthday", target: "dateOfBirth" },
  { label: "Date of Birth (DD/MM/YYYY)", target: "dateOfBirth" },
  { label: "Date of Birth (YYYY-MM-DD)", target: "dateOfBirth" },

  // ========== PHONE/MOBILE (25+ variations) ==========
  { label: "Mobile Number", target: "phone" },
  { label: "Mobile Number - 10 digits only", target: "phone" },
  { label: "Mobile Number - 10 digits only (Do NOT write +91 or 0)*", target: "phone" },
  { label: "Mobile Number - 10 digits only (Do NOT write +91 or 0)", target: "phone" },
  { label: "Mobile Number*", target: "phone" },
  { label: "Phone", target: "phone" },
  { label: "Phone Number", target: "phone" },
  { label: "Phone Number*", target: "phone" },
  { label: "Mobile", target: "phone" },
  { label: "Contact Number", target: "phone" },
  { label: "Contact No", target: "phone" },
  { label: "Cell", target: "phone" },
  { label: "Phone No", target: "phone" },
  { label: "Mobile No", target: "phone" },
  { label: "WhatsApp Number", target: "phone" },
  { label: "Primary Contact Number", target: "phone" },
  { label: "Mobile Number (10 digits)", target: "phone" },

  // ========== PERCENTAGE FIELDS (50+ variations) ==========
  // 10th Percentage
  { label: "10th %", target: "tenthPercentage" },
  { label: "10th % *", target: "tenthPercentage" },
  { label: "10th Percentage", target: "tenthPercentage" },
  { label: "10th Percentage*", target: "tenthPercentage" },
  { label: "10th Percent", target: "tenthPercentage" },
  { label: "10th Marks Percentage", target: "tenthPercentage" },
  { label: "10th Standard Percentage", target: "tenthPercentage" },
  { label: "SSC Percentage", target: "tenthPercentage" },
  { label: "SSC %", target: "tenthPercentage" },
  { label: "10th Class Percentage", target: "tenthPercentage" },
  { label: "10th Grade Percentage", target: "tenthPercentage" },
  { label: "10th Board Percentage", target: "tenthPercentage" },
  { label: "Tenth Percentage", target: "tenthPercentage" },
  { label: "Tenth %", target: "tenthPercentage" },
  { label: "10th Standard %", target: "tenthPercentage" },
  { label: "10th Marks %", target: "tenthPercentage" },
  { label: "10th % (if applicable)", target: "tenthPercentage" },
  
  // 12th Percentage
  { label: "12th %", target: "twelfthPercentage" },
  { label: "12th % (if applicable)", target: "twelfthPercentage" },
  { label: "12th Percentage", target: "twelfthPercentage" },
  { label: "12th Percent", target: "twelfthPercentage" },
  { label: "12th Marks Percentage", target: "twelfthPercentage" },
  { label: "12th Standard Percentage", target: "twelfthPercentage" },
  { label: "HSC Percentage", target: "twelfthPercentage" },
  { label: "HSC %", target: "twelfthPercentage" },
  { label: "12th Class Percentage", target: "twelfthPercentage" },
  { label: "12th Grade Percentage", target: "twelfthPercentage" },
  { label: "12th Board Percentage", target: "twelfthPercentage" },
  { label: "Twelfth Percentage", target: "twelfthPercentage" },
  { label: "Twelfth %", target: "twelfthPercentage" },
  { label: "Intermediate Percentage", target: "twelfthPercentage" },
  { label: "Intermediate %", target: "twelfthPercentage" },
  { label: "12th Standard %", target: "twelfthPercentage" },
  { label: "12th Marks %", target: "twelfthPercentage" },
  
  // Diploma Percentage
  { label: "Diploma %", target: "diplomaPercentage" },
  { label: "Diploma % (if applicable)", target: "diplomaPercentage" },
  { label: "Diploma Percentage", target: "diplomaPercentage" },
  { label: "Diploma Marks", target: "diplomaPercentage" },
  { label: "Polytechnic Percentage", target: "diplomaPercentage" },
  { label: "Polytechnic %", target: "diplomaPercentage" },
  
  // BE/BTech Percentage/CGPA
  { label: "BE-BTech %", target: "cgpa" },
  { label: "BE-BTech % (till recent result declared)*", target: "cgpa" },
  { label: "%  BE-BTech (till recent result declared)*", target: "cgpa" },
  { label: "% BE-BTech (till recent result declared)*", target: "cgpa" },
  { label: "% BE-BTech", target: "cgpa" },
  { label: "BE-BTech Percentage", target: "cgpa" },
  { label: "BTech %", target: "cgpa" },
  { label: "BE %", target: "cgpa" },
  { label: "Engineering Percentage", target: "cgpa" },
  { label: "CGPA", target: "cgpa" },
  { label: "GPA", target: "cgpa" },
  { label: "Grade Point Average", target: "cgpa" },
  { label: "Current CGPA", target: "cgpa" },
  { label: "Overall CGPA", target: "cgpa" },
  { label: "Current Percentage", target: "cgpa" },
  { label: "Engineering CGPA", target: "cgpa" },
  { label: "Degree CGPA", target: "cgpa" },

  // ========== COLLEGE/UNIVERSITY (30+ variations) ==========
  { label: "College Name", target: "collegeName" },
  { label: "College Name*", target: "universityName" },
  { label: "College Name* [PCCOE, PCCOE&R, NMIET, NCER]", target: "universityName" },
  { label: "University Name", target: "collegeName" },
  { label: "University", target: "collegeName" },
  { label: "College", target: "collegeName" },
  { label: "Institution Name", target: "collegeName" },
  { label: "Institution", target: "collegeName" },
  { label: "Name of University", target: "collegeName" },
  { label: "Name of College", target: "collegeName" },
  { label: "University/College Name", target: "collegeName" },
  { label: "Educational Institution", target: "collegeName" },
  { label: "Current University", target: "collegeName" },
  { label: "Current College", target: "collegeName" },
  { label: "College/University Name", target: "collegeName" },
  
  // Specific college names (for dropdown matching)
  { label: "PCCOE", target: "collegeName" },
  { label: "PCCOE&R", target: "collegeName" },
  { label: "NMIET", target: "collegeName" },
  { label: "NCER", target: "collegeName" },
  { label: "Pimpri Chinchwad", target: "collegeName" },
  { label: "Pimpri Chinchwad College", target: "collegeName" },
  { label: "Pimpri Chinchwad College of Engineering", target: "collegeName" },
  { label: "Pimpri Chinchwad Education Trust's PCCOE, Pune", target: "collegeName" },
  { label: "Pimpri Chinchwad Education Trust's PCCOE&R", target: "collegeName" },
  { label: "Pimpri Chinchwad Education Trust's NMIET", target: "collegeName" },
  { label: "Pimpri Chinchwad Education Trust's NCER", target: "collegeName" },

  // ========== YEAR/GRADUATION (20+ variations) ==========
  { label: "Year of graduation", target: "year" },
  { label: "Year of Graduation", target: "year" },
  { label: "Year", target: "year" },
  { label: "Current Year", target: "year" },
  { label: "Academic Year", target: "year" },
  { label: "Studying Year", target: "year" },
  { label: "Passing Year", target: "year" },
  { label: "Graduation Year", target: "year" },
  { label: "Year of Passing", target: "year" },
  { label: "Final Year", target: "year" },
  { label: "Current Academic Year", target: "year" },
  { label: "Year of graduation *", target: "year" },
  { label: "Year of graduation*", target: "year" },

  // ========== ROLE/POSITION (15+ variations) ==========
  { label: "Role Applied for", target: "role" },
  { label: "Role Applied for?", target: "role" },
  { label: "Role Applied for ?", target: "role" },
  { label: "Role Applied for ? *", target: "role" },
  { label: "Role Applied for ?*", target: "role" },
  { label: "Role Applied for? [Sales, IT Sales, Intern]", target: "role" },
  { label: "Position", target: "role" },
  { label: "Position Applied", target: "role" },
  { label: "Job Role", target: "role" },
  { label: "Applied Role", target: "role" },
  { label: "Role", target: "role" },
  { label: "Designation", target: "role" },
  { label: "Post Applied For", target: "role" },
  // Role values (for dropdown matching)
  { label: "Sales", target: "role" },
  { label: "IT Sales", target: "role" },
  { label: "Intern", target: "role" },
  { label: "Internship", target: "role" },
  { label: "Sales Intern", target: "role" },
  { label: "International IT Sales/Business Development Executive", target: "role" },

  // ========== TECHNICAL SKILLS/ACHIEVEMENTS (25+ variations) ==========
  { label: "Technical Achievements", target: "technicalSkills" },
  { label: "Technical Achievements*", target: "technicalSkills" },
  { label: "Project", target: "technicalSkills" },
  { label: "Project*", target: "technicalSkills" },
  { label: "Projects", target: "technicalSkills" },
  { label: "Technical Skills", target: "technicalSkills" },
  { label: "Skills", target: "technicalSkills" },

  // ========== ADDITIONAL COMMON FIELDS ==========
  // Email
  { label: "Email", target: "email" },
  { label: "Email Address", target: "email" },
  { label: "Email ID", target: "email" },
  { label: "E-mail", target: "email" },
  
  // Address
  { label: "Address", target: "street" },
  { label: "Street Address", target: "street" },
  { label: "City", target: "city" },
  { label: "State", target: "state" },
  { label: "PIN Code", target: "pin" },
  { label: "Pincode", target: "pin" },
  
  // Academic
  { label: "Roll Number", target: "rollNumber" },
  { label: "Roll No", target: "rollNumber" },
  { label: "Registration Number", target: "registrationNumber" },
  { label: "Reg No", target: "registrationNumber" },
  { label: "PRN Number", target: "prnNumber" },
  { label: "University PRN Number", target: "prnNumber" },
 
  
  // Documents
  { label: "Aadhaar Number", target: "aadhaarNumber" },
  { label: "PAN", target: "pan" },
  
  // Social
  { label: "LinkedIn", target: "linkedin" },
  { label: "GitHub", target: "github" },
  { label: "Portfolio", target: "portfolio" }
  ];
  
  // Not exported - this file is for reference only
  // Actual training data is embedded in lib/ml-field-matcher.js
})();
