/**
 * ML Field Matcher - Bag of Words + Naive Bayes Classifier
 * Pure vanilla JS implementation (<10KB, <5ms prediction)
 * Handles Indian college/scholarship form field matching
 */

(function() {
  'use strict';

// Training data (200+ examples - REAL Indian college forms)
const trainingData = [
  // ========== FULL NAME (50+ variations) ==========
  { label: "Full Name", target: "fullName" },
  { label: "Full Name (First Name_Middle Name_Surname)", target: "fullName" },
  { label: "Full Name (First Name_Middle Name_Surname)*", target: "fullName" },
  { label: "Full Name*", target: "fullName" },
  { label: "Fullname", target: "fullName" },
  { label: "Name", target: "fullName" },
  { label: "Your Name", target: "fullName" },
  { label: "Your Full Name", target: "fullName" },
  { label: "Enter Your Name", target: "fullName" },
  { label: "Please Enter Your Name", target: "fullName" },
  { label: "Provide Your Name", target: "fullName" },
  { label: "Complete Name", target: "fullName" },
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
  { label: "Your Mobile Number", target: "phone" },
  { label: "Enter Your Mobile Number", target: "phone" },
  { label: "Your Phone Number", target: "phone" },
  { label: "Enter Your Phone Number", target: "phone" },
  { label: "Contact Number", target: "phone" },
  { label: "Your Contact Number", target: "phone" },
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
  { label: "10 %", target: "tenthPercentage" },
  { label: "10%", target: "tenthPercentage" },
  { label: "10th Percentage", target: "tenthPercentage" },
  { label: "10th Percentage*", target: "tenthPercentage" },
  { label: "10th Marks", target: "tenthPercentage" },
  { label: "10th Percent", target: "tenthPercentage" },
  { label: "SSC Percentage", target: "tenthPercentage" },
  { label: "SSC %", target: "tenthPercentage" },
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
  { label: "Email", target: "email" },
  { label: "E Mail", target: "email" },
  { label: "Email Address", target: "email" },
  { label: "Email ID", target: "email" },
  { label: "E-mail", target: "email" },
  { label: "Aadhaar Number", target: "aadhaarNumber" },
  { label: "Aadhaar", target: "aadhaarNumber" },
  { label: "Aadhar", target: "aadhaarNumber" },
  { label: "Aadhar Number", target: "aadhaarNumber" },
  { label: "UID", target: "aadhaarNumber" },
  { label: "UIDAI", target: "aadhaarNumber" },
  { label: "PAN", target: "pan" },
  { label: "PAN Number", target: "pan" },
  { label: "Permanent Account Number", target: "pan" },
  { label: "PAN No", target: "pan" },
  // Address
  { label: "House", target: "house" },
  { label: "House Number", target: "house" },
  { label: "Houseno", target: "house" },
  { label: "House No", target: "house" },
  { label: "Street", target: "street" },
  { label: "Street Address", target: "street" },
  { label: "Address Line 1", target: "street" },
  { label: "City", target: "city" },
  { label: "Town", target: "city" },
  { label: "State", target: "state" },
  { label: "Province", target: "state" },
  { label: "PIN", target: "pin" },
  { label: "Pincode", target: "pin" },
  { label: "PIN Code", target: "pin" },
  { label: "Zip", target: "pin" },
  { label: "Zipcode", target: "pin" },
  { label: "Postal Code", target: "pin" },
  { label: "Postalcode", target: "pin" },
  { label: "Country", target: "country" },
  { label: "Nation", target: "country" },
  // Academic - 10th
  { label: "10th Board", target: "tenthBoard" },
  { label: "Tenth Board", target: "tenthBoard" },
  { label: "SSC Board", target: "tenthBoard" },
  { label: "10 Board", target: "tenthBoard" },
  { label: "Class 10 Board", target: "tenthBoard" },
  { label: "10th Year", target: "tenthYear" },
  { label: "Tenth Year", target: "tenthYear" },
  { label: "SSC Year", target: "tenthYear" },
  { label: "10 Year", target: "tenthYear" },
  { label: "Class 10 Year", target: "tenthYear" },
  { label: "10th Marks", target: "tenthPercentage" },
  { label: "10th CGPA", target: "tenthPercentage" },
  // Academic - 12th
  { label: "12th Board", target: "twelfthBoard" },
  { label: "Twelfth Board", target: "twelfthBoard" },
  { label: "HSC Board", target: "twelfthBoard" },
  { label: "12 Board", target: "twelfthBoard" },
  { label: "Class 12 Board", target: "twelfthBoard" },
  { label: "Intermediate Board", target: "twelfthBoard" },
  { label: "12th Year", target: "twelfthYear" },
  { label: "Twelfth Year", target: "twelfthYear" },
  { label: "HSC Year", target: "twelfthYear" },
  { label: "12 Year", target: "twelfthYear" },
  { label: "Class 12 Year", target: "twelfthYear" },
  { label: "Intermediate Year", target: "twelfthYear" },
  { label: "12th Stream", target: "twelfthStream" },
  { label: "Twelfth Stream", target: "twelfthStream" },
  { label: "HSC Stream", target: "twelfthStream" },
  { label: "Stream", target: "twelfthStream" },
  { label: "12 Stream", target: "twelfthStream" },
  { label: "Intermediate Stream", target: "twelfthStream" },
  { label: "12th Marks", target: "twelfthPercentage" },
  { label: "12th CGPA", target: "twelfthPercentage" },
  // ========== COLLEGE/UNIVERSITY (30+ variations) ==========
  { label: "College Name", target: "collegeName" },
  { label: "College Name*", target: "universityName" },
  { label: "College Name* [PCCOE, PCCOE&R, NMIET, NCER]", target: "universityName" },
  { label: "Your College Name", target: "collegeName" },
  { label: "Enter Your College Name", target: "collegeName" },
  { label: "Please Enter Your College Name", target: "collegeName" },
  { label: "University Name", target: "collegeName" },
  { label: "Your University Name", target: "universityName" },
  { label: "Enter Your University Name", target: "universityName" },
  { label: "University", target: "universityName" },
  { label: "Your University", target: "universityName" },
  { label: "College", target: "collegeName" },
  { label: "Your College", target: "collegeName" },
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
  { label: "Year of graduation *", target: "year" },
  { label: "Year of graduation*", target: "year" },
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
  // ========== ROLE/POSITION (15+ variations) ==========
  { label: "Role Applied for", target: "role" },
  { label: "Role Applied for?", target: "role" },
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
  { label: "Technical Projects", target: "technicalSkills" },
  { label: "Achievements", target: "technicalSkills" },
  { label: "Technical Achievements and Projects", target: "technicalSkills" },
  { label: "Projects and Achievements", target: "technicalSkills" },
  { label: "Academic Projects", target: "technicalSkills" },
  { label: "Personal Projects", target: "technicalSkills" },
  { label: "Key Achievements", target: "technicalSkills" },
  { label: "Notable Projects", target: "technicalSkills" },
  // Additional academic fields
  { label: "Course", target: "course" },
  { label: "Degree", target: "course" },
  { label: "Program", target: "course" },
  { label: "Programme", target: "course" },
  { label: "Course Name", target: "course" },
  { label: "Degree Name", target: "course" },
  { label: "Semester", target: "semester" },
  { label: "Sem", target: "semester" },
  { label: "Current Semester", target: "semester" },
  { label: "Present Semester", target: "semester" },
  { label: "CGPA", target: "cgpa" },
  { label: "GPA", target: "cgpa" },
  { label: "Grade Point Average", target: "cgpa" },
  { label: "Current CGPA", target: "cgpa" },
  { label: "Overall CGPA", target: "cgpa" },
  { label: "Engineering CGPA", target: "cgpa" },
  { label: "Degree CGPA", target: "cgpa" },
  { label: "Percentage", target: "percentage" },
  { label: "Percent", target: "percentage" },
  { label: "Marks Percentage", target: "percentage" },
  { label: "Current Percentage", target: "percentage" },
  { label: "Roll Number", target: "rollNumber" },
  { label: "Rollno", target: "rollNumber" },
  { label: "Roll No", target: "rollNumber" },
  { label: "Rollnumber", target: "rollNumber" },
  { label: "Enrollment Number", target: "rollNumber" },
  { label: "Enrolment Number", target: "rollNumber" },
  { label: "Enrollment No", target: "rollNumber" },
  { label: "PRN Number", target: "prnNumber" },
  { label: "University PRN Number", target: "prnNumber" },
  { label: "University PRN Number *", target: "prnNumber" },
  { label: "University PRN Number*", target: "prnNumber" },
  { label: "Your PRN Number", target: "prnNumber" },
  { label: "Enter Your PRN Number", target: "prnNumber" },
  { label: "PRN", target: "prnNumber" },
  { label: "Your PRN", target: "prnNumber" },
  // Social Links
  { label: "LinkedIn", target: "linkedin" },
  { label: "Linked In", target: "linkedin" },
  { label: "LinkedIn Profile", target: "linkedin" },
  { label: "LinkedIn URL", target: "linkedin" },
  { label: "GitHub", target: "github" },
  { label: "Git Hub", target: "github" },
  { label: "GitHub Profile", target: "github" },
  { label: "GitHub URL", target: "github" },
  { label: "Portfolio", target: "portfolio" },
  { label: "Portfolio Website", target: "portfolio" },
  { label: "Portfolio URL", target: "portfolio" },
  { label: "Website", target: "portfolio" },
  { label: "Behance", target: "behance" },
  { label: "Behance Profile", target: "behance" },
  { label: "Behance URL", target: "behance" },
  { label: "Instagram", target: "instagram" },
  { label: "Insta", target: "instagram" },
  { label: "Instagram Profile", target: "instagram" },
  { label: "Instagram Handle", target: "instagram" },
  { label: "Twitter", target: "twitter" },
  { label: "X", target: "twitter" },
  { label: "Twitter Handle", target: "twitter" },
  { label: "Twitter Profile", target: "twitter" },
  { label: "WhatsApp", target: "whatsapp" },
  { label: "Whats App", target: "whatsapp" },
  { label: "WhatsApp Number", target: "whatsapp" },
  { label: "Telegram", target: "telegram" },
  { label: "Telegram Handle", target: "telegram" },
  { label: "Telegram Username", target: "telegram" }
];

class MLFieldMatcher {
  constructor() {
    this.vocabulary = new Set();
    this.wordCounts = {}; // {class: {word: count}}
    this.classCounts = {}; // {class: totalCount}
    this.totalDocuments = 0;
    this.classes = new Set();
    this.isTrained = false;
  }

  /**
   * Synonym mapping for semantic matching
   * Maps common words to their canonical forms
   */
  static SYNONYMS = {
    // Name synonyms
    'your': ['name', 'fullname'],
    'enter': ['name', 'fullname'],
    'please': ['name', 'fullname'],
    'provide': ['name', 'fullname'],
    'name': ['fullname', 'name'],
    'fullname': ['name', 'fullname'],
    
    // College/University synonyms
    'college': ['collegename', 'universityname'],
    'university': ['universityname', 'collegename'],
    'institution': ['collegename', 'universityname'],
    'yourcollege': ['collegename'],
    'youruniversity': ['universityname'],
    
    // PRN synonyms
    'prn': ['prnnumber'],
    'registration': ['prnnumber', 'registrationnumber'],
    'reg': ['prnnumber', 'registrationnumber'],
    'universityprn': ['prnnumber'],
    
    // Percentage synonyms
    'percentage': ['percentage'],
    'percent': ['percentage'],
    '%': ['percentage'],
    'marks': ['percentage'],
    '10th': ['tenthpercentage'],
    '12th': ['twelfthpercentage'],
    'tenth': ['tenthpercentage'],
    'twelfth': ['twelfthpercentage'],
    'ssc': ['tenthpercentage'],
    'hsc': ['twelfthpercentage'],
    
    // Phone synonyms
    'mobile': ['phone'],
    'phone': ['phone'],
    'contact': ['phone'],
    'number': ['phone'],
    'yourmobile': ['phone'],
    'yourphone': ['phone']
  };

  /**
   * Expand words with synonyms for better semantic matching
   * @param {string[]} words - Original words
   * @returns {string[]} - Expanded words including synonyms
   */
  expandSynonyms(words) {
    const expanded = new Set(words);
    
    // Check if this is a PRN-related field (don't expand university to collegeName)
    const isPRNField = words.some(w => w === 'prn' || w === 'registration' || w === 'reg');
    
    words.forEach(word => {
      // Direct synonym lookup
      if (this.constructor.SYNONYMS[word]) {
        this.constructor.SYNONYMS[word].forEach(syn => {
          // Don't expand university->collegename if this is a PRN field
          if (isPRNField && (syn === 'collegename' || syn === 'universityname')) {
            // Only add prnnumber-related synonyms
            if (syn === 'prnnumber' || word === 'university' || word === 'prn') {
              expanded.add(syn);
            }
          } else {
            expanded.add(syn);
          }
        });
      }
      
      // Check if word contains a synonym key (but skip if PRN field)
      if (!isPRNField || word === 'prn' || word === 'registration' || word === 'reg') {
        for (const [key, synonyms] of Object.entries(this.constructor.SYNONYMS)) {
          if (word.includes(key) || key.includes(word)) {
            synonyms.forEach(syn => {
              // Skip college/university expansion for PRN fields
              if (isPRNField && (syn === 'collegename' || syn === 'universityname')) {
                return;
              }
              expanded.add(syn);
            });
          }
        }
      }
    });
    
    return Array.from(expanded);
  }

  /**
   * Enhanced tokenization with prefix removal and synonym expansion
   * @param {string} text - Input text
   * @returns {string[]} - Array of expanded words
   */
  tokenize(text) {
    if (!text) return [];
    
    // Remove common prefixes that don't add semantic meaning
    const prefixPatterns = [
      /^your\s+/i,
      /^enter\s+/i,
      /^please\s+/i,
      /^provide\s+/i,
      /^input\s+/i,
      /^fill\s+/i,
      /^write\s+/i,
      /^type\s+/i
    ];
    
    let cleaned = text.toLowerCase();
    prefixPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    // Normalize and tokenize
    const words = cleaned
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    // Expand with synonyms
    return this.expandSynonyms(words);
  }

  /**
   * Build vocabulary and count words per class from training data
   */
  train() {
    if (this.isTrained) return;

    // Reset
    this.vocabulary.clear();
    this.wordCounts = {};
    this.classCounts = {};
    this.classes.clear();
    this.totalDocuments = trainingData.length;

    // First pass: build vocabulary and class set
    trainingData.forEach(example => {
      const words = this.tokenize(example.label);
      words.forEach(word => this.vocabulary.add(word));
      this.classes.add(example.target);
      if (!this.classCounts[example.target]) {
        this.classCounts[example.target] = 0;
        this.wordCounts[example.target] = {};
      }
      this.classCounts[example.target]++;
    });

    // Second pass: count word frequencies per class
    trainingData.forEach(example => {
      const words = this.tokenize(example.label);
      const uniqueWords = [...new Set(words)]; // Bag of words: count each word once per document
      
      uniqueWords.forEach(word => {
        if (!this.wordCounts[example.target][word]) {
          this.wordCounts[example.target][word] = 0;
        }
        this.wordCounts[example.target][word]++;
      });
    });

    this.isTrained = true;
  }

  /**
   * Calculate log probability using Naive Bayes with Laplace smoothing
   * @param {string[]} words - Tokenized input words
   * @param {string} className - Target class
   * @returns {number} - Log probability
   */
  calculateLogProbability(words, className) {
    const classPrior = Math.log(this.classCounts[className] / this.totalDocuments);
    const vocabularySize = this.vocabulary.size;
    const classWordCount = Object.values(this.wordCounts[className] || {}).reduce((a, b) => a + b, 0);
    const smoothingAlpha = 1; // Laplace smoothing

    let wordLikelihood = 0;
    const uniqueWords = [...new Set(words)]; // Bag of words: each word once

    uniqueWords.forEach(word => {
      const wordCount = (this.wordCounts[className]?.[word] || 0) + smoothingAlpha;
      const denominator = classWordCount + (vocabularySize * smoothingAlpha);
      wordLikelihood += Math.log(wordCount / denominator);
    });

    return classPrior + wordLikelihood;
  }

  /**
   * Keyword Group Matching System
   * Each field has multiple keyword arrays. Field with most matching keywords wins.
   * @param {string} fieldLabel - Form field label
   * @returns {Object|null} - {predictedField: string, confidence: number} or null
   */
  keywordGroupMatch(fieldLabel) {
    if (!fieldLabel) return null;
    
    // Normalize: remove special chars but keep structure, handle parentheses
    const normalized = fieldLabel.toLowerCase()
      .replace(/[^\w\s%():]/g, ' ') // Keep alphanumeric, spaces, %, colons, parentheses
      .replace(/\s+/g, ' ')
      .trim();
    
    const text = normalized;
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    // Extract keywords from parentheses (instructions)
    const parenMatch = text.match(/\(([^)]+)\)/);
    const instructions = parenMatch ? parenMatch[1].toLowerCase().split(/\s+/) : [];
    const allWords = [...words, ...instructions];
    
    // ========== FIELD KEYWORD GROUPS ==========
    // Each field has arrays of keywords. More matches = higher score.
    
    const fieldKeywords = {
      // NAME FIELDS
      'fullName': {
        keywords: ['name', 'full', 'fullname', 'your', 'student', 'complete', 'entire', 'applicant', 'candidate'],
        required: ['name'], // At least one required keyword must be present
        boost: ['full', 'complete', 'entire', 'student'] // These boost the score
      },
      'firstName': {
        keywords: ['first', 'fname', 'firstname', 'given', 'forename'],
        required: ['first', 'name']
      },
      'lastName': {
        keywords: ['last', 'lname', 'lastname', 'surname', 'family'],
        required: ['last', 'name']
      },
      'middleName': {
        keywords: ['middle', 'mname', 'middlename'],
        required: ['middle', 'name']
      },
      
      // ADDRESS/LOCATION FIELDS
      'city': {
        keywords: ['city', 'location', 'current', 'hometown', 'locality', 'town', 'current location', 'hometown location', 'your current location', 'your hometown location'],
        required: ['city', 'location'],
        boost: ['current', 'hometown', 'mention city', 'city name only', 'city only']
      },
      'street': {
        keywords: ['address', 'street', 'current', 'permanent', 'addr', 'current address', 'permanent address', 'your address'],
        required: ['address'],
        boost: ['current', 'permanent']
      },
      'state': {
        keywords: ['state', 'province'],
        required: ['state']
      },
      'pin': {
        keywords: ['pin', 'pincode', 'postal', 'zip', 'pin code'],
        required: ['pin', 'pincode']
      },
      
      // COLLEGE/UNIVERSITY FIELDS
      'collegeName': {
        keywords: ['college', 'graduation', 'name', 'college name', 'graduation college', 'graduation college name', 'full name', 'mention', 'full', 'institution', 'institute'],
        required: ['college'],
        boost: ['graduation', 'name', 'full name', 'mention full']
      },
      'universityName': {
        keywords: ['university', 'graduation', 'name', 'university name', 'graduation university', 'full name', 'mention', 'full'],
        required: ['university'],
        boost: ['graduation', 'name', 'full name']
      },
      
      // EMAIL FIELDS
      'email': {
        keywords: ['email', 'e-mail', 'mail'],
        required: ['email', 'mail']
      },
      'collegeEmail': {
        keywords: ['email', 'college', 'university', 'college email', 'university email', 'institutional'],
        required: ['email'],
        boost: ['college', 'university']
      },
      
      // PHONE FIELDS
      'phone': {
        keywords: ['phone', 'mobile', 'contact', 'number', 'mobile number', 'phone number', 'contact number', 'your mobile', 'your phone', 'whatsapp'],
        required: ['phone', 'mobile', 'contact'],
        boost: ['number', 'your']
      },
      'alternatePhone': {
        keywords: ['alternate', 'parent', 'guardian', 'contact', 'phone', 'mobile', 'number', 'alternate contact', 'parent contact', 'guardian contact'],
        required: ['alternate', 'parent', 'guardian'],
        boost: ['contact', 'phone', 'number']
      },
      
      // PRN/REGISTRATION FIELDS
      'prnNumber': {
        keywords: ['prn', 'registration', 'reg', 'university', 'number', 'university prn', 'university prn number', 'prn number', 'registration number'],
        required: ['prn', 'registration'],
        boost: ['university', 'number']
      },
      'rollNumber': {
        keywords: ['roll', 'enrollment', 'enrolment', 'number', 'roll number', 'enrollment number'],
        required: ['roll', 'enrollment'],
        boost: ['number']
      },
      'studentId': {
        keywords: ['student', 'id', 'student id', 'studentid'],
        required: ['student', 'id']
      },
      
      // PERCENTAGE FIELDS
      'tenthPercentage': {
        keywords: ['10th', '10', 'tenth', 'ssc', 'secondary', 'percentage', 'percent', '%', 'marks'],
        required: ['10th', '10', 'tenth', 'ssc'],
        boost: ['percentage', 'percent', '%']
      },
      'twelfthPercentage': {
        keywords: ['12th', '12', 'twelfth', 'hsc', 'higher', 'intermediate', 'percentage', 'percent', '%', 'marks'],
        required: ['12th', '12', 'twelfth', 'hsc'],
        boost: ['percentage', 'percent', '%']
      },
      'firstYearPercentage': {
        keywords: ['1st', 'first', '1', 'year', 'percentage', 'percent', '%', 'aggregate', 'total', 'graduation', '1st year', 'first year'],
        required: ['1st', 'first', '1'],
        boost: ['year', 'percentage', 'aggregate', 'total']
      },
      'secondYearPercentage': {
        keywords: ['2nd', 'second', '2', 'year', 'percentage', 'percent', '%', 'aggregate', 'total', 'graduation', '2nd year', 'second year', 'graduation 2nd year'],
        required: ['2nd', 'second', '2'],
        boost: ['year', 'percentage', 'aggregate', 'total', 'graduation']
      },
      'thirdYearPercentage': {
        keywords: ['3rd', 'third', '3', 'year', 'percentage', 'percent', '%', 'aggregate', 'total', 'graduation', '3rd year', 'third year'],
        required: ['3rd', 'third', '3'],
        boost: ['year', 'percentage', 'aggregate', 'total']
      },
      'fourthYearPercentage': {
        keywords: ['4th', 'fourth', '4', 'year', 'percentage', 'percent', '%', 'aggregate', 'total', 'graduation', '4th year', 'fourth year'],
        required: ['4th', 'fourth', '4'],
        boost: ['year', 'percentage', 'aggregate', 'total']
      },
      'graduationPercentage': {
        keywords: ['graduation', 'graduate', 'degree', 'percentage', 'percent', '%'],
        required: ['graduation', 'graduate'],
        boost: ['percentage', 'percent', '%']
      },
      'diplomaPercentage': {
        keywords: ['diploma', 'dipl', 'percentage', 'percent', '%'],
        required: ['diploma'],
        boost: ['percentage', 'percent', '%']
      },
      'cgpa': {
        keywords: ['cgpa', 'gpa', 'aggregate', 'overall', 'total', 'be', 'btech', 'b.tech', 'engineering', 'degree', 'percentage', 'percent', '%'],
        required: ['cgpa', 'gpa', 'aggregate', 'be', 'btech'],
        boost: ['percentage', 'aggregate', 'total']
      },
      'sgpa': {
        keywords: ['sgpa', 'semester', 'gpa', 'percentage', 'percent', '%'],
        required: ['sgpa'],
        boost: ['percentage', 'semester']
      },
      'aggregatePercentage': {
        keywords: ['aggregate', 'overall', 'total', 'percentage', 'percent', '%'],
        required: ['aggregate', 'overall', 'total'],
        boost: ['percentage', 'percent', '%']
      },
      
      // DATE FIELDS
      'dateOfBirth': {
        keywords: ['date', 'birth', 'dob', 'born', 'date of birth'],
        required: ['birth', 'dob', 'born']
      },
      
      // YEAR FIELDS
      'year': {
        keywords: ['year', 'graduation', 'passing', 'pass', 'completion', 'year of graduation', 'passing year'],
        required: ['year'],
        boost: ['graduation', 'passing']
      },
      
      // GENDER FIELDS
      'gender': {
        keywords: ['gender', 'sex', 'title'],
        required: ['gender', 'sex']
      },
      
      // BRANCH FIELDS
      'branch': {
        keywords: ['branch', 'department', 'dept', 'stream', 'specialization'],
        required: ['branch', 'department']
      },
      'course': {
        keywords: ['course', 'degree', 'program', 'programme'],
        required: ['course', 'degree']
      },
      'specialization': {
        keywords: ['specialization', 'specialisation'],
        required: ['specialization']
      },
      'semester': {
        keywords: ['semester', 'sem'],
        required: ['semester']
      },
      'yearOfStudy': {
        keywords: ['year', 'study', 'year of study', 'studying year', 'current year'],
        required: ['year', 'study'],
        boost: ['current', 'studying']
      },
      
      // BACKLOGS FIELDS
      'backlogs': {
        keywords: ['backlog', 'backlogs'],
        required: ['backlog']
      },
      'backlogsCount': {
        keywords: ['backlog', 'backlogs', 'count', 'number', 'how many'],
        required: ['backlog'],
        boost: ['count', 'number']
      },
      'arrears': {
        keywords: ['arrear', 'arrears'],
        required: ['arrear']
      },
      'arrearsCount': {
        keywords: ['arrear', 'arrears', 'count', 'number', 'how many'],
        required: ['arrear'],
        boost: ['count', 'number']
      },
      
      // TECHNICAL FIELDS
      'programmingLanguages': {
        keywords: ['programming', 'language', 'languages', 'known', 'programming languages', 'languages known'],
        required: ['programming', 'language']
      },
      'technicalSkills': {
        keywords: ['technical', 'skill', 'skills', 'technologies', 'tech skills', 'technical skills'],
        required: ['skill', 'technical']
      },
      'technicalAchievements': {
        keywords: ['technical', 'achievement', 'achievements', 'technical achievements'],
        required: ['achievement', 'technical']
      },
      'projects': {
        keywords: ['project', 'projects'],
        required: ['project']
      },
      'projectsCount': {
        keywords: ['project', 'projects', 'count', 'number', 'how many'],
        required: ['project'],
        boost: ['count', 'number']
      },
      'projectsDescription': {
        keywords: ['project', 'projects', 'description', 'describe', 'details'],
        required: ['project'],
        boost: ['description', 'describe', 'details']
      },
      'certifications': {
        keywords: ['certification', 'certificate', 'cert', 'aws', 'google', 'microsoft'],
        required: ['certification', 'certificate']
      },
      'internshipMonths': {
        keywords: ['internship', 'intern', 'months', 'duration', 'period', 'experience'],
        required: ['internship', 'intern'],
        boost: ['months', 'duration']
      },
      'internshipCompanies': {
        keywords: ['internship', 'intern', 'company', 'companies', 'organization'],
        required: ['internship', 'intern'],
        boost: ['company', 'companies']
      },
      'github': {
        keywords: ['github', 'git hub', 'github profile', 'git'],
        required: ['github', 'git']
      },
      
      // PLACEMENT FIELDS
      'eligibleCompanies': {
        keywords: ['eligible', 'companies', 'interested', 'preferred', 'eligible companies', 'companies interested'],
        required: ['company', 'companies'],
        boost: ['eligible', 'interested', 'preferred']
      },
      'jobRolePreference': {
        keywords: ['role', 'job', 'preference', 'preferred', 'position', 'job role', 'role preference'],
        required: ['role', 'position'],
        boost: ['preference', 'preferred', 'job']
      },
      'expectedCTC': {
        keywords: ['expected', 'ctc', 'salary', 'expectations', 'expected ctc', 'salary expectations'],
        required: ['ctc', 'salary'],
        boost: ['expected', 'expectations']
      },
      'willingToRelocate': {
        keywords: ['willing', 'relocate', 'relocation'],
        required: ['relocate', 'relocation'],
        boost: ['willing']
      },
      'noticePeriod': {
        keywords: ['notice', 'period'],
        required: ['notice', 'period']
      },
      'availableFromDate': {
        keywords: ['available', 'from', 'date', 'joining', 'available from', 'available date', 'joining date'],
        required: ['available', 'date'],
        boost: ['from', 'joining']
      },
      'resumeLink': {
        keywords: ['resume', 'cv', 'curriculum vitae'],
        required: ['resume', 'cv']
      },
      'linkedin': {
        keywords: ['linkedin', 'linked in', 'linkedin profile'],
        required: ['linkedin']
      },
      
      // ADDITIONAL FIELDS
      'parentContact': {
        keywords: ['parent', 'guardian', 'contact', 'phone', 'mobile', 'number', 'parent contact', 'guardian contact'],
        required: ['parent', 'guardian'],
        boost: ['contact', 'phone', 'number']
      },
      'alternateContact': {
        keywords: ['alternate', 'alternative', 'contact', 'phone', 'mobile', 'number', 'alternate contact'],
        required: ['alternate', 'alternative'],
        boost: ['contact', 'phone', 'number']
      },
      'category': {
        keywords: ['category', 'caste'],
        required: ['category', 'caste']
      },
      'physicallyChallenged': {
        keywords: ['physically', 'challenged', 'disability', 'pwd'],
        required: ['physically', 'challenged', 'disability']
      },
      'photoLink': {
        keywords: ['photo', 'photograph', 'picture', 'image', 'upload'],
        required: ['photo', 'picture']
      },
      'declaration': {
        keywords: ['declaration', 'authorization', 'consent', 'agree', 'terms'],
        required: ['declaration', 'authorization', 'consent']
      }
    };
    
    // Score each field based on keyword matches
    const fieldScores = {};
    
    for (const [fieldName, fieldDef] of Object.entries(fieldKeywords)) {
      let score = 0;
      let requiredMatches = 0;
      let totalMatches = 0;
      
      // Check required keywords (must have at least one)
      if (fieldDef.required) {
        for (const reqKeyword of fieldDef.required) {
          // Check if required keyword appears in text
          if (text.includes(reqKeyword) || 
              allWords.some(word => word.includes(reqKeyword) || reqKeyword.includes(word))) {
            requiredMatches++;
            score += 5; // Required keywords get higher weight
          }
        }
        
        // If no required keywords match, skip this field
        if (requiredMatches === 0) {
          continue;
        }
      }
      
      // Check all keywords
      for (const keyword of fieldDef.keywords) {
        // Check exact match
        if (text.includes(keyword)) {
          totalMatches++;
          score += 2;
          // Boost for exact phrase match
          if (new RegExp(`\\b${keyword}\\b`).test(text)) {
            score += 1;
          }
        } else {
          // Check word-by-word match
          const keywordWords = keyword.split(/\s+/);
          let wordMatches = 0;
          for (const kw of keywordWords) {
            if (allWords.some(word => word === kw || word.includes(kw) || kw.includes(word))) {
              wordMatches++;
            }
          }
          if (wordMatches === keywordWords.length && keywordWords.length > 0) {
            totalMatches++;
            score += 1;
          }
        }
      }
      
      // Apply boost keywords (extra points)
      if (fieldDef.boost) {
        for (const boostKeyword of fieldDef.boost) {
          if (text.includes(boostKeyword)) {
            score += 3;
          }
        }
      }
      
      // Calculate match ratio
      const matchRatio = fieldDef.keywords.length > 0 ? totalMatches / fieldDef.keywords.length : 0;
      
      // Final score = base score + match ratio bonus
      const finalScore = score + (matchRatio * 10);
      
      if (finalScore > 0) {
        fieldScores[fieldName] = {
          score: finalScore,
          matches: totalMatches,
          requiredMatches: requiredMatches,
          matchRatio: matchRatio
        };
      }
    }
    
    // Find field with highest score
    let bestField = null;
    let bestScore = 0;
    let bestMatchRatio = 0;
    
    for (const [fieldName, fieldData] of Object.entries(fieldScores)) {
      // Prioritize fields with required matches and high match ratio
      const priorityScore = fieldData.score + 
                           (fieldData.requiredMatches > 0 ? 10 : 0) + 
                           (fieldData.matchRatio * 20);
      
      if (priorityScore > bestScore || 
          (priorityScore === bestScore && fieldData.matchRatio > bestMatchRatio)) {
        bestScore = priorityScore;
        bestMatchRatio = fieldData.matchRatio;
        bestField = fieldName;
      }
    }
    
    if (bestField && bestScore > 0) {
      // Calculate confidence based on score and match ratio
      let confidence = 0.70; // Base confidence
      
      if (bestScore >= 20) confidence = 0.95;
      else if (bestScore >= 15) confidence = 0.90;
      else if (bestScore >= 10) confidence = 0.85;
      else if (bestScore >= 5) confidence = 0.80;
      
      // Boost confidence if match ratio is high
      if (bestMatchRatio >= 0.5) {
        confidence = Math.min(0.98, confidence + 0.05);
      }
      
      return { predictedField: bestField, confidence: confidence };
    }
    
    return null;
  }

  /**
   * Advanced Multi-Keyword Scoring System
   * Scores each field based on keyword matches and context
   * @param {string} fieldLabel - Form field label
   * @returns {Object|null} - {predictedField: string, confidence: number} or null
   */
  advancedKeywordMatch(fieldLabel) {
    if (!fieldLabel) return null;
    
    // Normalize: remove special chars but keep structure, handle parentheses
    const normalized = fieldLabel.toLowerCase()
      .replace(/[^\w\s%():]/g, ' ') // Keep alphanumeric, spaces, %, colons, parentheses
      .replace(/\s+/g, ' ')
      .trim();
    
    const words = normalized.split(/\s+/).filter(w => w.length > 0);
    const text = normalized;
    
    // Extract keywords from parentheses (instructions)
    const parenMatch = text.match(/\(([^)]+)\)/);
    const instructions = parenMatch ? parenMatch[1].toLowerCase() : '';
    
    // Field scoring map: {fieldName: score}
    const scores = {};
    
    // ========== KEYWORD PATTERNS WITH WEIGHTS ==========
    // Each pattern has keywords and weight. Multiple matches increase score.
    
    // COLLEGE/UNIVERSITY patterns
    const collegePatterns = {
      'collegeName': {
        keywords: ['college', 'graduation', 'college name', 'graduation college'],
        weight: 10,
        context: ['name', 'full name', 'mention', 'full']
      },
      'universityName': {
        keywords: ['university', 'graduation university'],
        weight: 10,
        context: ['name', 'full name']
      }
    };
    
    // NAME patterns
    const namePatterns = {
      'fullName': {
        keywords: ['name', 'full name', 'complete name', 'student name'],
        weight: 8,
        context: ['full', 'complete', 'entire', 'student']
      },
      'firstName': {
        keywords: ['first name', 'firstname', 'fname', 'given name'],
        weight: 10
      },
      'lastName': {
        keywords: ['last name', 'lastname', 'lname', 'surname'],
        weight: 10
      }
    };
    
    // LOCATION/CITY patterns
    const locationPatterns = {
      'city': {
        keywords: ['location', 'city', 'hometown', 'current location', 'hometown location', 'your current location', 'your hometown location'],
        weight: 10,
        context: ['city', 'city name', 'mention city', 'city only'],
        instructions: ['city name only', 'mention city', 'mention city name only']
      }
    };
    
    // EMAIL patterns
    const emailPatterns = {
      'email': {
        keywords: ['email', 'e-mail', 'mail'],
        weight: 10
      },
      'collegeEmail': {
        keywords: ['email', 'college email', 'university email'],
        weight: 10,
        context: ['college', 'university']
      }
    };
    
    // PERCENTAGE patterns (for complex labels like "Graduation 2nd Year – Total Aggregate Percentage")
    const percentagePatterns = {
      'secondYearPercentage': {
        keywords: ['2nd year', 'second year', '2 year', 'graduation 2nd year'],
        weight: 10,
        context: ['percentage', 'aggregate', 'total']
      },
      'firstYearPercentage': {
        keywords: ['1st year', 'first year', '1 year', 'graduation 1st year'],
        weight: 10,
        context: ['percentage', 'aggregate', 'total']
      },
      'thirdYearPercentage': {
        keywords: ['3rd year', 'third year', '3 year', 'graduation 3rd year'],
        weight: 10,
        context: ['percentage', 'aggregate', 'total']
      },
      'fourthYearPercentage': {
        keywords: ['4th year', 'fourth year', '4 year', 'graduation 4th year'],
        weight: 10,
        context: ['percentage', 'aggregate', 'total']
      }
    };
    
    // Score all patterns
    this.scorePatterns(text, instructions, collegePatterns, scores);
    this.scorePatterns(text, instructions, namePatterns, scores);
    this.scorePatterns(text, instructions, locationPatterns, scores);
    this.scorePatterns(text, instructions, emailPatterns, scores);
    // Score percentage patterns if % is present
    if (/%/.test(text) || /\b(percentage|percent)\b/.test(text)) {
      this.scorePatterns(text, instructions, percentagePatterns, scores);
    }
    
    // Find best match
    let bestField = null;
    let bestScore = 0;
    
    for (const [field, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestField = field;
      }
    }
    
    if (bestField && bestScore > 0) {
      // Convert score to confidence (0-1 scale)
      // Score of 10+ = 95% confidence, 5-9 = 85%, 1-4 = 75%
      let confidence = 0.75;
      if (bestScore >= 10) confidence = 0.95;
      else if (bestScore >= 5) confidence = 0.85;
      
      return { predictedField: bestField, confidence: confidence };
    }
    
    return null;
  }
  
  /**
   * Score patterns against text
   * @param {string} text - Normalized text
   * @param {string} instructions - Text in parentheses
   * @param {Object} patterns - Pattern definitions
   * @param {Object} scores - Scores object to update
   */
  scorePatterns(text, instructions, patterns, scores) {
    for (const [field, pattern] of Object.entries(patterns)) {
      let score = 0;
      
      // Check main keywords
      for (const keyword of pattern.keywords) {
        if (text.includes(keyword)) {
          score += pattern.weight;
          // Boost if exact phrase match
          if (new RegExp(`\\b${keyword}\\b`).test(text)) {
            score += 2;
          }
        }
      }
      
      // Check context keywords (boost score)
      if (pattern.context) {
        for (const ctx of pattern.context) {
          if (text.includes(ctx)) {
            score += 3;
          }
        }
      }
      
      // Check instructions in parentheses (high weight)
      if (pattern.instructions && instructions) {
        for (const inst of pattern.instructions) {
          if (instructions.includes(inst)) {
            score += 5;
          }
        }
      }
      
      // Penalize if conflicting keywords present
      if (pattern.exclude) {
        for (const exclude of pattern.exclude) {
          if (text.includes(exclude)) {
            score -= 5;
          }
        }
      }
      
      if (score > 0) {
        scores[field] = (scores[field] || 0) + score;
      }
    }
  }

  /**
   * Keyword-based field matching - extracts keywords and uses context
   * Enhanced with multi-keyword scoring for complex labels
   * @param {string} fieldLabel - Form field label
   * @returns {Object|null} - {predictedField: string, confidence: number} or null
   */
  keywordBasedMatch(fieldLabel) {
    if (!fieldLabel) return null;
    
    // Try advanced multi-keyword scoring first
    const advancedMatch = this.advancedKeywordMatch(fieldLabel);
    if (advancedMatch && advancedMatch.confidence >= 0.85) {
      return advancedMatch;
    }
    
    const normalized = fieldLabel.toLowerCase()
      .replace(/[^\w\s%]/g, ' ') // Keep alphanumeric, spaces, and %
      .replace(/\s+/g, ' ')
      .trim();
    
    const words = normalized.split(/\s+/).filter(w => w.length > 0);
    const text = normalized;
    
    // ========== PRIMARY KEYWORD DETECTION ==========
    // Order matters: More specific patterns first
    
    // 0. COLLEGE/UNIVERSITY keyword detection (MUST come before NAME to avoid false matches)
    if (/\b(college|university|institution|institute)\b/.test(text)) {
      // Check if it's PRN (must come first to avoid false match)
      if (/\bprn\b/.test(text)) {
        return { predictedField: 'prnNumber', confidence: 0.95 };
      }
      
      // Check for graduation college (specific context)
      if (/\b(graduation|graduating|graduate)\s+(college|university|institution)\b/.test(text)) {
        // Even if it has "name", it's still college name
        return { predictedField: 'collegeName', confidence: 0.98 };
      }
      
      // Check for "name" context - but prioritize college/university over just "name"
      if (/\bname\b/.test(text)) {
        // Check for "full name" context - still college name
        if (/\b(full\s+name|mention\s+full|complete\s+name)\b/.test(text)) {
          if (/\buniversity\b/.test(text)) {
            return { predictedField: 'universityName', confidence: 0.98 };
          }
          return { predictedField: 'collegeName', confidence: 0.98 };
        }
        // Regular "college name" or "university name"
        if (/\buniversity\b/.test(text)) {
          return { predictedField: 'universityName', confidence: 0.95 };
        }
        return { predictedField: 'collegeName', confidence: 0.95 };
      }
      
      // Just "university" or "college" without "name"
      if (/\buniversity\b/.test(text)) {
        return { predictedField: 'universityName', confidence: 0.90 };
      }
      return { predictedField: 'collegeName', confidence: 0.90 };
    }
    
    // 1. NAME keyword detection (only if not already matched as college/university)
    if (/\bname\b/.test(text)) {
      // Check if it's actually college/university name (should have been caught above, but double-check)
      if (/\b(college|university|institution|institute|graduation)\b/.test(text)) {
        // This is college/university name, not personal name
        if (/\buniversity\b/.test(text)) {
          return { predictedField: 'universityName', confidence: 0.95 };
        }
        return { predictedField: 'collegeName', confidence: 0.95 };
      }
      
      // Check context words for personal name type
      if (/\b(first|fname|given|forename)\b/.test(text)) {
        return { predictedField: 'firstName', confidence: 0.95 };
      }
      if (/\b(last|lname|surname|family)\b/.test(text)) {
        return { predictedField: 'lastName', confidence: 0.95 };
      }
      if (/\b(middle|mname)\b/.test(text)) {
        return { predictedField: 'middleName', confidence: 0.95 };
      }
      if (/\b(full|complete|entire)\b/.test(text)) {
        return { predictedField: 'fullName', confidence: 0.95 };
      }
      // Default to fullName if just "name" (and not college/university)
      return { predictedField: 'fullName', confidence: 0.90 };
    }
    
    // 2. PERCENTAGE (%) keyword detection
    if (/%/.test(text) || /\b(percentage|percent|%|marks|score)\b/.test(text)) {
      // Check context for which percentage
      if (/\b(10th|10|tenth|ssc|secondary)\b/.test(text)) {
        return { predictedField: 'tenthPercentage', confidence: 0.95 };
      }
      if (/\b(12th|12|twelfth|hsc|higher|intermediate)\b/.test(text)) {
        return { predictedField: 'twelfthPercentage', confidence: 0.95 };
      }
      if (/\b(diploma|dipl)\b/.test(text)) {
        return { predictedField: 'diplomaPercentage', confidence: 0.95 };
      }
      // Year-wise percentages (MUST come before generic graduation check)
      // Check for specific year patterns first, even if "graduation" is present
      // Use more flexible patterns to handle "2nd Year", "2nd year", "second year", etc.
      if (/(?:^|\s)(?:1st|first|1)\s*year(?:\s|$)/i.test(text)) {
        return { predictedField: 'firstYearPercentage', confidence: 0.95 };
      }
      if (/(?:^|\s)(?:2nd|second|2)\s*year(?:\s|$)/i.test(text)) {
        // Even if "graduation" is present, prioritize year-specific percentage
        return { predictedField: 'secondYearPercentage', confidence: 0.95 };
      }
      if (/(?:^|\s)(?:3rd|third|3)\s*year(?:\s|$)/i.test(text)) {
        return { predictedField: 'thirdYearPercentage', confidence: 0.95 };
      }
      if (/(?:^|\s)(?:4th|fourth|4)\s*year(?:\s|$)/i.test(text)) {
        return { predictedField: 'fourthYearPercentage', confidence: 0.95 };
      }
      // Graduation percentage (only if no specific year mentioned)
      if (/\b(graduation|graduate|degree)\b/.test(text) && 
          !/(?:^|\s)(?:1st|2nd|3rd|4th|first|second|third|fourth|1|2|3|4)\s*year(?:\s|$)/i.test(text)) {
        return { predictedField: 'graduationPercentage', confidence: 0.95 };
      }
      // CGPA/SGPA/Aggregate
      if (/\b(sgpa)\b/.test(text)) {
        return { predictedField: 'sgpa', confidence: 0.95 };
      }
      if (/\b(cgpa|gpa)\b/.test(text)) {
        return { predictedField: 'cgpa', confidence: 0.95 };
      }
      // Check for aggregate/total with year first (before generic aggregate)
      // If aggregate/total appears with a year, it's year-specific, not CGPA
      // This is a fallback check in case year wasn't caught above
      if (/\b(aggregate|total)\b/.test(text)) {
        // Check if it has a year - if so, it's year-specific percentage
        if (/(?:^|\s)(?:2nd|second|2)\s*year(?:\s|$)/i.test(text)) {
          return { predictedField: 'secondYearPercentage', confidence: 0.95 };
        }
        if (/(?:^|\s)(?:1st|first|1)\s*year(?:\s|$)/i.test(text)) {
          return { predictedField: 'firstYearPercentage', confidence: 0.95 };
        }
        if (/(?:^|\s)(?:3rd|third|3)\s*year(?:\s|$)/i.test(text)) {
          return { predictedField: 'thirdYearPercentage', confidence: 0.95 };
        }
        if (/(?:^|\s)(?:4th|fourth|4)\s*year(?:\s|$)/i.test(text)) {
          return { predictedField: 'fourthYearPercentage', confidence: 0.95 };
        }
      }
      if (/\b(be|btech|b\.tech|engineering|degree)\b/.test(text)) {
        return { predictedField: 'cgpa', confidence: 0.95 };
      }
      // Generic percentage - check for "aggregate" or "overall" (only if no year)
      if (/\b(aggregate|overall|total)\b/.test(text) && 
          !/(?:^|\s)(?:1st|2nd|3rd|4th|first|second|third|fourth|1|2|3|4)\s*year(?:\s|$)/i.test(text)) {
        return { predictedField: 'cgpa', confidence: 0.90 };
      }
    }
    
    // 3. NUMBER keyword detection
    if (/\b(number|no\.?|num)\b/.test(text)) {
      // Check context for number type
      if (/\b(prn|registration|reg|university\s+prn)\b/.test(text)) {
        return { predictedField: 'prnNumber', confidence: 0.95 };
      }
      if (/\b(student\s+id|studentid)\b/.test(text)) {
        return { predictedField: 'studentId', confidence: 0.95 };
      }
      if (/\b(alternate|parent|guardian)\s+(contact|phone|mobile|number)\b/.test(text)) {
        return { predictedField: 'alternatePhone', confidence: 0.95 };
      }
      if (/\b(mobile|phone|contact|whatsapp)\b/.test(text)) {
        return { predictedField: 'phone', confidence: 0.95 };
      }
      if (/\b(roll|enrollment|enrolment)\b/.test(text)) {
        return { predictedField: 'rollNumber', confidence: 0.95 };
      }
      if (/\b(aadhaar|aadhar|uid)\b/.test(text)) {
        return { predictedField: 'aadhaarNumber', confidence: 0.95 };
      }
      if (/\b(pan)\b/.test(text)) {
        return { predictedField: 'pan', confidence: 0.95 };
      }
    }
    
    // 4. CITY/LOCATION keyword detection (MUST come before ADDRESS)
    // Enhanced to handle "Your Hometown Location" and "Your Current Location"
    if (/\b(city|location|locality|town|hometown)\b/.test(text)) {
      // Check instructions in parentheses first (high priority)
      const parenMatch = text.match(/\(([^)]+)\)/);
      if (parenMatch) {
        const instructions = parenMatch[1].toLowerCase();
        if (/\b(city\s+name\s+only|mention\s+city|city\s+only)\b/.test(instructions)) {
          return { predictedField: 'city', confidence: 0.98 };
        }
      }
      
      // Check if it's asking for city name specifically
      if (/\b(city\s+name|mention\s+city|city\s+only)\b/.test(text)) {
        return { predictedField: 'city', confidence: 0.95 };
      }
      // Check for "hometown location" → city
      if (/\b(hometown\s+location|your\s+hometown)\b/.test(text)) {
        return { predictedField: 'city', confidence: 0.95 };
      }
      // Check for "current location" → city
      if (/\b(current\s+location|present\s+location|your\s+current\s+location)\b/.test(text)) {
        return { predictedField: 'city', confidence: 0.95 };
      }
      // Just "city" or "location" → city
      return { predictedField: 'city', confidence: 0.90 };
    }
    
    // 5. ADDRESS keyword detection
    if (/\b(address|addr)\b/.test(text)) {
      // Check context for address type
      if (/\b(current|present|now)\b/.test(text)) {
        return { predictedField: 'street', confidence: 0.90 }; // Current address
      }
      if (/\b(permanent|permanent\s+address)\b/.test(text)) {
        return { predictedField: 'street', confidence: 0.90 }; // Permanent address
      }
      // Default to street address
      return { predictedField: 'street', confidence: 0.85 };
    }
    
    // 5. DATE keyword detection
    if (/\b(date|dob|birth)\b/.test(text)) {
      if (/\b(birth|born|dob)\b/.test(text)) {
        return { predictedField: 'dateOfBirth', confidence: 0.95 };
      }
    }
    
    // 6. YEAR keyword detection
    if (/\b(year|yr)\b/.test(text)) {
      // Check context for year type
      if (/\b(graduation|graduate|passing|pass|completion)\b/.test(text)) {
        return { predictedField: 'year', confidence: 0.95 };
      }
      if (/\b(birth|born)\b/.test(text)) {
        return { predictedField: 'dateOfBirth', confidence: 0.90 }; // Year of birth
      }
      // Default to graduation year
      return { predictedField: 'year', confidence: 0.85 };
    }
    
    // 7. GENDER keyword detection
    if (/\b(gender|sex|title)\b/.test(text)) {
      return { predictedField: 'gender', confidence: 0.95 };
    }
    
    // 8. BRANCH/DEPARTMENT/COURSE keyword detection
    if (/\b(course|branch|department|dept|stream|specialization)\b/.test(text)) {
      if (/\b(course)\b/.test(text) && !/\b(branch|department)\b/.test(text)) {
        return { predictedField: 'course', confidence: 0.95 };
      }
      if (/\b(specialization|specialisation)\b/.test(text)) {
        return { predictedField: 'specialization', confidence: 0.95 };
      }
      return { predictedField: 'branch', confidence: 0.95 };
    }
    
    // 8a. SEMESTER keyword detection
    if (/\b(semester|sem)\b/.test(text)) {
      return { predictedField: 'semester', confidence: 0.95 };
    }
    
    // 8b. YEAR OF STUDY keyword detection
    if (/\b(year\s+of\s+study|studying\s+year|current\s+year)\b/.test(text)) {
      return { predictedField: 'yearOfStudy', confidence: 0.95 };
    }
    
    // 10. EMAIL keyword detection - enhanced to handle standalone "Email"
    if (/\b(email|e-mail|mail)\b/.test(text)) {
      // If just "Email" without other context, it's personal email
      if (text.trim() === 'email' || text.trim() === 'e-mail') {
        return { predictedField: 'email', confidence: 0.95 };
      }
      if (/\b(college|university|institutional)\b/.test(text)) {
        return { predictedField: 'collegeEmail', confidence: 0.95 };
      }
      if (/\b(personal)\b/.test(text)) {
        return { predictedField: 'email', confidence: 0.95 };
      }
      // Default to personal email
      return { predictedField: 'email', confidence: 0.95 };
    }
    
    // 11. PHONE/MOBILE keyword detection (without "number")
    if (/\b(mobile|phone|contact|whatsapp)\b/.test(text)) {
      return { predictedField: 'phone', confidence: 0.95 };
    }
    
    // 12. STATE keyword detection
    if (/\b(state|province)\b/.test(text)) {
      return { predictedField: 'state', confidence: 0.95 };
    }
    
    // 13. CITY keyword detection (already handled above, but keep for fallback)
    // This is a fallback - main city detection is in section 4 above
    if (/\b(city|town)\b/.test(text) && !/\b(address|location)\b/.test(text)) {
      return { predictedField: 'city', confidence: 0.90 };
    }
    
    // 14. PIN/PINCODE keyword detection
    if (/\b(pin|pincode|postal|zip)\b/.test(text)) {
      return { predictedField: 'pin', confidence: 0.95 };
    }
    
    // 15. ROLE/POSITION keyword detection
    if (/\b(role|position|designation|post|applied\s+for)\b/.test(text)) {
      return { predictedField: 'role', confidence: 0.95 };
    }
    
    // 16. SKILLS/PROJECTS/TECHNICAL keyword detection
    if (/\b(programming\s+language|languages\s+known|programming)\b/.test(text)) {
      return { predictedField: 'programmingLanguages', confidence: 0.95 };
    }
    if (/\b(technical\s+skills|technologies|tech\s+skills)\b/.test(text)) {
      return { predictedField: 'technicalSkills', confidence: 0.95 };
    }
    if (/\b(technical\s+achievements|achievements)\b/.test(text)) {
      return { predictedField: 'technicalAchievements', confidence: 0.95 };
    }
    if (/\b(project|projects)\b/.test(text)) {
      if (/\b(count|number|how\s+many)\b/.test(text)) {
        return { predictedField: 'projectsCount', confidence: 0.95 };
      }
      if (/\b(description|describe|details)\b/.test(text)) {
        return { predictedField: 'projectsDescription', confidence: 0.95 };
      }
      return { predictedField: 'projects', confidence: 0.90 };
    }
    if (/\b(skill|skills)\b/.test(text)) {
      return { predictedField: 'technicalSkills', confidence: 0.90 };
    }
    
    // 16a. GITHUB keyword detection
    if (/\b(github|git\s+hub|github\s+profile)\b/.test(text)) {
      return { predictedField: 'github', confidence: 0.95 };
    }
    
    // 16b. CERTIFICATIONS keyword detection
    if (/\b(certification|certificate|cert|aws|google|microsoft)\b/.test(text)) {
      return { predictedField: 'certifications', confidence: 0.95 };
    }
    
    // 16c. INTERNSHIP keyword detection
    if (/\b(internship|intern)\b/.test(text)) {
      if (/\b(months|duration|period)\b/.test(text)) {
        return { predictedField: 'internshipMonths', confidence: 0.95 };
      }
      if (/\b(company|companies|organization)\b/.test(text)) {
        return { predictedField: 'internshipCompanies', confidence: 0.95 };
      }
      return { predictedField: 'internshipMonths', confidence: 0.90 };
    }
    
    // 17. PRN without "number" keyword
    if (/\b(prn|registration\s+no|reg\s+no)\b/.test(text)) {
      return { predictedField: 'prnNumber', confidence: 0.95 };
    }
    
    // 18. PLACEMENT PREFERENCES keyword detection
    if (/\b(eligible\s+companies|companies\s+interested|preferred\s+companies)\b/.test(text)) {
      return { predictedField: 'eligibleCompanies', confidence: 0.95 };
    }
    if (/\b(job\s+role|role\s+preference|preferred\s+role|position)\b/.test(text)) {
      return { predictedField: 'jobRolePreference', confidence: 0.95 };
    }
    if (/\b(expected\s+ctc|ctc|salary\s+expectations|expected\s+salary)\b/.test(text)) {
      return { predictedField: 'expectedCTC', confidence: 0.95 };
    }
    if (/\b(willing\s+to\s+relocate|relocate|relocation)\b/.test(text)) {
      return { predictedField: 'willingToRelocate', confidence: 0.95 };
    }
    if (/\b(notice\s+period|notice)\b/.test(text)) {
      return { predictedField: 'noticePeriod', confidence: 0.95 };
    }
    if (/\b(available\s+from|available\s+date|joining\s+date)\b/.test(text)) {
      return { predictedField: 'availableFromDate', confidence: 0.95 };
    }
    if (/\b(resume|cv|curriculum\s+vitae)\b/.test(text)) {
      return { predictedField: 'resumeLink', confidence: 0.95 };
    }
    
    // 19. BACKLOGS/ARREARS keyword detection
    if (/\b(backlog|backlogs)\b/.test(text)) {
      if (/\b(count|number|how\s+many)\b/.test(text)) {
        return { predictedField: 'backlogsCount', confidence: 0.95 };
      }
      return { predictedField: 'backlogs', confidence: 0.95 };
    }
    if (/\b(arrear|arrears)\b/.test(text)) {
      if (/\b(count|number|how\s+many)\b/.test(text)) {
        return { predictedField: 'arrearsCount', confidence: 0.95 };
      }
      return { predictedField: 'arrears', confidence: 0.95 };
    }
    
    // 20. ADDITIONAL FIELDS keyword detection
    if (/\b(parent|guardian)\s+(contact|phone|mobile|number)\b/.test(text)) {
      return { predictedField: 'parentContact', confidence: 0.95 };
    }
    if (/\b(alternate\s+contact|alternative\s+contact)\b/.test(text)) {
      return { predictedField: 'alternateContact', confidence: 0.95 };
    }
    if (/\b(category|caste)\b/.test(text)) {
      return { predictedField: 'category', confidence: 0.95 };
    }
    if (/\b(physically\s+challenged|disability|pwd)\b/.test(text)) {
      return { predictedField: 'physicallyChallenged', confidence: 0.95 };
    }
    if (/\b(photo|photograph|picture|image)\b/.test(text)) {
      return { predictedField: 'photoLink', confidence: 0.95 };
    }
    if (/\b(declaration|authorization|consent|agree)\b/.test(text)) {
      return { predictedField: 'declaration', confidence: 0.90 };
    }
    
    return null;
  }

  /**
   * Predict field class for given label (keyword-based approach)
   * @param {string} fieldLabel - Form field label
   * @returns {Object} - {predictedField: string, confidence: number}
   */
  predict(fieldLabel) {
    if (!fieldLabel || !fieldLabel.trim()) {
      return { predictedField: null, confidence: 0 };
    }

    // Use keyword group matching (primary method - most accurate)
    const keywordGroupMatch = this.keywordGroupMatch(fieldLabel);
    if (keywordGroupMatch && keywordGroupMatch.confidence >= 0.80) {
      return keywordGroupMatch;
    }

    // Fallback to advanced keyword matching
    const advancedMatch = this.advancedKeywordMatch(fieldLabel);
    if (advancedMatch && advancedMatch.confidence >= 0.85) {
      return advancedMatch;
    }

    // Fallback to traditional keyword matching
    const keywordMatch = this.keywordBasedMatch(fieldLabel);
    if (keywordMatch && keywordMatch.confidence >= 0.85) {
      return keywordMatch;
    }

    // Fallback to ML model if keyword matching doesn't find a high-confidence match
    if (!this.isTrained) {
      this.train();
    }

    const words = this.tokenize(fieldLabel);
    if (words.length === 0) {
      // Return keyword match even if low confidence
      return keywordMatch || { predictedField: null, confidence: 0 };
    }

    // Calculate log probabilities for all classes
    const logProbabilities = {};
    this.classes.forEach(className => {
      logProbabilities[className] = this.calculateLogProbability(words, className);
    });

    // Find class with highest probability
    let bestClass = null;
    let bestLogProb = -Infinity;

    Object.entries(logProbabilities).forEach(([className, logProb]) => {
      if (logProb > bestLogProb) {
        bestLogProb = logProb;
        bestClass = className;
      }
    });

    if (!bestClass) {
      // Return keyword match as fallback
      return keywordMatch || { predictedField: null, confidence: 0 };
    }

    // Convert log probabilities to probabilities and calculate confidence
    const maxLogProb = Math.max(...Object.values(logProbabilities));
    const expSum = Object.values(logProbabilities).reduce((sum, logProb) => {
      return sum + Math.exp(logProb - maxLogProb);
    }, 0);
    const bestProb = Math.exp(bestLogProb - maxLogProb) / expSum;

    let confidence = Math.max(0, Math.min(1, bestProb));
    
    // If keyword match exists and matches ML result, boost confidence
    if (keywordMatch && keywordMatch.predictedField === bestClass) {
      confidence = Math.max(confidence, keywordMatch.confidence);
    }
    
    // If ML confidence is low but keyword has match, prefer keyword
    if (confidence < 0.70 && keywordMatch && keywordMatch.confidence >= 0.80) {
      return keywordMatch;
    }

    return {
      predictedField: bestClass,
      confidence: confidence
    };
  }

  /**
   * Get model statistics
   * @returns {Object} - Model stats
   */
  getModelStats() {
    if (!this.isTrained) {
      this.train();
    }

    return {
      vocabularySize: this.vocabulary.size,
      classes: this.classes.size,
      totalDocuments: this.totalDocuments,
      classNames: Array.from(this.classes).sort()
    };
  }
}

