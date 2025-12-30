/**
 * Content Script - Handles Google Forms detection and auto-filling
 * Runs on forms.google.com and forms.gle domains
 */

/**
 * Initialize content script
 */
(async function init() {
  // Inject ML field matcher script
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('lib/ml-field-matcher.js');
  script.onload = function() {
    this.remove();
    waitForForm();
  };
  (document.head || document.documentElement).appendChild(script);
})();

/**
 * Wait for Google Forms to load
 */
function waitForForm() {
  const checkInterval = setInterval(() => {
    const form = document.querySelector('form[action*="forms"]');
    if (form || document.querySelector('[role="list"]')) {
      clearInterval(checkInterval);
      setupFormObserver();
      notifyFormDetected();
    }
  }, 500);

  // Timeout after 10 seconds
  setTimeout(() => clearInterval(checkInterval), 10000);
}

/**
 * Notify popup that form is detected
 */
function notifyFormDetected() {
  chrome.runtime.sendMessage({
    action: 'formDetected',
    url: window.location.href
  }).catch(() => {});
}

/**
 * Setup observer to detect form changes
 */
function setupFormObserver() {
  const observer = new MutationObserver(() => {
    // Form structure changed, re-check
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * Handle messages from popup/background
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    fillForm(request.profile, request.customFields, request.preview)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open
  } else if (request.action === 'detectFields') {
    const fields = detectFormFields();
    sendResponse({ fields });
    return false;
  }
});

/**
 * Detect all form fields in the current form
 * @returns {Array} - Array of field information
 */
function detectFormFields() {
  const fields = [];
  
  // Text inputs
  document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"]').forEach((input, index) => {
    const label = getFieldLabel(input);
    fields.push({
      type: input.type || 'text',
      label: label,
      id: input.id || `field_${index}`,
      element: input,
      selector: generateSelector(input)
    });
  });

  // Textareas
  document.querySelectorAll('textarea').forEach((textarea, index) => {
    const label = getFieldLabel(textarea);
    fields.push({
      type: 'textarea',
      label: label,
      id: textarea.id || `textarea_${index}`,
      element: textarea,
      selector: generateSelector(textarea)
    });
  });

  // Radio buttons (grouped)
  const radioGroups = new Map();
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    const name = radio.getAttribute('name') || radio.getAttribute('data-params');
    if (!radioGroups.has(name)) {
      const label = getFieldLabel(radio);
      radioGroups.set(name, {
        type: 'radio',
        label: label,
        name: name,
        options: [],
        element: radio
      });
    }
    const optionLabel = getRadioOptionLabel(radio);
    radioGroups.get(name).options.push({ value: radio.value, label: optionLabel, element: radio });
  });
  radioGroups.forEach((group, name) => {
    fields.push({ ...group, id: name });
  });

  // Checkboxes (grouped by label)
  const checkboxGroups = new Map();
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    const label = getFieldLabel(checkbox);
    if (!checkboxGroups.has(label)) {
      checkboxGroups.set(label, {
        type: 'checkbox',
        label: label,
        options: [],
        element: checkbox
      });
    }
    const optionLabel = getCheckboxOptionLabel(checkbox);
    checkboxGroups.get(label).options.push({ value: checkbox.value, label: optionLabel, element: checkbox });
  });
  checkboxGroups.forEach((group, label) => {
    fields.push({ ...group, id: label });
  });

  // Dropdowns/Select
  document.querySelectorAll('select, [role="listbox"]').forEach((select, index) => {
    const label = getFieldLabel(select);
    fields.push({
      type: 'select',
      label: label,
      id: select.id || `select_${index}`,
      element: select,
      selector: generateSelector(select)
    });
  });

  // Date inputs
  document.querySelectorAll('input[type="date"], input[type="datetime-local"]').forEach((input, index) => {
    const label = getFieldLabel(input);
    fields.push({
      type: 'date',
      label: label,
      id: input.id || `date_${index}`,
      element: input,
      selector: generateSelector(input)
    });
  });

  return fields;
}

/**
 * Get label for a form field
 * @param {HTMLElement} element - Form element
 * @returns {string} - Label text
 */
