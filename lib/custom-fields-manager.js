/**
 * Custom Fields Manager - Manages dynamic custom key-value fields
 * Supports categories, field types, and templates
 */

class CustomFieldsManager {
  /**
   * Get default custom fields structure
   * @returns {Object} - Default custom fields object
   */
  static getDefaultCustomFields() {
    return {};
  }

  /**
   * Add or update a custom field
   * @param {Object} customFields - Current custom fields object
   * @param {string} key - Field key
   * @param {Object} fieldData - Field data {value, type, category, label}
   * @returns {Object} - Updated custom fields
   */
  static addCustomField(customFields, key, fieldData) {
    return {
      ...customFields,
      [key]: {
        value: fieldData.value || '',
        type: fieldData.type || 'text',
        category: fieldData.category || 'General',
        label: fieldData.label || key,
        createdAt: fieldData.createdAt || Date.now(),
        updatedAt: Date.now()
      }
    };
  }

  /**
   * Remove a custom field
   * @param {Object} customFields - Current custom fields object
   * @param {string} key - Field key to remove
   * @returns {Object} - Updated custom fields
   */
  static removeCustomField(customFields, key) {
    const updated = { ...customFields };
    delete updated[key];
    return updated;
  }

  /**
   * Get custom fields by category
   * @param {Object} customFields - Custom fields object
   * @returns {Object} - Fields grouped by category
   */
  static getFieldsByCategory(customFields) {
    const categories = {};
    
    for (const [key, field] of Object.entries(customFields)) {
      const category = field.category || 'General';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({ key, ...field });
    }

    return categories;
  }

  /**
   * Get available categories
   * @param {Object} customFields - Custom fields object
   * @returns {string[]} - Array of category names
   */
  static getCategories(customFields) {
    const categories = new Set(['General']);
    
    for (const field of Object.values(customFields)) {
      if (field.category) {
        categories.add(field.category);
      }
    }

    return Array.from(categories).sort();
  }

  /**
   * Field types
   */
  static FIELD_TYPES = {
    text: 'Text',
    number: 'Number',
    date: 'Date',
    dropdown: 'Dropdown',
    longText: 'Long Text'
  };

  /**
   * Default categories
   */
  static DEFAULT_CATEGORIES = [
    'General',
    'Academic',
    'Financial',
    'Documents',
    'Personal',
    'Scholarship',
    'Employment',
    'Other'
  ];

  /**
   * Export custom fields as JSON
   * @param {Object} customFields - Custom fields to export
   * @returns {string} - JSON string
   */
  static exportFields(customFields) {
    return JSON.stringify(customFields, null, 2);
  }

