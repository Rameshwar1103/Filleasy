/**
 * Profile Manager - Manages user profile data structure
 */

class ProfileManager {
  /**
   * Get default profile structure
   * @returns {Object} - Default profile
   */
  static getDefaultProfile() {
    return {
      // Core Personal Fields
      personal: {
        firstName: '',
        middleName: '',
        lastName: '',
        fullName: '', // Full Name / Student Name
        dateOfBirth: '', // Date of Birth / DOB
        gender: '',
        bloodGroup: '',
        phone: '', // Phone Number / Mobile Number / Contact Number
        alternatePhone: '', // Alternate Contact Number / Parent/Guardian Contact
        email: '', // Email ID (Personal / College)
        collegeEmail: '', // College Email
        aadhaarNumber: '',
        pan: '',
        studentId: '', // Student ID
        prnNumber: '', // PRN / Roll Number / University PRN
        rollNumber: '', // Roll Number
        category: '', // Category (General/OBC/SC/ST)
        physicallyChallenged: '', // Physically Challenged (Yes/No)
        photoLink: '' // Photo Upload
      },
      address: {
        house: '',
        street: '', // Address (Current / Permanent)
        city: '', // City
        state: '', // State
        pin: '', // PIN Code
        country: 'India',
        currentAddress: '', // Current Address
        permanentAddress: '' // Permanent Address
      },
      // Academic Fields
      academic: {
        // 10th / SSC
        tenthBoard: '',
        tenthYear: '',
        tenthPercentage: '', // 10th Percentage / SSC Marks
        
        // 12th / HSC
        twelfthBoard: '',
        twelfthYear: '',
        twelfthPercentage: '', // 12th Percentage / HSC Marks
        twelfthStream: '',
        
        // College/University
        collegeName: '', // University Name / College Name / Institution
        universityName: '',
        course: '', // Course / Branch / Specialization (B.Tech CSE, etc.)
        branch: '', // Branch / Specialization
        specialization: '',
        
        // Academic Progress
        semester: '', // Semester / Year of Study
        year: '', // Year of Study
        yearOfStudy: '',
        
        // Performance
        cgpa: '', // CGPA / SGPA / Aggregate Percentage
        sgpa: '',
        aggregatePercentage: '',
        firstYearPercentage: '', // 1st year percentage
        secondYearPercentage: '', // 2nd year percentage
        thirdYearPercentage: '', // 3rd year percentage
        fourthYearPercentage: '', // 4th year percentage
        graduationPercentage: '', // Graduation Percentage (if applicable)
        percentage: '',
        
        // Backlogs
        backlogs: '', // Backlogs / Arrears (Yes/No)
        backlogsCount: '', // Backlogs Count
        arrears: '',
        arrearsCount: '',
        
        // Registration
        registrationNumber: '',
        prnNumber: ''
      },
      // Technical Skills
      technical: {
        programmingLanguages: '', // Programming Languages Known
        technicalSkills: [], // Technical Skills / Technologies
        technicalAchievements: '', // Technical Achievements
        projects: [], // Projects (Count + Description)
        projectsCount: '',
        projectsDescription: '',
        github: '', // GitHub Profile Link
        certifications: '', // Certifications (AWS, Google, etc.)
        internshipMonths: '', // Internship Experience (Months)
        internshipCompanies: '' // Internship Companies
      },
      // Placement Preferences
      placement: {
        eligibleCompanies: '', // Eligible Companies / Companies Interested
        companiesInterested: '',
        jobRolePreference: '', // Job Role Preference (SDE, Analyst, etc.)
        expectedCTC: '', // Expected CTC / Salary Expectations
        salaryExpectations: '',
        willingToRelocate: '', // Willing to Relocate (Yes/No)
        noticePeriod: '', // Notice Period
        availableFromDate: '', // Available From Date
        resumeLink: '', // Resume Upload / LinkedIn Profile
        linkedin: '' // LinkedIn Profile
      },
      documents: {
        tenthMarksheetLink: '',
        twelfthMarksheetLink: '',
        collegeIdCardLink: '',
        passportPhotoLink: '',
        resumeLink: '' // Resume Upload
      },
      social: {
        linkedin: '',
        github: '',
        portfolio: '',
        behance: '',
        instagram: '',
        twitter: '',
        whatsapp: '',
        telegram: ''
      },
      // Additional Fields
      additional: {
        parentContact: '', // Parent/Guardian Contact number
        guardianContact: '',
        alternateContact: '', // Alternate Contact Number
        declaration: false // Declaration/Authorization Checkbox
      }
    };
  }

  /**
   * Validate profile data
   * @param {Object} profile - Profile to validate
   * @returns {Object} - {valid: boolean, errors: string[]}
   */
  static validateProfile(profile) {
    const errors = [];

    // Required fields validation
    if (!profile.personal?.firstName?.trim()) {
      errors.push('First name is required');
    }
    if (!profile.personal?.email?.trim()) {
      errors.push('Email is required');
    }
    if (profile.personal?.email && !this.isValidEmail(profile.personal.email)) {
      errors.push('Invalid email format');
    }
    if (profile.personal?.phone && !this.isValidPhone(profile.personal.phone)) {
      errors.push('Invalid phone number');
    }
    if (profile.personal?.aadhaarNumber && !this.isValidAadhaar(profile.personal.aadhaarNumber)) {
      errors.push('Invalid Aadhaar number (should be 12 digits)');
    }
    if (profile.personal?.pan && !this.isValidPAN(profile.personal.pan)) {
      errors.push('Invalid PAN format');
    }
    if (profile.address?.pin && !this.isValidPIN(profile.address.pin)) {
      errors.push('Invalid PIN code (should be 6 digits)');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Validate phone number (10 digits)
   */
  static isValidPhone(phone) {
    return /^[0-9]{10}$/.test(phone.replace(/[^0-9]/g, ''));
  }

  /**
   * Validate Aadhaar number (12 digits)
   */
  static isValidAadhaar(aadhaar) {
    return /^[0-9]{12}$/.test(aadhaar.replace(/[^0-9]/g, ''));
  }

  /**
   * Validate PAN format
   */
  static isValidPAN(pan) {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
  }

  /**
   * Validate PIN code (6 digits)
   */
  static isValidPIN(pin) {
    return /^[0-9]{6}$/.test(pin.replace(/[^0-9]/g, ''));
  }

  /**
   * Merge profile with updates
   * @param {Object} currentProfile - Current profile
   * @param {Object} updates - Updates to apply
   * @returns {Object} - Merged profile
   */
  static mergeProfile(currentProfile, updates) {
    return {
      ...currentProfile,
      personal: { ...currentProfile.personal, ...updates.personal },
      address: { ...currentProfile.address, ...updates.address },
      academic: { ...currentProfile.academic, ...updates.academic },
      technical: { ...currentProfile.technical, ...updates.technical },
      placement: { ...currentProfile.placement, ...updates.placement },
      documents: { ...currentProfile.documents, ...updates.documents },
      social: { ...currentProfile.social, ...updates.social },
      additional: { ...currentProfile.additional, ...updates.additional }
    };
  }
}