function getFieldLabel(element) {
  // Try multiple strategies to find label
  const id = element.id;
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent.trim();
  }

  // Google Forms uses aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel.trim();

  // Look for parent label
  let parent = element.parentElement;
  for (let i = 0; i < 5 && parent; i++) {
    if (parent.tagName === 'LABEL') {
      return parent.textContent.trim();
    }
    parent = parent.parentElement;
  }

  // Look for nearby text content (Google Forms structure)
  const container = element.closest('[role="listitem"]') || element.closest('.freebirdFormviewerViewItemsItemItem');
  if (container) {
    const title = container.querySelector('[role="heading"], .freebirdFormviewerViewItemsItemItemTitle');
    if (title) return title.textContent.trim();
  }

  // Look for placeholder
  const placeholder = element.placeholder;
  if (placeholder) return placeholder.trim();

  return '';
}

/**
 * Get radio option label
 */
function getRadioOptionLabel(radio) {
  const label = radio.closest('[role="radio"]')?.querySelector('[aria-label]');
  return label ? label.getAttribute('aria-label') : radio.value;
}

/**
 * Get checkbox option label
 */
function getCheckboxOptionLabel(checkbox) {
  const label = checkbox.closest('[role="checkbox"]')?.querySelector('[aria-label]');
  return label ? label.getAttribute('aria-label') : checkbox.value;
}

/**
 * Generate CSS selector for element
 */
function generateSelector(element) {
  if (element.id) return `#${element.id}`;
  if (element.name) return `[name="${element.name}"]`;
  
  // Generate path-based selector
  let path = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    if (element.className) {
      const classes = Array.from(element.classList).join('.');
      selector += `.${classes}`;
    }
    path.unshift(selector);
    if (path.length > 5) break;
    element = element.parentElement;
  }
  return path.join(' > ');
}

/**
 * Fill form with profile data
 * @param {Object} profile - User profile
 * @param {Object} customFields - Custom fields
 * @param {boolean} preview - Show preview before filling
 * @returns {Promise<Object>} - Fill result
 */
async function fillForm(profile, customFields = {}, preview = false) {
  const fields = detectFormFields();
  const mappings = [];

  // Build full name for full name fields
  const fullName = buildFullName(profile);

  // Wait for MLFieldMatcher to be available
  let MLMatcher = null;
  if (typeof window !== 'undefined' && window.MLFieldMatcher) {
    MLMatcher = window.MLFieldMatcher;
  }

  // Match each field using ML
  for (const field of fields) {
    let match = null;
    if (MLMatcher && MLMatcher.matchFieldWithValue) {
      match = MLMatcher.matchFieldWithValue(field.label, profile, customFields);
    }
    
    if (match) {
      let value = match.value;

      // Special handling for full name - construct from firstName + middleName + lastName
      if (match.field === 'fullName' || field.label.toLowerCase().includes('full name')) {
        const parts = [
          profile?.personal?.firstName,
          profile?.personal?.middleName,
          profile?.personal?.lastName
        ].filter(Boolean);
        value = parts.join(' ').trim();
      }

      // Format dates
      if (field.type === 'date' && match.field === 'dateOfBirth') {
        value = formatDate(value, 'YYYY-MM-DD');
      }

      // Handle dropdown/select fields - find exact match in options
      if ((field.type === 'select' || field.type === 'radio') && match.confidence >= 0.8) {
        const dropdownMatch = findExactDropdownMatch(field, value, match.field);
        if (dropdownMatch) {
          value = dropdownMatch;
        }
      }

      mappings.push({
        field: field,
        match: match,
        value: value
      });
    }
  }

  if (preview) {
    // Return mappings for preview (don't fill yet)
    return { mappings, fields, preview: true };
  }

  // Fill the form
  let filled = 0;
  for (const mapping of mappings) {
    try {
      if (fillField(mapping.field, mapping.value)) {
        filled++;
      }
    } catch (error) {
      console.error('Error filling field:', error);
    }
  }

  return {
    success: true,
    filled: filled,
    total: fields.length,
    mappings: mappings
  };
}

/**
 * Fill a single form field
 * @param {Object} fieldInfo - Field information
 * @param {string} value - Value to fill
 * @returns {boolean} - Success
 */