  /**
   * Import custom fields from JSON
   * @param {string} jsonString - JSON string to import
   * @returns {Object} - Imported custom fields
   */
  static importFields(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      // Validate structure
      const validated = {};
      for (const [key, field] of Object.entries(imported)) {
        if (field && typeof field === 'object') {
          validated[key] = {
            value: field.value || '',
            type: field.type || 'text',
            category: field.category || 'General',
            label: field.label || key,
            createdAt: field.createdAt || Date.now(),
            updatedAt: Date.now()
          };
        }
      }
      return validated;
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Get scholarship template fields
   * @param {string} templateName - Template name
   * @returns {Object|null} - Template fields or null
   */
  static getScholarshipTemplate(templateName) {
    return ScholarshipTemplates.getTemplate(templateName);
  }

  /**
   * Apply template to custom fields (merge)
   * @param {Object} currentFields - Current custom fields
   * @param {Object} templateFields - Template fields to apply
   * @returns {Object} - Merged custom fields
   */
  static applyTemplate(currentFields, templateFields) {
    const merged = { ...currentFields };
    
    for (const [key, field] of Object.entries(templateFields)) {
      // Don't overwrite existing fields, add with suffix if conflict
      if (merged[key]) {
        const newKey = `${key}_template`;
        merged[newKey] = { ...field, createdAt: Date.now(), updatedAt: Date.now() };
      } else {
        merged[key] = { ...field, createdAt: Date.now(), updatedAt: Date.now() };
      }
    }

    return merged;
  }
}

/**
 * Scholarship Templates - Pre-built templates for common scholarships
 */
class ScholarshipTemplates {
  /**
   * Available templates
   */
  static TEMPLATES = {
    'Government Scholarship (India)': {
      familyIncome: {
        value: '',
        type: 'number',
        category: 'Financial',
        label: 'Family Annual Income'
      },
      caste: {
        value: '',
        type: 'dropdown',
        category: 'Personal',
        label: 'Caste Category',
        options: ['General', 'OBC', 'SC', 'ST', 'EWS']
      },
      domicileState: {
        value: '',
        type: 'text',
        category: 'Personal',
        label: 'Domicile State'
      },
      bankAccountNumber: {
        value: '',
        type: 'number',
        category: 'Financial',
        label: 'Bank Account Number'
      },
      ifscCode: {
        value: '',
        type: 'text',
        category: 'Financial',
        label: 'IFSC Code'
      },
      bankName: {
        value: '',
        type: 'text',
        category: 'Financial',
        label: 'Bank Name'
      },
      fatherName: {
        value: '',
        type: 'text',
        category: 'Personal',
        label: 'Father\'s Name'
      },
      motherName: {
        value: '',
        type: 'text',
        category: 'Personal',
        label: 'Mother\'s Name'
      },
      fatherOccupation: {
        value: '',
        type: 'text',
        category: 'Personal',
        label: 'Father\'s Occupation'
      },
      motherOccupation: {
        value: '',
        type: 'text',
        category: 'Personal',
        label: 'Mother\'s Occupation'
      }
    },
    'Merit-Based Scholarship': {
      previousYearMarks: {
        value: '',
        type: 'number',
        category: 'Academic',
        label: 'Previous Year Marks/Percentage'
      },
      achievements: {
        value: '',
        type: 'longText',
        category: 'Academic',
        label: 'Academic Achievements'
      },
      extracurricular: {
        value: '',
        type: 'longText',
        category: 'Academic',
        label: 'Extracurricular Activities'
      },
      recommendationLetter: {
        value: '',
        type: 'text',
        category: 'Documents',
        label: 'Recommendation Letter Link'
      }
    },
    'Need-Based Scholarship': {
      familyIncome: {
        value: '',
        type: 'number',
        category: 'Financial',
        label: 'Family Annual Income'
      },
      numberOfDependents: {
        value: '',
        type: 'number',
        category: 'Financial',
        label: 'Number of Dependents'
      },
      incomeProof: {
        value: '',
        type: 'text',
        category: 'Documents',
        label: 'Income Proof Document Link'
      },
      familyMemberDetails: {
        value: '',
        type: 'longText',
        category: 'Personal',
        label: 'Family Member Details'
      }
    },
    'International Scholarship': {
      passportNumber: {
        value: '',
        type: 'text',
        category: 'Documents',
        label: 'Passport Number'
      },
      visaNumber: {
        value: '',
        type: 'text',
        category: 'Documents',
        label: 'Visa Number'
      },
      englishProficiency: {
        value: '',
        type: 'text',
        category: 'Academic',
        label: 'English Proficiency Test Score'
      },
      statementOfPurpose: {
        value: '',
        type: 'longText',
        category: 'Documents',
        label: 'Statement of Purpose'
      }
    }
  };

  /**
   * Get template by name
   * @param {string} templateName - Template name
   * @returns {Object|null} - Template fields or null
   */
  static getTemplate(templateName) {
    return this.TEMPLATES[templateName] || null;
  }

  /**
   * Get all available template names
   * @returns {string[]} - Array of template names
   */
  static getTemplateNames() {
    return Object.keys(this.TEMPLATES);
  }
}