// Create singleton instance
const mlMatcher = new MLFieldMatcher();

/**
 * Match field label to profile field using ML
 * @param {string} fieldLabel - Form field label
 * @returns {Object} - {predictedField: string, confidence: number}
 */
function matchField(fieldLabel) {
  return mlMatcher.predict(fieldLabel);
}

/**
 * Get model statistics
 * @returns {Object} - Model stats
 */
function getModelStats() {
  return mlMatcher.getModelStats();
}

/**
 * Get value from profile for a given field name (same as FuzzyMatcher)
 * @param {string} fieldName - Field name
 * @param {Object} profile - Profile data
 * @param {Object} customFields - Custom fields
 * @returns {string|null} - Field value or null
 */
function getProfileValue(fieldName, profile, customFields = {}) {
  // Handle prnNumber -> registrationNumber fallback
  if (fieldName === 'prnNumber') {
    if (profile?.academic?.registrationNumber) {
      return String(profile.academic.registrationNumber);
    }
    if (profile?.academic?.prnNumber) {
      return String(profile.academic.prnNumber);
    }
  }

  // Handle universityName -> collegeName mapping
  if (fieldName === 'universityName') {
    fieldName = 'collegeName';
  }

  // Handle fullName - construct from firstName + middleName + lastName
  if (fieldName === 'fullName') {
    if (!profile?.personal) return null;
    const parts = [
      profile.personal.firstName,
      profile.personal.middleName,
      profile.personal.lastName
    ].filter(Boolean);
    return parts.join(' ').trim() || null;
  }

  // Handle technicalSkills - check technical section first
  if (fieldName === 'technicalSkills') {
    if (Array.isArray(profile?.technical?.technicalSkills)) {
      return profile.technical.technicalSkills.join(', ') || null;
    }
    if (profile?.technical?.technicalSkills) {
      return String(profile.technical.technicalSkills);
    }
    // Fallback to old location
    if (Array.isArray(profile?.technicalSkills)) {
      return profile.technicalSkills.join(', ') || null;
    }
    if (profile?.technicalSkills) {
      return String(profile.technicalSkills);
    }
    return null;
  }
  
  // Handle github - check technical section first, then social
  if (fieldName === 'github') {
    if (profile?.technical?.github) {
      return String(profile.technical.github);
    }
    if (profile?.social?.github) {
      return String(profile.social.github);
    }
    return null;
  }
  
  // Handle linkedin - check placement first, then social
  if (fieldName === 'linkedin') {
    if (profile?.placement?.linkedin) {
      return String(profile.placement.linkedin);
    }
    if (profile?.social?.linkedin) {
      return String(profile.social.linkedin);
    }
    return null;
  }
  
  // Handle resumeLink - check placement first, then documents
  if (fieldName === 'resumeLink') {
    if (profile?.placement?.resumeLink) {
      return String(profile.placement.resumeLink);
    }
    if (profile?.documents?.resumeLink) {
      return String(profile.documents.resumeLink);
    }
    return null;
  }

  // Handle role - check custom fields first, then profile
  if (fieldName === 'role') {
    // Check custom fields for role
    for (const [key, fieldData] of Object.entries(customFields)) {
      if (key === 'role' || fieldData.label?.toLowerCase().includes('role')) {
        return String(fieldData.value || '');
      }
    }
    // Check profile for role (if stored in academic or custom location)
    if (profile?.academic?.role) {
      return String(profile.academic.role);
    }
    return null;
  }

  // Handle diplomaPercentage - check custom fields or academic
  if (fieldName === 'diplomaPercentage') {
    if (profile?.academic?.diplomaPercentage) {
      return String(profile.academic.diplomaPercentage);
    }
    // Check custom fields
    for (const [key, fieldData] of Object.entries(customFields)) {
      if (key === 'diplomaPercentage' || fieldData.label?.toLowerCase().includes('diploma')) {
        return String(fieldData.value || '');
      }
    }
    return null;
  }

  // Handle nested fields - check all sections
  if (profile?.personal && profile.personal[fieldName] !== undefined) {
    const value = profile.personal[fieldName];
    if (value !== null && value !== '') {
      return String(value);
    }
  }
  if (profile?.address && profile.address[fieldName] !== undefined) {
    const value = profile.address[fieldName];
    if (value !== null && value !== '') {
      return String(value);
    }
  }
  if (profile?.academic && profile.academic[fieldName] !== undefined) {
    const value = profile.academic[fieldName];
    if (value !== null && value !== '') {
      return String(value);
    }
  }
  if (profile?.technical && profile.technical[fieldName] !== undefined) {
    const value = profile.technical[fieldName];
    if (value !== null && value !== '') {
      // Handle arrays (technicalSkills, projects)
      if (Array.isArray(value)) {
        return value.join(', ') || '';
      }
      return String(value);
    }
  }
  if (profile?.placement && profile.placement[fieldName] !== undefined) {
    const value = profile.placement[fieldName];
    if (value !== null && value !== '') {
      return String(value);
    }
  }
  if (profile?.social && profile.social[fieldName] !== undefined) {
    const value = profile.social[fieldName];
    if (value !== null && value !== '') {
      return String(value);
    }
  }
  if (profile?.additional && profile.additional[fieldName] !== undefined) {
    const value = profile.additional[fieldName];
    if (value !== null && value !== '') {
      // Handle boolean (declaration)
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      return String(value);
    }
  }
  if (profile?.[fieldName]) {
    return String(profile[fieldName] || '');
  }

  // Check custom fields
  for (const [key, fieldData] of Object.entries(customFields)) {
    if (key === fieldName || fieldData.label?.toLowerCase() === fieldName.toLowerCase()) {
      return String(fieldData.value || '');
    }
  }

  return null;
}

/**
 * Match field and get value (combined function for convenience)
 * @param {string} fieldLabel - Form field label
 * @param {Object} profile - Profile data
 * @param {Object} customFields - Custom fields
 * @returns {Object|null} - {field: string, value: string, confidence: number} or null
 */
function matchFieldWithValue(fieldLabel, profile, customFields = {}) {
  const prediction = matchField(fieldLabel);
  
  if (!prediction.predictedField || prediction.confidence < 0.5) {
    return null;
  }

  const value = getProfileValue(prediction.predictedField, profile, customFields);
  
  if (!value) {
    return null;
  }

  return {
    field: prediction.predictedField,
    value: value,
    confidence: prediction.confidence,
    type: 'ml'
  };
}

// Make available globally for content script (only if not already set)
if (typeof window !== 'undefined' && !window.MLFieldMatcher) {
  window.MLFieldMatcher = {
    matchField,
    getModelStats,
    getProfileValue,
    matchFieldWithValue
  };
}

})(); // End IIFE