function fillField(fieldInfo, value) {
  if (!fieldInfo.element) return false;

  const element = fieldInfo.element;

  try {
    switch (fieldInfo.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
      case 'textarea':
        // Set value and trigger input event
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        break;

      case 'date':
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        break;

      case 'radio':
        // Find matching option using intelligent matching
        const radioMatch = findMatchingOption(fieldInfo.options || [], value);
        if (radioMatch) {
          if (!radioMatch.element.checked) {
            radioMatch.element.click();
          }
        }
        break;

      case 'checkbox':
        // For checkboxes, value might be a list
        const values = Array.isArray(value) ? value : [value];
        fieldInfo.options?.forEach(opt => {
          if (values.some(v => opt.value.toLowerCase() === v.toLowerCase() || opt.label.toLowerCase() === v.toLowerCase())) {
            if (!opt.element.checked) {
              opt.element.click();
            }
          }
        });
        break;

      case 'select':
        // For select dropdowns, try to find matching option
        const selectOptions = Array.from(element.options || []);
        const matchedOption = findMatchingSelectOption(selectOptions, value);
        if (matchedOption) {
          element.value = matchedOption.value;
          element.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        } else {
          // Fallback: try direct value assignment
          element.value = value;
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
        break;

      default:
        // Try generic approach
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    return true;
  } catch (error) {
    console.error('Error filling field:', error);
    return false;
  }
}

/**
 * Build full name from profile
 */
function buildFullName(profile) {
  if (!profile?.personal) return '';
  const parts = [
    profile.personal.firstName,
    profile.personal.middleName,
    profile.personal.lastName
  ].filter(Boolean);
  return parts.join(' ');
}

/**
 * Format date string
 */
function formatDate(dateStr, format = 'YYYY-MM-DD') {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year);
}

/**
 * Normalize string for matching (lowercase, remove special chars, trim)
 */
function normalizeString(str) {
  if (!str) return '';
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Find exact dropdown match for ML-predicted field
 * Enhanced with fuzzy college name matching and better role/year matching
 * @param {Object} fieldInfo - Field information with options
 * @param {string} profileValue - Value from profile
 * @param {string} predictedField - ML-predicted field name
 * @returns {string|null} - Matching dropdown value or null
 */
function findExactDropdownMatch(fieldInfo, profileValue, predictedField) {
  if (!fieldInfo.options || !profileValue) return null;

  const normalizedProfile = normalizeString(profileValue);
  
  // Enhanced College name matching with fuzzy matching
  if (predictedField === 'collegeName' || predictedField === 'universityName') {
    // Extract key words from profile value (e.g., "Pimpri Chinchwad College of Engineering")
    const profileWords = normalizedProfile.split(/\s+/).filter(w => w.length > 3);
    
    // College name patterns and their full names
    const collegePatterns = {
      'pccoe': {
        keywords: ['pccoe', 'pimpri', 'chinchwad', 'college', 'engineering'],
        fullNames: [
          "Pimpri Chinchwad Education Trust's PCCOE, Pune",
          "Pimpri Chinchwad Education Trust's PCCOE&R"
        ]
      },
      'pccoe&r': {
        keywords: ['pccoe&r', 'pccoe and r', 'pimpri', 'chinchwad'],
        fullNames: ["Pimpri Chinchwad Education Trust's PCCOE&R"]
      },
      'nimet': {
        keywords: ['nimet', 'pimpri', 'chinchwad'],
        fullNames: ["Pimpri Chinchwad Education Trust's NMIET"]
      },
      'ncer': {
        keywords: ['ncer', 'pimpri', 'chinchwad'],
        fullNames: ["Pimpri Chinchwad Education Trust's NCER"]
      }
    };
    
    // Find best matching college pattern
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [key, pattern] of Object.entries(collegePatterns)) {
      let score = 0;
      // Count matching keywords
      for (const keyword of pattern.keywords) {
        if (normalizedProfile.includes(keyword)) {
          score += keyword.length; // Longer keywords get more weight
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = pattern;
      }
    }
    
    // If we found a match, find the best option
    if (bestMatch && bestScore > 0) {
      let bestOption = null;
      let bestOptionScore = 0;
      
      for (const opt of fieldInfo.options) {
        const optValue = normalizeString(opt.value || opt.label || '');
        let optionScore = 0;
        
        // Check if option matches any full name pattern
        for (const fullName of bestMatch.fullNames) {
          const fullNameNormalized = normalizeString(fullName);
          // Count common words
          const optWords = optValue.split(/\s+/);
          const fullNameWords = fullNameNormalized.split(/\s+/);
          
          for (const word of optWords) {
            if (fullNameWords.includes(word) && word.length > 3) {
              optionScore += word.length;
            }
          }
        }
        
        // Also check keyword matching
        for (const keyword of bestMatch.keywords) {
          if (optValue.includes(keyword)) {
            optionScore += keyword.length * 2; // Keywords are more important
          }
        }
        
        if (optionScore > bestOptionScore) {
          bestOptionScore = optionScore;
          bestOption = opt.value || opt.label;
        }
      }
      
      if (bestOption) {
        return bestOption;
      }
    }
    
    // Fallback: word-based matching
    for (const opt of fieldInfo.options) {
      const optValue = normalizeString(opt.value || opt.label || '');
      const optWords = optValue.split(/\s+/).filter(w => w.length > 3);
      let matchCount = 0;
      
      for (const word of profileWords) {
        if (optWords.some(optWord => optWord.includes(word) || word.includes(optWord))) {
          matchCount++;
        }
      }
      
      // If at least 2 significant words match, consider it a match
      if (matchCount >= 2) {
        return opt.value || opt.label;
      }
    }
  }

  // Branch matching (CS, IT, Civil, Mech, E&TC)
  if (predictedField === 'branch') {
    const branchMappings = {
      'computerscience': ['cs', 'cse', 'computer science'],
      'informationtechnology': ['it', 'information technology'],
      'civil': ['civil', 'civil engineering'],
      'mechanical': ['mech', 'mechanical', 'mechanical engineering'],
      'electronics': ['etc', 'e&tc', 'ece', 'electronics', 'electronics and telecommunication']
    };
    
    for (const [key, variations] of Object.entries(branchMappings)) {
      if (variations.some(v => normalizedProfile.includes(normalizeString(v)))) {
        for (const opt of fieldInfo.options) {
          const optValue = normalizeString(opt.value || opt.label || '');
          if (variations.some(v => optValue.includes(normalizeString(v)) || normalizeString(v).includes(optValue))) {
            return opt.value || opt.label;
          }
        }
      }
    }
  }

  // Gender matching (Male, Female)
  if (predictedField === 'gender') {
    const genderMap = {
      'male': ['male', 'm'],
      'female': ['female', 'f', 'fem']
    };
    
    for (const [key, variations] of Object.entries(genderMap)) {
      if (variations.some(v => normalizedProfile.includes(normalizeString(v)))) {
        for (const opt of fieldInfo.options) {
          const optValue = normalizeString(opt.value || opt.label || '');
          if (variations.some(v => optValue.includes(normalizeString(v)))) {
            return opt.value || opt.label;
          }
        }
      }
    }
  }

  // Enhanced Role matching
  if (predictedField === 'role') {
    const roleMappings = {
      'sales': ['sales', 'business development'],
      'it sales': ['it sales', 'itsales', 'international it sales', 'business development executive'],
      'intern': ['intern', 'internship', 'sales intern']
    };
    
    for (const [key, variations] of Object.entries(roleMappings)) {
      if (variations.some(v => normalizedProfile.includes(normalizeString(v)))) {
        for (const opt of fieldInfo.options) {
          const optValue = normalizeString(opt.value || opt.label || '');
          // Check if option contains any variation
          if (variations.some(v => {
            const vNorm = normalizeString(v);
            return optValue.includes(vNorm) || vNorm.includes(optValue);
          })) {
            return opt.value || opt.label;
          }
        }
      }
    }
  }

  // Year matching (2025, 2026, etc.)
  if (predictedField === 'year') {
    // Extract year from profile value
    const yearMatch = profileValue.match(/\d{4}/);
    if (yearMatch) {
      const year = yearMatch[0];
      for (const opt of fieldInfo.options) {
        const optValue = String(opt.value || opt.label || '');
        if (optValue.includes(year)) {
          return opt.value || opt.label;
        }
      }
    }
  }

  // Fallback: fuzzy string matching
  for (const opt of fieldInfo.options) {
    const optValue = normalizeString(opt.value || opt.label || '');
    if (optValue === normalizedProfile) {
      return opt.value || opt.label;
    }
    // Check if one contains the other (for partial matches)
    if (optValue.includes(normalizedProfile) || normalizedProfile.includes(optValue)) {
      // Only return if match is significant (at least 5 characters)
      if (Math.min(optValue.length, normalizedProfile.length) >= 5) {
        return opt.value || opt.label;
      }
    }
  }

  return null;
}

/**
 * Find matching option from radio/checkbox options using intelligent matching
 * @param {Array} options - Array of option objects with {value, label, element}
 * @param {string} profileValue - Value from user profile
 * @returns {Object|null} - Matching option or null
 */
function findMatchingOption(options, profileValue) {
  if (!options || options.length === 0 || !profileValue) return null;

  const normalizedProfile = normalizeString(profileValue);
  
  // Priority 1: Exact match (case-insensitive)
  let match = options.find(opt => 
    normalizeString(opt.value) === normalizedProfile ||
    normalizeString(opt.label) === normalizedProfile
  );
  if (match) return match;

  // Priority 2: Contains match (profile value contains option or vice versa)
  match = options.find(opt => {
    const optValue = normalizeString(opt.value);
    const optLabel = normalizeString(opt.label);
    return normalizedProfile.includes(optValue) || 
           optValue.includes(normalizedProfile) ||
           normalizedProfile.includes(optLabel) || 
           optLabel.includes(normalizedProfile);
  });
  if (match) return match;

  // Priority 3: Fuzzy matching with common abbreviations
  match = findFuzzyMatch(options, normalizedProfile);
  if (match) return match;

  // Priority 4: Word-based matching (check if key words match)
  match = findWordMatch(options, normalizedProfile);
  if (match) return match;

  return null;
}

/**
 * Find matching option for select dropdown
 * @param {Array} options - Array of HTML option elements
 * @param {string} profileValue - Value from user profile
 * @returns {HTMLOptionElement|null} - Matching option element or null
 */
function findMatchingSelectOption(options, profileValue) {
  if (!options || options.length === 0 || !profileValue) return null;

  const normalizedProfile = normalizeString(profileValue);
  
  // Convert options to objects for easier matching
  const optionObjects = options.map(opt => ({
    element: opt,
    value: opt.value || '',
    label: opt.text || opt.label || ''
  }));

  // Use the same matching logic
  const match = findMatchingOption(optionObjects, profileValue);
  return match ? match.element : null;
}

/**
 * Find fuzzy match using common abbreviations and variations
 */
function findFuzzyMatch(options, normalizedProfile) {
  // Common abbreviations map (profile value -> possible form values)
  const abbreviations = {
    // Gender
    'male': ['m', 'male'],
    'female': ['f', 'female', 'fem'],
    'other': ['o', 'other', 'prefernottosay'],
    
    // Branches
    'computerscience': ['cs', 'cse', 'computer science', 'computer science engineering'],
    'informationtechnology': ['it', 'information technology'],
    'civilengineering': ['ce', 'civil', 'civil engineering'],
    'mechanicalengineering': ['me', 'mechanical', 'mechanical engineering'],
    'electricalengineering': ['ee', 'ece', 'electrical', 'electrical engineering', 'electronics'],
    'electronicsengineering': ['ece', 'ec', 'electronics', 'electronics engineering'],
    'chemicalengineering': ['che', 'ch', 'chemical', 'chemical engineering'],
    
    // Common college name patterns
    'institute': ['inst', 'institute', 'iit', 'nit', 'iim'],
    'university': ['univ', 'university', 'uni'],
    'technology': ['tech', 'technology']
  };

  // Check if profile value matches any abbreviation key
  for (const [key, variations] of Object.entries(abbreviations)) {
    if (normalizedProfile.includes(key) || key.includes(normalizedProfile)) {
      // Try to match any variation
      for (const variation of variations) {
        const match = options.find(opt => {
          const optValue = normalizeString(opt.value);
          const optLabel = normalizeString(opt.label);
          return optValue.includes(variation) || variation.includes(optValue) ||
                 optLabel.includes(variation) || variation.includes(optLabel);
        });
        if (match) return match;
      }
    }
  }

  // Check if any option matches any abbreviation variation
  for (const [key, variations] of Object.entries(abbreviations)) {
    for (const variation of variations) {
      if (normalizedProfile.includes(variation) || variation.includes(normalizedProfile)) {
        const match = options.find(opt => {
          const optValue = normalizeString(opt.value);
          const optLabel = normalizeString(opt.label);
          return optValue.includes(key) || key.includes(optValue) ||
                 optLabel.includes(key) || key.includes(optLabel);
        });
        if (match) return match;
      }
    }
  }

  return null;
}

/**
 * Find word-based match (checks if key words from profile match option)
 */
function findWordMatch(options, normalizedProfile) {
  // Extract key words from profile value (words with 3+ characters)
  const profileWords = normalizedProfile.split(/\s+/).filter(word => word.length >= 3);
  
  let bestMatch = null;
  let bestScore = 0;

  for (const opt of options) {
    const optValue = normalizeString(opt.value);
    const optLabel = normalizeString(opt.label);
    const optText = optValue + ' ' + optLabel;
    
    let score = 0;
    for (const word of profileWords) {
      if (optText.includes(word)) {
        score += word.length; // Longer words get more weight
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = opt;
    }
  }

  // Only return if score is significant (at least one 4+ character word matched)
  return bestScore >= 4 ? bestMatch : null;
}
