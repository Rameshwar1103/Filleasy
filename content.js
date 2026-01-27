/**
 * Content Script - Handles Google Forms detection and auto-filling
 * Runs on forms.google.com and forms.gle domains
 */

/**
 * Initialize content script
 */
(async function init() {
  const cacheScript = document.createElement('script');
  cacheScript.src = chrome.runtime.getURL('lib/field-mapping-cache.js');
  (document.head || document.documentElement).appendChild(cacheScript);
  
  await new Promise(resolve => {
    cacheScript.onload = async () => {
      if (window.FieldMappingCache) {
        await window.FieldMappingCache.load();
        console.log('[Filleasy] Field mapping cache loaded');
      }
      resolve();
    };
  });

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
  
  // Google Forms uses contenteditable divs for text inputs - detect those too
  document.querySelectorAll('[contenteditable="true"][role="textbox"]').forEach((div, index) => {
    const label = getFieldLabel(div);
    if (label) {
      fields.push({
        type: 'text',
        label: label,
        id: div.id || `contenteditable_${index}`,
        element: div,
        selector: generateSelector(div),
        isContentEditable: true
      });
    }
  });
  
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
  
  // Detect standard HTML radio buttons
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
  
  // Detect Google Forms radio buttons (using role="radio")
  document.querySelectorAll('[role="radio"]').forEach(radioDiv => {
    // Skip if already processed as input[type="radio"]
    if (radioDiv.querySelector('input[type="radio"]')) return;
    
    // Find the radio group container
    const container = radioDiv.closest('[role="radiogroup"]') || 
                     radioDiv.closest('[role="listitem"]') ||
                     radioDiv.closest('.freebirdFormviewerViewItemsItemItem');
    
    if (!container) return;
    
    // Get the field label from the container
    const fieldLabel = getFieldLabel(container);
    if (!fieldLabel) return;
    
    // Use container as the group identifier
    const groupId = container.id || fieldLabel;
    
    if (!radioGroups.has(groupId)) {
      radioGroups.set(groupId, {
        type: 'radio',
        label: fieldLabel,
        name: groupId,
        options: [],
        element: container,
        isGoogleForms: true
      });
    }
    
    // Get option label and value
    const optionLabel = getRadioOptionLabel(radioDiv);
    const radioInput = radioDiv.querySelector('input[type="radio"]');
    const optionValue = radioInput ? radioInput.value : optionLabel;
    
    radioGroups.get(groupId).options.push({ 
      value: optionValue, 
      label: optionLabel, 
      element: radioDiv,
      inputElement: radioInput || radioDiv
    });
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
    // Extract options for select elements
    const options = [];
    if (select.tagName === 'SELECT') {
      Array.from(select.options || []).forEach(opt => {
        options.push({
          value: opt.value || '',
          label: opt.text || opt.label || '',
          element: opt
        });
      });
    }
    fields.push({
      type: 'select',
      label: label,
      id: select.id || `select_${index}`,
      element: select,
      selector: generateSelector(select),
      options: options
    });
  });
  
  // Google Forms dropdowns (using contenteditable divs with role="listbox" or combobox)
  // Google Forms dropdowns are typically divs with role="listbox" that contain a contenteditable div
  document.querySelectorAll('[role="listbox"]:not(select), [role="combobox"]:not(select)').forEach((dropdown, index) => {
    // Skip if already processed as select
    if (dropdown.tagName === 'SELECT') return;
    
    const label = getFieldLabel(dropdown);
    if (label) {
      // Try to find the contenteditable input element inside
      const contentEditable = dropdown.querySelector('[contenteditable="true"]') || dropdown;
      
      // Try to find options - they might be in a menu that appears on click
      // Look for common Google Forms dropdown structures
      const options = [];
      
      // Method 1: Look for options already in DOM (sometimes they're hidden)
      const optionElements = dropdown.querySelectorAll('[role="option"], .freebirdFormviewerViewItemsItemItem, .exportSelectPopup, [data-value]');
      optionElements.forEach(opt => {
        const optText = opt.textContent?.trim() || opt.getAttribute('aria-label') || opt.getAttribute('data-value') || '';
        if (optText && optText.length > 0) {
          options.push({
            value: optText,
            label: optText,
            element: opt
          });
        }
      });
      
      // Method 2: Look for select element inside (some Google Forms use this)
      const selectElement = dropdown.querySelector('select');
      if (selectElement) {
        Array.from(selectElement.options || []).forEach(opt => {
          const optText = opt.text || opt.value || '';
          if (optText) {
            options.push({
              value: optText,
              label: optText,
              element: opt
            });
          }
        });
      }
      
      fields.push({
        type: 'select',
        label: label,
        id: dropdown.id || `google_dropdown_${index}`,
        element: contentEditable || dropdown,
        selector: generateSelector(dropdown),
        options: options,
        isGoogleForms: true,
        dropdownContainer: dropdown
      });
    }
  });
  
  // Also detect Google Forms dropdowns by looking for contenteditable divs with specific classes
  document.querySelectorAll('[contenteditable="true"].quantumWizTextinputPaperinputInput, [contenteditable="true"][aria-label]').forEach((input, index) => {
    // Check if this is a dropdown (has a dropdown indicator or specific structure)
    const parent = input.closest('[role="listbox"], [role="combobox"], .freebirdFormviewerViewItemsSelectSelect');
    if (parent && !Array.from(fields).some(f => f.element === input || f.element === parent)) {
      const label = getFieldLabel(input) || input.getAttribute('aria-label') || '';
      if (label) {
        fields.push({
          type: 'select',
          label: label,
          id: input.id || `google_dropdown_input_${index}`,
          element: input,
          selector: generateSelector(input),
          options: [],
          isGoogleForms: true,
          dropdownContainer: parent
        });
      }
    }
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
  // For Google Forms (role="radio" divs)
  if (radio.getAttribute && typeof radio.getAttribute === 'function') {
    const role = radio.getAttribute('role');
    if (role === 'radio') {
      const ariaLabel = radio.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel.trim();
      
      // Try to find text content (Google Forms often has text in child elements)
      const textContent = radio.textContent?.trim();
      if (textContent && textContent.length > 0 && textContent.length < 200) {
        return textContent;
      }
      
      // Try to find label element or span with text
      const label = radio.querySelector('label, span, div[aria-label]');
      if (label) {
        const labelText = label.getAttribute('aria-label') || label.textContent;
        if (labelText && labelText.trim()) return labelText.trim();
      }
    }
  }
  
  // For standard HTML radio inputs
  const roleRadio = radio.closest('[role="radio"]');
  if (roleRadio) {
    const ariaLabel = roleRadio.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel.trim();
  }
  
  // Try associated label element
  if (radio.id) {
    const associatedLabel = document.querySelector(`label[for="${radio.id}"]`);
    if (associatedLabel && associatedLabel.textContent) {
      return associatedLabel.textContent.trim();
    }
  }
  
  // Try parent label
  const parentLabel = radio.closest('label');
  if (parentLabel && parentLabel.textContent) {
    return parentLabel.textContent.trim();
  }
  
  // Fallback to value
  return radio.value || radio.textContent?.trim() || '';
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
  let value = null;
  
  // Preprocess the field label using the static method
  let fieldLabelToMatch = field.label;
  let hasNAInstruction = false;
  
  if (typeof window !== 'undefined' && window.MLFieldMatcher && 
      typeof window.MLFieldMatcher.preprocessFieldLabel === 'function') {
    try {
      const preprocessResult = window.MLFieldMatcher.preprocessFieldLabel(field.label);
      fieldLabelToMatch = preprocessResult.cleaned;
      hasNAInstruction = preprocessResult.hasNAInstruction;
      console.log('[Filleasy] Preprocessed label:', field.label, '→', fieldLabelToMatch);
    } catch (e) {
      console.warn('[Filleasy] Preprocessing failed, using original label:', e);
      fieldLabelToMatch = field.label;
    }
  }
  
  // Wait for MLFieldMatcher to be available
  let MLMatcher = null;
  if (typeof window !== 'undefined' && window.MLFieldMatcher) {
    MLMatcher = window.MLFieldMatcher;
  }
  
  // Use handleNAFields for fields that might require "NA"
  if (MLMatcher && MLMatcher.handleNAFields) {
    // Check if field requires NA (use ORIGINAL label for NA detection)
    const requiresNA = hasNAInstruction ||
                       /if\s+no\s+.*?\s+then\s+mention\s+["']?NA["']?/i.test(field.label) ||
                       /mention\s+["']?NA["']?\s+if/i.test(field.label) ||
                       /or\s+write\s+NA/i.test(field.label) ||
                       /\(.*?NA.*?\)/i.test(field.label);
    
    if (requiresNA) {
      // Use handleNAFields which returns "NA" if value is empty
      value = MLMatcher.handleNAFields(field.label, profile, customFields);
      
      // Get the field prediction for confidence
      const prediction = MLMatcher.matchField(fieldLabelToMatch);
      match = {
        field: prediction.predictedField,
        value: value,
        confidence: prediction.confidence,
        type: 'ml-na'
      };
    } else {
      // Regular matching for fields without NA requirement using PREPROCESSED label
      match = MLMatcher.matchFieldWithValue(fieldLabelToMatch, profile, customFields);
    }
  } else if (MLMatcher && MLMatcher.matchFieldWithValue) {
    // Fallback to regular matching if handleNAFields not available
    match = MLMatcher.matchFieldWithValue(fieldLabelToMatch, profile, customFields);
  }
    
    if (match) {
      // Use value from handleNAFields if already set, otherwise use match.value
      if (value === null) {
        value = match.value;
      }

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
      // Pass predicted field to fillField for better matching
      if (fillField(mapping.field, mapping.value, mapping.predictedField)) {
        filled++;
        // Store successful mapping in cache
                if (window.FieldMappingCache && mapping.match) {
                  try {
                    await window.FieldMappingCache.store(
                      mapping.field.label,
                      mapping.match.field,
                      mapping.match.confidence
                    );
                    console.log('[Filleasy] Cached:', mapping.field.label);
                  } catch (cacheError) {
                    console.warn('[Filleasy] Cache error:', cacheError);
                  }
                }
      }
    } catch (error) {
      console.error('Error filling field:', error);
    }
  }
   if (window.FieldMappingCache && Math.random() < 0.1) {
                try {
                  await window.FieldMappingCache.cleanup();
                  console.log('[Filleasy] Cache cleaned');
                } catch (cleanupError) {
                  console.warn('[Filleasy] Cleanup failed:', cleanupError);
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
 * @param {string} predictedField - Predicted field name (optional, for better matching)
 * @returns {boolean} - Success
 */
function fillField(fieldInfo, value, predictedField = null) {
  if (!fieldInfo.element) return false;

  const element = fieldInfo.element;

  try {
    switch (fieldInfo.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
      case 'textarea':
        // Handle contenteditable divs (Google Forms)
        if (fieldInfo.isContentEditable || element.contentEditable === 'true') {
          if (value && value.trim()) {
            // Clear existing content
            element.textContent = '';
            element.innerText = '';
            // Set new value
            element.textContent = value;
            element.innerText = value;
            // Trigger input event
            element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            // Also trigger keyup for Google Forms
            element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true }));
          }
        } else {
          // Regular input elements
          if (value && value.trim()) {
            element.value = value;
            // For Google Forms, also set the value property directly
            element.setAttribute('value', value);
            // Trigger multiple events to ensure Google Forms recognizes the change
            element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            // Also try focus/blur to trigger validation
            if (document.activeElement !== element) {
              element.focus();
              element.blur();
            }
          }
        }
        break;

      case 'date':
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        break;

      case 'radio':
        // Check if this is a year field and value needs conversion
        let valueToMatch = value;
        const fieldLabel = fieldInfo.label || '';
        // Check if field is year-related by label or predicted field
        const isYearFieldByLabel = /\b(year|graduation|passing|completion)\b/i.test(fieldLabel) ||predictedField === 'yearOfGraduation' ||
                                   predictedField === 'CurrentYear' || predictedField === 'yearOfStudy';
        
        // Also check if options are all 4-digit years (suggests graduation year field)
        const optionsAreYears = fieldInfo.options && fieldInfo.options.length > 0 &&
          fieldInfo.options.every(opt => {
            const optValue = String(opt.value || opt.label || '').trim();
            return /^\d{4}$/.test(optValue);
          });
        
        const isYearField = isYearFieldByLabel || optionsAreYears;
        
        // If value is a single digit (1-4) and options are years (4-digit), convert year of study to graduation year
        if (isYearField && /^[1-4]$/.test(String(value).trim()) && optionsAreYears) {
          const yearOfStudy = parseInt(String(value).trim(), 10);
          const currentYear = new Date().getFullYear();
          // Calculate graduation year: if in 4th year, graduating this year or next
          // If in 3rd year, graduating next year or year after
          // If in 2nd year, graduating in 2-3 years
          // If in 1st year, graduating in 3-4 years
          const yearsUntilGraduation = 5 - yearOfStudy; // Assuming 4-year course
          const possibleGraduationYears = [
            currentYear + yearsUntilGraduation - 1,
            currentYear + yearsUntilGraduation,
            currentYear + yearsUntilGraduation + 1
          ];
          
          // Try to find matching graduation year in options
          for (const gradYear of possibleGraduationYears) {
            const yearStr = String(gradYear);
            const yearMatch = fieldInfo.options.find(opt => {
              const optValue = String(opt.value || '').trim();
              const optLabel = String(opt.label || '').trim();
              return optValue === yearStr || optLabel === yearStr ||
                     optValue.includes(yearStr) || optLabel.includes(yearStr);
            });
            if (yearMatch) {
              valueToMatch = yearStr;
              console.log(`[Filleasy] Converted year of study "${value}" to graduation year "${valueToMatch}"`);
              break;
            }
          }
        }
        
        // Find matching option using intelligent matching
        // Validate that the value can actually match a radio option
        const valueStr = String(valueToMatch || '').trim();
        
        // Skip if value is a phone number (10+ digits) and doesn't match any option
        if (/^\d{10,}$/.test(valueStr)) {
          // Check if any option actually contains this number
          const hasMatch = fieldInfo.options.some(opt => {
            const optValue = String(opt.value || opt.label || '').trim();
            return optValue === valueStr || optValue.includes(valueStr);
          });
          if (!hasMatch) {
            console.warn('[Filleasy] Skipping radio button - value is a phone number that doesn\'t match any option:', valueStr);
            return false;
          }
        }
        
        // Skip if value is a long numeric string (>5 digits) that doesn't match any option
        if (/^\d+$/.test(valueStr) && valueStr.length > 5) {
          const hasNumericMatch = fieldInfo.options.some(opt => {
            const optValue = String(opt.value || opt.label || '').trim();
            return optValue === valueStr || optValue.includes(valueStr) || valueStr.includes(optValue);
          });
          if (!hasNumericMatch) {
            console.warn('[Filleasy] Skipping radio button - long numeric value doesn\'t match any option:', valueStr);
            return false;
          }
        }
        
        const radioMatch = findMatchingOption(fieldInfo.options || [], valueToMatch);
        if (radioMatch) {
          const radioElement = radioMatch.inputElement || radioMatch.element;
          
          // For Google Forms radio buttons
          if (fieldInfo.isGoogleForms) {
            // Click the div container
            if (radioMatch.element && radioMatch.element.getAttribute('role') === 'radio') {
              // Uncheck other options in the group first
              const container = radioMatch.element.closest('[role="radiogroup"]') || 
                               radioMatch.element.closest('[role="listitem"]');
              if (container) {
                container.querySelectorAll('[role="radio"]').forEach(radio => {
                  if (radio !== radioMatch.element) {
                    radio.setAttribute('aria-checked', 'false');
                    const input = radio.querySelector('input[type="radio"]');
                    if (input) input.checked = false;
                  }
                });
              }
              
              // Check this option
              radioMatch.element.setAttribute('aria-checked', 'true');
              radioMatch.element.click();
              
              // Also check the input if it exists
              if (radioMatch.inputElement) {
                radioMatch.inputElement.checked = true;
                radioMatch.inputElement.dispatchEvent(new Event('change', { bubbles: true }));
              }
              
              // Trigger change event on container
              if (container) {
                container.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          } else {
            // Standard HTML radio button
            if (radioElement && !radioElement.checked) {
              radioElement.checked = true;
              radioElement.dispatchEvent(new Event('change', { bubbles: true }));
              radioElement.dispatchEvent(new Event('click', { bubbles: true }));
            }
          }
        } else {
          // Before logging error, check if this is clearly a mismatch (e.g., phone number vs text options)
          const valueStr = String(value).trim();
          const isPhoneNumber = /^\d{10,}$/.test(valueStr);
          const isLongNumeric = /^\d+$/.test(valueStr) && valueStr.length > 5;
          
          // If value is a phone number or long numeric and options are text-based, skip silently
          if ((isPhoneNumber || isLongNumeric) && fieldInfo.options.every(opt => {
            const optValue = String(opt.value || opt.label || '').trim();
            return !/^\d+$/.test(optValue); // All options are non-numeric
          })) {
            console.warn('[Filleasy] Skipping radio button - numeric value does not match text-based options:', valueStr, 'Field label:', fieldInfo.label);
            return false;
          }
          
          // Improved logging to show actual option values
          const optionDetails = fieldInfo.options.map(opt => ({
            value: opt.value || '',
            label: opt.label || '',
            element: opt.element ? 'present' : 'missing'
          }));
          console.warn('[Filleasy] No radio match found for value:', value, 'Options:', JSON.stringify(optionDetails, null, 2));
          
          // Try direct numeric/string matching as last resort
          
          // If this is a year field and value is single digit, try year conversion again
          if (isYearField && /^[1-4]$/.test(valueStr) && optionsAreYears) {
            const yearOfStudy = parseInt(valueStr, 10);
            const currentYear = new Date().getFullYear();
            const yearsUntilGraduation = 5 - yearOfStudy;
            const possibleGraduationYears = [
              currentYear + yearsUntilGraduation - 1,
              currentYear + yearsUntilGraduation,
              currentYear + yearsUntilGraduation + 1
            ];
            
            // Try each possible graduation year
            for (const gradYear of possibleGraduationYears) {
              const yearStr = String(gradYear);
              const yearMatch = fieldInfo.options.find(opt => {
                const optValue = String(opt.value || '').trim();
                const optLabel = String(opt.label || '').trim();
                return optValue === yearStr || optLabel === yearStr;
              });
              if (yearMatch) {
                valueStr = yearStr;
                console.log(`[Filleasy] Fallback: Converted year of study "${value}" to graduation year "${valueStr}"`);
                break;
              }
            }
          }
          
          const directMatch = fieldInfo.options.find(opt => {
            const optValue = String(opt.value || '').trim();
            const optLabel = String(opt.label || '').trim();
            return optValue === valueStr || optLabel === valueStr ||
                   optValue.includes(valueStr) || optLabel.includes(valueStr) ||
                   valueStr.includes(optValue) || valueStr.includes(optLabel);
          });
          
          if (directMatch) {
            const radioElement = directMatch.inputElement || directMatch.element;
            if (fieldInfo.isGoogleForms && directMatch.element && directMatch.element.getAttribute('role') === 'radio') {
              // Google Forms radio button
              const container = directMatch.element.closest('[role="radiogroup"]') || 
                               directMatch.element.closest('[role="listitem"]');
              if (container) {
                container.querySelectorAll('[role="radio"]').forEach(radio => {
                  if (radio !== directMatch.element) {
                    radio.setAttribute('aria-checked', 'false');
                    const input = radio.querySelector('input[type="radio"]');
                    if (input) input.checked = false;
                  }
                });
              }
              directMatch.element.setAttribute('aria-checked', 'true');
              directMatch.element.click();
              if (directMatch.inputElement) {
                directMatch.inputElement.checked = true;
                directMatch.inputElement.dispatchEvent(new Event('change', { bubbles: true }));
              }
              if (container) {
                container.dispatchEvent(new Event('change', { bubbles: true }));
              }
            } else if (radioElement) {
              // Standard HTML radio button
              radioElement.checked = true;
              radioElement.dispatchEvent(new Event('change', { bubbles: true }));
              radioElement.dispatchEvent(new Event('click', { bubbles: true }));
            }
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
        // Check if this is a year field and value needs conversion (similar to radio)
        let dropdownValueToMatch = value;
        const dropdownFieldLabel = fieldInfo.label || '';
        const isDropdownYearField = /\b(year|graduation|passing|completion)\b/i.test(dropdownFieldLabel) ||
                                   predictedField === 'year' || predictedField === 'yearOfStudy';
        
        // Get options - handle both standard select and Google Forms dropdowns
        let selectOptions = [];
        if (element.tagName === 'SELECT') {
          selectOptions = Array.from(element.options || []);
        } else if (fieldInfo.options && fieldInfo.options.length > 0) {
          // Google Forms dropdown - use stored options
          selectOptions = fieldInfo.options.map(opt => ({
            value: opt.value || opt.label || '',
            text: opt.label || opt.value || '',
            element: opt.element
          }));
        }
        
        // Check if options are all 4-digit years
        const dropdownOptionsAreYears = selectOptions.length > 0 &&
          selectOptions.every(opt => {
            const optValue = String(opt.value || opt.text || '').trim();
            return /^\d{4}$/.test(optValue);
          });
        
        const isDropdownYear = isDropdownYearField || dropdownOptionsAreYears;
        
        // Convert year of study to graduation year if needed
        if (isDropdownYear && /^[1-4]$/.test(String(value).trim()) && dropdownOptionsAreYears) {
          const yearOfStudy = parseInt(String(value).trim(), 10);
          const currentYear = new Date().getFullYear();
          const yearsUntilGraduation = 5 - yearOfStudy;
          const possibleGraduationYears = [
            currentYear + yearsUntilGraduation - 1,
            currentYear + yearsUntilGraduation,
            currentYear + yearsUntilGraduation + 1
          ];
          
          // Try to find matching graduation year in options
          for (const gradYear of possibleGraduationYears) {
            const yearStr = String(gradYear);
            const yearMatch = selectOptions.find(opt => {
              const optValue = String(opt.value || '').trim();
              const optText = String(opt.text || '').trim();
              return optValue === yearStr || optText === yearStr ||
                     optValue.includes(yearStr) || optText.includes(yearStr);
            });
            if (yearMatch) {
              dropdownValueToMatch = yearStr;
              console.log(`[Filleasy] Dropdown: Converted year of study "${value}" to graduation year "${dropdownValueToMatch}"`);
              break;
            }
          }
        }
        
        // For Google Forms dropdowns (contenteditable)
        if (fieldInfo.isGoogleForms) {
          const valueStr = String(dropdownValueToMatch).trim();
          
          // Try immediate filling if options are available
          if (selectOptions.length > 0) {
            const filled = fillGoogleFormsDropdown(element, fieldInfo, valueStr, selectOptions);
            if (filled) return true;
          }
          
          // If options weren't available initially, click to open dropdown and get options
          const container = fieldInfo.dropdownContainer || element.closest('[role="listbox"], [role="combobox"]') || element;
          
          // Click to open dropdown
          try {
            if (element.click) {
              element.click();
            } else if (container && container.click) {
              container.click();
            } else if (element.focus) {
              element.focus();
            }
          } catch (e) {
            console.warn('[Filleasy] Error clicking dropdown:', e);
          }
          
          // Wait for dropdown to open and try to find options
          setTimeout(() => {
            const newOptions = [];
            
            // Look for options in the container or document
            const searchContainer = container || document;
            const optionElements = searchContainer.querySelectorAll('[role="option"], .freebirdFormviewerViewItemsItemItem, [data-value], .exportSelectPopup [role="option"]');
            
            optionElements.forEach(opt => {
              const optText = opt.textContent?.trim() || opt.getAttribute('aria-label') || opt.getAttribute('data-value') || '';
              if (optText && optText.length > 0) {
                newOptions.push({
                  value: optText,
                  label: optText,
                  element: opt
                });
              }
            });
            
            // If still no options, try looking for select element
            if (newOptions.length === 0) {
              const selectElement = container.querySelector('select');
              if (selectElement) {
                Array.from(selectElement.options || []).forEach(opt => {
                  const optText = opt.text || opt.value || '';
                  if (optText) {
                    newOptions.push({
                      value: optText,
                      label: optText,
                      element: opt
                    });
                  }
                });
              }
            }
            
            if (newOptions.length > 0) {
              const filled = fillGoogleFormsDropdown(element, fieldInfo, valueStr, newOptions);
              if (!filled) {
                // Last resort: set text directly
                if (element.textContent !== undefined) {
                  element.textContent = valueStr;
                }
                if (element.innerText !== undefined) {
                  element.innerText = valueStr;
                }
                element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
              }
            } else {
              // No options found - try direct text setting
              if (element.textContent !== undefined) {
                element.textContent = valueStr;
              }
              if (element.innerText !== undefined) {
                element.innerText = valueStr;
              }
              element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
              element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            }
          }, 300);
          
          // Return true to indicate we're attempting to fill (async)
          return true;
        }
        
        // For standard select dropdowns, try to find matching option using intelligent matching
        if (element.tagName === 'SELECT') {
          const matchedOption = findMatchingSelectOption(selectOptions, dropdownValueToMatch, predictedField);
          if (matchedOption) {
            element.value = matchedOption.value;
            // Trigger multiple events for Google Forms compatibility
            element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            // Also try focus/blur to trigger validation
            if (document.activeElement !== element) {
              element.focus();
              element.blur();
            }
            return true;
          } else {
            // Fallback: try direct value assignment
            const valueStr = String(dropdownValueToMatch).trim();
            const directMatch = selectOptions.find(opt => {
              const optValue = String(opt.value || '').trim();
              const optText = String(opt.text || opt.textContent || '').trim();
              return optValue === valueStr || optText === valueStr ||
                     optValue.toLowerCase() === valueStr.toLowerCase() ||
                     optText.toLowerCase() === valueStr.toLowerCase() ||
                     optValue.includes(valueStr) || optText.includes(valueStr) ||
                     valueStr.includes(optValue) || valueStr.includes(optText);
            });
            
            if (directMatch) {
              element.value = directMatch.value || directMatch.text;
              element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
              element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
              return true;
            } else {
              // Last resort: try direct assignment
              element.value = dropdownValueToMatch;
              element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
              console.warn('[Filleasy] Dropdown: No match found for value:', dropdownValueToMatch, 'Options:', selectOptions.map(opt => ({ value: opt.value || opt.text, text: opt.text || opt.value })));
            }
          }
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
 * Fill Google Forms dropdown
 * @param {HTMLElement} element - The dropdown element
 * @param {Object} fieldInfo - Field information
 * @param {string} valueStr - Value to fill
 * @param {Array} selectOptions - Available options
 * @returns {boolean} - True if filled successfully
 */
function fillGoogleFormsDropdown(element, fieldInfo, valueStr, selectOptions) {
  if (!element || !valueStr) return false;
  
  // Try to find matching option
  const googleMatch = selectOptions.find(opt => {
    const optValue = String(opt.value || '').trim();
    const optText = String(opt.text || opt.label || '').trim();
    return optValue === valueStr || optText === valueStr ||
           optValue.toLowerCase() === valueStr.toLowerCase() ||
           optText.toLowerCase() === valueStr.toLowerCase() ||
           optValue.includes(valueStr) || optText.includes(valueStr) ||
           valueStr.includes(optValue) || valueStr.includes(optText);
  });
  
  if (googleMatch && googleMatch.element) {
    // Click the option element
    try {
      googleMatch.element.click();
      // Also set text content
      if (element.textContent !== undefined) {
        element.textContent = googleMatch.label || googleMatch.value;
      }
      if (element.innerText !== undefined) {
        element.innerText = googleMatch.label || googleMatch.value;
      }
      element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      return true;
    } catch (e) {
      console.warn('[Filleasy] Error clicking dropdown option:', e);
    }
  }
  
  // Try using findMatchingOption for better matching
  if (selectOptions.length > 0) {
    const optionObjects = selectOptions.map(opt => ({
      element: opt.element,
      value: opt.value || opt.label || '',
      label: opt.label || opt.value || '',
      inputElement: null
    }));
    
    const matchedOption = findMatchingOption(optionObjects, valueStr);
    if (matchedOption && matchedOption.element) {
      try {
        matchedOption.element.click();
        if (element.textContent !== undefined) {
          element.textContent = matchedOption.label || matchedOption.value;
        }
        if (element.innerText !== undefined) {
          element.innerText = matchedOption.label || matchedOption.value;
        }
        element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        return true;
      } catch (e) {
        console.warn('[Filleasy] Error clicking matched dropdown option:', e);
      }
    }
  }
  
  return false;
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
  if (predictedField === 'year' || predictedField === 'yearOfStudy') {
    // First, try to extract 4-digit year from profile value
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
    
    // If profile value is a single digit (1-4), convert to graduation year
    const singleDigitMatch = String(profileValue).trim().match(/^[1-4]$/);
    if (singleDigitMatch) {
      const yearOfStudy = parseInt(singleDigitMatch[0], 10);
      const currentYear = new Date().getFullYear();
      const yearsUntilGraduation = 5 - yearOfStudy; // Assuming 4-year course
      const possibleGraduationYears = [
        currentYear + yearsUntilGraduation - 1,
        currentYear + yearsUntilGraduation,
        currentYear + yearsUntilGraduation + 1
      ];
      
      // Try to find matching graduation year in options
      for (const gradYear of possibleGraduationYears) {
        const yearStr = String(gradYear);
        for (const opt of fieldInfo.options) {
          const optValue = String(opt.value || '').trim();
          const optLabel = String(opt.label || '').trim();
          if (optValue === yearStr || optLabel === yearStr ||
              optValue.includes(yearStr) || optLabel.includes(yearStr)) {
            return opt.value || opt.label;
          }
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

  // Convert to string for consistent comparison
  const profileValueStr = String(profileValue).trim();
  const normalizedProfile = normalizeString(profileValueStr);
  
  // Priority 0: Direct string/numeric match (before normalization)
  // This handles cases where value is "4" and option is "4" or "4th" etc.
  let match = options.find(opt => {
    const optValue = String(opt.value || '').trim();
    const optLabel = String(opt.label || '').trim();
    // Exact match
    if (optValue === profileValueStr || optLabel === profileValueStr) return true;
    // Numeric match (e.g., "4" matches "4", "4th", "Fourth Year", etc.)
    if (/^\d+$/.test(profileValueStr)) {
      const num = parseInt(profileValueStr, 10);
      // Check if option contains the number
      if (optValue.includes(profileValueStr) || optLabel.includes(profileValueStr)) return true;
      // Check for ordinal numbers (1st, 2nd, 3rd, 4th)
      const ordinals = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
      if (num > 0 && num < ordinals.length) {
        const ordinal = ordinals[num];
        if (ordinal && (optValue.toLowerCase().includes(ordinal) || optLabel.toLowerCase().includes(ordinal))) return true;
      }
    }
    return false;
  });
  if (match) return match;
  
  // Priority 1: Exact match (case-insensitive, normalized)
  match = options.find(opt => 
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
 * @param {string} predictedField - Predicted field name (optional)
 * @returns {HTMLOptionElement|null} - Matching option element or null
 */
function findMatchingSelectOption(options, profileValue, predictedField = null) {
  if (!options || options.length === 0 || !profileValue) return null;

  // Convert to string for consistent comparison
  const profileValueStr = String(profileValue).trim();
  const normalizedProfile = normalizeString(profileValueStr);
  
  // Convert options to objects for easier matching
  const optionObjects = options.map(opt => ({
    element: opt,
    value: opt.value || '',
    label: opt.text || opt.label || '',
    inputElement: null // Not applicable for select
  }));

  // Priority 0: Direct string/numeric match (before normalization)
  // This handles cases where value is "4" and option is "4" or "4th" etc.
  let match = optionObjects.find(opt => {
    const optValue = String(opt.value || '').trim();
    const optLabel = String(opt.label || '').trim();
    // Exact match
    if (optValue === profileValueStr || optLabel === profileValueStr) return true;
    // Numeric match (e.g., "4" matches "4", "4th", "Fourth Year", etc.)
    if (/^\d+$/.test(profileValueStr)) {
      const num = parseInt(profileValueStr, 10);
      // Check if option contains the number
      if (optValue.includes(profileValueStr) || optLabel.includes(profileValueStr)) return true;
      // Check for ordinal numbers (1st, 2nd, 3rd, 4th)
      const ordinals = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
      if (num > 0 && num < ordinals.length) {
        const ordinal = ordinals[num];
        if (ordinal && (optValue.toLowerCase().includes(ordinal) || optLabel.toLowerCase().includes(ordinal))) return true;
      }
    }
    return false;
  });
  if (match) return match.element;

  // Use the same intelligent matching logic as radio buttons
  const intelligentMatch = findMatchingOption(optionObjects, profileValue);
  if (intelligentMatch) return intelligentMatch.element;
  
  // Fallback: try findExactDropdownMatch if predictedField is available
  if (predictedField) {
    const fieldInfo = {
      options: optionObjects,
      label: ''
    };
    const exactMatch = findExactDropdownMatch(fieldInfo, profileValue, predictedField);
    if (exactMatch) {
      // Find the option element that matches the returned value
      const matchedOpt = options.find(opt => {
        const optValue = String(opt.value || '').trim();
        const optText = String(opt.text || '').trim();
        return optValue === exactMatch || optText === exactMatch ||
               optValue.includes(exactMatch) || optText.includes(exactMatch);
      });
      if (matchedOpt) return matchedOpt;
    }
  }

  return null;
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
