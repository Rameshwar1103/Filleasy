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
      // Personal Details
      personal: {
        firstName: '',
        middleName: '',
        lastName: '',
        fullName: '', // Auto-constructed from firstName + middleName + lastName
        phone: '', // Phone Number
        gender: '',
        dateOfBirth: '', // Date of Birth
        email: '', // Email
        aadhaarNumber: '', // Aadhar Number
        prnNumber: '', // PRN Number
        physicallyChallenged: '' // Physically Challenged (Yes/No)
      },
      // Current Address
      currentAddress: {
        houseNumber: '',
        street: '',
        city: '',
        state: '',
        pincode: ''
      },
      // Permanent Address
      permanentAddress: {
        houseNumber: '',
        street: '',
        city: '',
        state: '',
        pincode: ''
      },
      // Legacy address field for backward compatibility
      address: {
        house: '',
        street: '',
        city: '',
        state: '',
        pin: '',
        country: 'India',
        currentAddress: '',
        permanentAddress: ''
      },
      // Academic Information
      academic: {
        // 10th Details
        tenthPercentage: '',
        tenthBoard: '',
        tenthPassingYear: '',
        tenthSchoolName: '',
        
        // 12th Details
        twelfthPercentage: '',
        twelfthBoard: '',
        twelfthPassingYear: '',
        twelfthCollegeName: '',
        
        // Diploma Details
        diplomaPercentage: '',
        diplomaCollege: '',
        diplomaSpecialization: '',
        diplomaPassingYear: '',
        
        // MCA Details
        mcaPercentage: '',
        mcaCollege: '',
        mcaSpecialization: '',
        mcaPassingYear: '',
        
        // College Details
        collegeName: '',
        collegeCity: '',
        collegeState: '',
        collegePincode: '',
        degree: '', // Degree (B.Tech, B.E., etc.)
        branch: '',
        specialization: '',
        currentSemester: '', // Current Semester (auto-calculates currentYear)
        currentYear: '', // Auto-calculated: (currentSemester + 1) / 2
        
        // Year-wise CGPA and Percentage (auto-calculated from CGPA)
        firstYearCGPA: '',
        firstYearPercentage: '', // Auto: 9.5 * firstYearCGPA
        secondYearCGPA: '',
        secondYearPercentage: '', // Auto: 9.5 * secondYearCGPA
        thirdYearCGPA: '',
        thirdYearPercentage: '', // Auto: 9.5 * thirdYearCGPA
        fourthYearCGPA: '',
        fourthYearPercentage: '', // Auto: 9.5 * fourthYearCGPA
        
        // Aggregate
        aggregateCGPA: '',
        graduationPercentage: '', // Auto: 9.5 * aggregateCGPA
        
        // Other
        backlogs: '', // Backlogs (Yes/No)
        collegeEmailId: '',
        yearOfGraduation: '',
        
        // Legacy fields for backward compatibility
        tenthYear: '',
        twelfthYear: '',
        twelfthStream: '',
        course: '',
        semester: '',
        yearOfStudy: '',
        sgpa: '',
        percentage: '',
        backlogsCount: '',
        arrears: '',
        arrearsCount: '',
        registrationNumber: ''
      },
      // Technical Skills
      technical: {
        programmingLanguages: '', // Programming Languages
        languages: '', // Languages (spoken)
        personalAchievements: '', // Personal Achievements
        technicalSkills: '', // Technical Skills
        technicalAchievements: '', // Technical Achievements
        project: '', // Projects
        certifications: [], // Certifications array with {name, agency, duration, certificateLink}
        internships: [] // Internships array with {duration, company, certificateLink}
      },
      // Coding Section
      coding: {
        linkedinLink: '', // LinkedIn Link
        leetcodeScore: '',
        leetcodeLink: '',
        gfgScore: '', // GeeksforGeeks Score
        gfgLink: '',
        cocubesScore: '',
        codechefRank: '',
        codechefLink: '',
        hackerearthRating: '',
        hackerearthLink: '',
        hackerrankRating: '',
        hackerrankLink: '',
        githubLink: '', // GitHub Link
        resumeLink: '' // Resume Upload (link)
      },
      // Legacy placement fields for backward compatibility
      placement: {
        linkedin: '',
        github: '',
        resumeLink: ''
      },
      documents: {
        tenthMarksheetLink: '',
        twelfthMarksheetLink: '',
        collegeIdCardLink: '',
        passportPhotoLink: '',
        resumeLink: '',
        certificationCertificates: [] // Array of certification certificate links
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
        parentContact: '',
        guardianContact: '',
        alternateContact: '',
        declaration: false
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
    const merged = {
      ...currentProfile,
      personal: { ...currentProfile.personal, ...updates.personal },
      currentAddress: { ...currentProfile.currentAddress, ...updates.currentAddress },
      permanentAddress: { ...currentProfile.permanentAddress, ...updates.permanentAddress },
      address: { ...currentProfile.address, ...updates.address },
      academic: { ...currentProfile.academic, ...updates.academic },
      technical: { ...currentProfile.technical, ...updates.technical },
      coding: { ...currentProfile.coding, ...updates.coding },
      placement: { ...currentProfile.placement, ...updates.placement },
      documents: { ...currentProfile.documents, ...updates.documents },
      social: { ...currentProfile.social, ...updates.social },
      additional: { ...currentProfile.additional, ...updates.additional }
    };
    
    // Auto-calculate fields
    this.autoCalculateFields(merged);
    
    return merged;
  }

  /**
   * Auto-calculate derived fields
   * @param {Object} profile - Profile to update
   */
  static autoCalculateFields(profile) {
    // Auto-calculate fullName from firstName + middleName + lastName
    if (profile.personal) {
      const parts = [
        profile.personal.firstName,
        profile.personal.middleName,
        profile.personal.lastName
      ].filter(Boolean);
      profile.personal.fullName = parts.join(' ').trim() || profile.personal.fullName || '';
    }

    // Auto-calculate currentYear from currentSemester
    if (profile.academic?.currentSemester) {
      const semester = parseFloat(profile.academic.currentSemester);
      if (!isNaN(semester) && semester > 0) {
        profile.academic.currentYear = Math.ceil((semester + 1) / 2).toString();
      }
    }

    // Auto-calculate percentages from CGPA (percentage = 9.5 * CGPA)
    if (profile.academic) {
      // First Year
      if (profile.academic.firstYearCGPA) {
        const cgpa = parseFloat(profile.academic.firstYearCGPA);
        if (!isNaN(cgpa) && cgpa > 0) {
          profile.academic.firstYearPercentage = (9.5 * cgpa).toFixed(2);
        }
      }
      
      // Second Year
      if (profile.academic.secondYearCGPA) {
        const cgpa = parseFloat(profile.academic.secondYearCGPA);
        if (!isNaN(cgpa) && cgpa > 0) {
          profile.academic.secondYearPercentage = (9.5 * cgpa).toFixed(2);
        }
      }
      
      // Third Year
      if (profile.academic.thirdYearCGPA) {
        const cgpa = parseFloat(profile.academic.thirdYearCGPA);
        if (!isNaN(cgpa) && cgpa > 0) {
          profile.academic.thirdYearPercentage = (9.5 * cgpa).toFixed(2);
        }
      }
      
      // Fourth Year
      if (profile.academic.fourthYearCGPA) {
        const cgpa = parseFloat(profile.academic.fourthYearCGPA);
        if (!isNaN(cgpa) && cgpa > 0) {
          profile.academic.fourthYearPercentage = (9.5 * cgpa).toFixed(2);
        }
      }
      
      // Aggregate
      if (profile.academic.aggregateCGPA) {
        const cgpa = parseFloat(profile.academic.aggregateCGPA);
        if (!isNaN(cgpa) && cgpa > 0) {
          profile.academic.graduationPercentage = (9.5 * cgpa).toFixed(2);
        }
      }
    }
  }
}

