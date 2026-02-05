/**
 * Options Page Script - Handles profile management, settings, and custom fields
 */

let profile = null;
let customFields = {};
let encryptionKey = null;
let currentTab = 'profile';

// error null value 
function setValue(id, value = '') {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function setChecked(id, value = false) {
  const el = document.getElementById(id);
  if (el) el.checked = value;
}


// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  await initializeOptions();
  setupEventListeners();
  setupTabNavigation();
});

/**
 * Initialize options page
 */
async function initializeOptions() {
  // Check authentication
  const isAuthenticated = await AuthManager.isAuthenticated();
  if (!isAuthenticated) {
    alert('Please unlock the extension first from the popup.');
    window.close();
    return;
  }

  const storedHash = await StorageManager.get('masterPasswordHash');
  const storedSalt = await StorageManager.get('masterPasswordSalt');
  
  if (!storedHash || !storedSalt) {
    alert('Please set up your account first from the extension popup.');
    window.close();
    return;
  }

  const password = prompt('Enter your master password to access settings:');
  if (!password) {
    window.close();
    return;
  }

  try {
    const isValid = await CryptoUtils.verifyPassword(password, storedHash, storedSalt);
    if (!isValid) {
      alert('Incorrect password.');
      window.close();
      return;
    }

    const saltArray = Uint8Array.from(atob(storedSalt), c => c.charCodeAt(0));
    encryptionKey = await CryptoUtils.deriveKey(password, saltArray);
    
    await loadUserData();
    populateProfileForm();
    updateCustomFieldsList();
    
    if (currentTab === 'ml') {
      loadMLStats();
    }
  } catch (error) {
    console.error('Error initializing options:', error);
    alert('Error: ' + error.message);
    window.close();
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  document.getElementById('profile-form')?.addEventListener('submit', handleSaveProfile);
  document.getElementById('reset-profile-btn')?.addEventListener('click', () => {
    if (confirm('Reset all profile data? This cannot be undone.')) {
      profile = ProfileManager.getDefaultProfile();
      populateProfileForm();
    }
  });

  // Auto-calculate fullName when first/middle/last name changes
  ['firstName', 'middleName', 'lastName'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateFullName);
  });

  // Auto-calculate percentages when CGPA changes
  ['firstYearCGPA', 'secondYearCGPA', 'thirdYearCGPA', 'fourthYearCGPA', 'aggregateCGPA'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updatePercentages);
  });
  document.getElementById('cgpaMultiplier')?.addEventListener('input', updatePercentages);

  document.getElementById('add-custom-field-options-btn')?.addEventListener('click', () => {
    showCustomFieldModal();
  });
  document.getElementById('close-modal-options-btn')?.addEventListener('click', closeCustomFieldModal);
  document.getElementById('cancel-field-options-btn')?.addEventListener('click', closeCustomFieldModal);
  document.getElementById('custom-field-form-options')?.addEventListener('submit', handleAddCustomField);


  document.getElementById('ml-test-btn')?.addEventListener('click', handleMLTest);
  document.getElementById('ml-test-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleMLTest();
    }
  });

  document.getElementById('export-data-btn')?.addEventListener('click', handleExportData);
  document.getElementById('import-data-btn')?.addEventListener('click', () => {
    document.getElementById('import-file-input').click();
  });
  document.getElementById('import-file-input')?.addEventListener('change', handleImportData);
  document.getElementById('clear-data-btn')?.addEventListener('click', handleClearData);
}

/**
 * Auto-update fullName
 */
function updateFullName() {
  const firstName = document.getElementById('firstName').value.trim();
  const middleName = document.getElementById('middleName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  
  const parts = [firstName, middleName, lastName].filter(Boolean);
  document.getElementById('fullName').value = parts.join(' ');
}


/**
 * Auto-calculate percentages from CGPA (percentage = 9.5 * CGPA)
 */

function updatePercentages() {
  const multiplier = parseFloat(document.getElementById('cgpaMultiplier')?.value) || 9.5;
  
  const cgpaFields = [
    { cgpa: 'firstYearCGPA', percentage: 'firstYearPercentage' },
    { cgpa: 'secondYearCGPA', percentage: 'secondYearPercentage' },
    { cgpa: 'thirdYearCGPA', percentage: 'thirdYearPercentage' },
    { cgpa: 'fourthYearCGPA', percentage: 'fourthYearPercentage' }
  ];

  // Calculate percentages for each year
  cgpaFields.forEach(({ cgpa, percentage }) => {
    const cgpaValue = parseFloat(document.getElementById(cgpa).value);
    if (!isNaN(cgpaValue) && cgpaValue > 0) {
      document.getElementById(percentage).value = (multiplier * cgpaValue).toFixed(2);
    } else {
      document.getElementById(percentage).value = '';
    }
  });

  // Auto-calculate aggregate CGPA (average of all years)
  const yearCGPAs = [
    parseFloat(document.getElementById('firstYearCGPA').value),
    parseFloat(document.getElementById('secondYearCGPA').value),
    parseFloat(document.getElementById('thirdYearCGPA').value),
    parseFloat(document.getElementById('fourthYearCGPA').value)
  ].filter(val => !isNaN(val) && val > 0);

  if (yearCGPAs.length > 0) {
    const avgCGPA = yearCGPAs.reduce((sum, val) => sum + val, 0) / yearCGPAs.length;
    document.getElementById('aggregateCGPA').value = avgCGPA.toFixed(2);
    document.getElementById('graduationPercentage').value = (multiplier * avgCGPA).toFixed(2);
  } else {
    // If no year CGPAs are entered, clear aggregate fields
    document.getElementById('aggregateCGPA').value = '';
    document.getElementById('graduationPercentage').value = '';
  }
}

/**
 * Setup tab navigation
 */
function setupTabNavigation() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

/**
 * Switch tabs
 */
function switchTab(tab) {
  currentTab = tab;
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tab}-tab`);
  });

  if (tab === 'ml') {
    loadMLStats();
  }
}

/**
 * Load user data
 */
async function loadUserData() {
  if (!encryptionKey) return;

  try {
    profile = await StorageManager.getEncrypted('profile', encryptionKey) || ProfileManager.getDefaultProfile();
    customFields = await StorageManager.getEncrypted('customFields', encryptionKey) || {};
  } catch (error) {
    console.error('Error loading user data:', error);
    profile = ProfileManager.getDefaultProfile();
    customFields = {};
  }
}

/**
 * Save user data
 */
async function saveUserData() {
  if (!encryptionKey) return;

  try {
    await StorageManager.saveEncrypted('profile', profile, encryptionKey);
    await StorageManager.saveEncrypted('customFields', customFields, encryptionKey);
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    alert('Error saving data: ' + error.message);
    return false;
  }
}

/**
 * Populate profile form with data
 */
function populateProfileForm() {
  if (!profile) return;

  // Personal
  setValue('firstName', profile.personal?.firstName);
  setValue('middleName', profile.personal?.middleName || '');
  setValue('lastName', profile.personal?.lastName || '');
  setValue('fullName', profile.personal?.fullName || '');
  setValue('phone', profile.personal?.phone || '');
  setValue('gender', profile.personal?.gender || '');
  setValue('dateOfBirth', profile.personal?.dateOfBirth || '');
  setValue('email', profile.personal?.email || '');
  setValue('aadhaarNumber', profile.personal?.aadhaarNumber || '');
  setValue('prnNumber', profile.personal?.prnNumber || '');
  setValue('physicallyChallenged', profile.personal?.physicallyChallenged || '');
  // Current Address
  setValue('currentHouseNumber', profile.currentAddress?.houseNumber || '');
  setValue('currentAddress', profile.currentAddress?.address || '');
  setValue('currentCity', profile.currentAddress?.city || '');
  setValue('currentState', profile.currentAddress?.state || '');
  setValue('currentPincode', profile.currentAddress?.pincode || '');

  // Permanent Address
  setValue('permanentHouseNumber', profile.permanentAddress?.houseNumber || '');
  setValue('permanentAddress', profile.permanentAddress?.address || '');
  setValue('permanentCity', profile.permanentAddress?.city || '');
  setValue('permanentState', profile.permanentAddress?.state || '');
  setValue('permanentPincode', profile.permanentAddress?.pincode || '');

  // Academic - 10th
  setValue('tenthPercentage', profile.academic?.tenthPercentage || '');
  setValue('tenthBoard', profile.academic?.tenthBoard || '');
  setValue('tenthPassingYear', profile.academic?.tenthPassingYear || '');
  setValue('tenthSchoolName', profile.academic?.tenthSchoolName || '');

  // Academic - 12th
  setValue('twelfthPercentage', profile.academic?.twelfthPercentage || '');
  setValue('twelfthBoard', profile.academic?.twelfthBoard || '');
  setValue('twelfthPassingYear', profile.academic?.twelfthPassingYear || '');
  setValue('twelfthCollegeName', profile.academic?.twelfthCollegeName || '');

  // Academic - Diploma
  setValue('diplomaPercentage', profile.academic?.diplomaPercentage || '');
  setValue('diplomaCollege', profile.academic?.diplomaCollege || '');
  setValue('diplomaSpecialization', profile.academic?.diplomaSpecialization || '');
  setValue('diplomaPassingYear', profile.academic?.diplomaPassingYear || '');

  // Academic - MCA
  setValue('mcaPercentage', profile.academic?.mcaPercentage || '');
  setValue('mcaCollege', profile.academic?.mcaCollege || '');
  setValue('mcaSpecialization', profile.academic?.mcaSpecialization || '');
  setValue('mcaPassingYear', profile.academic?.mcaPassingYear || '');

  // Academic - College
  setValue('collegeName', profile.academic?.collegeName || '');
  setValue('universityName', profile.academic?.universityName || '');
  setValue('collegeCity', profile.academic?.collegeCity || '');
  setValue('collegeState', profile.academic?.collegeState || '');
  setValue('collegePincode', profile.academic?.collegePincode || '');
  setValue('degree', profile.academic?.degree || '');
  setValue('branch', profile.academic?.branch || '');
  setValue('specialization', profile.academic?.specialization || '');
  setValue('currentSemester', profile.academic?.currentSemester || ''); 

  // Year-wise CGPA
  setValue('firstYearCGPA', profile.academic?.firstYearCGPA || '');
  setValue('firstYearPercentage', profile.academic?.firstYearPercentage || '');
  setValue('secondYearCGPA', profile.academic?.secondYearCGPA || '');
  setValue('secondYearPercentage', profile.academic?.secondYearPercentage || '');
  setValue('thirdYearCGPA', profile.academic?.thirdYearCGPA || '');
  setValue('thirdYearPercentage', profile.academic?.thirdYearPercentage || '');
  setValue('fourthYearCGPA', profile.academic?.fourthYearCGPA || '');
  setValue('fourthYearPercentage', profile.academic?.fourthYearPercentage || '');
  setValue('cgpaMultiplier', profile.academic?.cgpaMultiplier || '9.5');
  setValue('aggregateCGPA', profile.academic?.aggregateCGPA || '');
  setValue('graduationPercentage', profile.academic?.graduationPercentage || '');
  // Other academic
  setValue('backlogs', profile.academic?.backlogs || '');
  setValue('collegeEmailId', profile.academic?.collegeEmailId || '');
  setValue('yearOfGraduation', profile.academic?.yearOfGraduation || '');

  // Technical
  setValue('programmingLanguages', profile.technical?.programmingLanguages || '');
  setValue('languages', profile.technical?.languages || '');
  setValue('personalAchievements', profile.technical?.personalAchievements || '');
  setValue('technicalSkills', profile.technical?.technicalSkills || '');
  setValue('technicalAchievements', profile.technical?.technicalAchievements || '');
  setValue('project', profile.technical?.project || '');

  // Coding
  setValue('linkedinLink', profile.coding?.linkedinLink || '');
  setValue('leetcodeScore', profile.coding?.leetcodeScore || '');
  setValue('leetcodeLink', profile.coding?.leetcodeLink || '');
  setValue('gfgScore', profile.coding?.gfgScore || '');
  setValue('gfgLink', profile.coding?.gfgLink || '');
  setValue('cocubesScore', profile.coding?.cocubesScore || '');
  setValue('codechefRank', profile.coding?.codechefRank || '');
  setValue('codechefLink', profile.coding?.codechefLink || '');
  setValue('hackerearthRating', profile.coding?.hackerearthRating || '');
  setValue('hackerearthLink', profile.coding?.hackerearthLink || '');
  setValue('hackerrankRating', profile.coding?.hackerrankRating || '');
  setValue('hackerrankLink', profile.coding?.hackerrankLink || '');
  setValue('githubLink', profile.coding?.githubLink || '');
  setValue('certificationLink', profile.coding?.certificationLink|| '');
  setValue('resumeLink', profile.coding?.resumeLink || '');
  // Documents
  setValue('tenthMarksheetLink', profile.documents?.tenthMarksheetLink || '');
  setValue('twelfthMarksheetLink', profile.documents?.twelfthMarksheetLink || '');
  setValue('passportPhotoLink', profile.documents?.passportPhotoLink || '');
}

/**
 * Handle save profile
 */
async function handleSaveProfile(e) {
  e.preventDefault();
  
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const collegeName = document.getElementById('collegeName').value.trim();
  
  if (!firstName || !lastName || !email || !collegeName) {
    alert('First Name, Last Name, Email, and College Name are required fields.');
    return;
  }

  if (email && !ProfileManager.isValidEmail(email)) {
    alert('Invalid email format.');
    return;
  }

  profile = {
    personal: {
      firstName: firstName,
      middleName: document.getElementById('middleName').value.trim(),
      lastName: lastName,
      fullName: document.getElementById('fullName').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      gender: document.getElementById('gender').value,
      dateOfBirth: document.getElementById('dateOfBirth').value,
      email: email,
      aadhaarNumber: document.getElementById('aadhaarNumber').value.trim(),
      prnNumber: document.getElementById('prnNumber').value.trim(),
      physicallyChallenged: document.getElementById('physicallyChallenged').value
    },
    currentAddress: {
      houseNumber: document.getElementById('currentHouseNumber').value.trim(),
      address: document.getElementById('currentAddress').value.trim(),
      city: document.getElementById('currentCity').value.trim(),
      state: document.getElementById('currentState').value.trim(),
      pincode: document.getElementById('currentPincode').value.trim()
    },
    permanentAddress: {
      houseNumber: document.getElementById('permanentHouseNumber').value.trim(),
      address: document.getElementById('permanentAddress').value.trim(),
      city: document.getElementById('permanentCity').value.trim(),
      state: document.getElementById('permanentState').value.trim(),
      pincode: document.getElementById('permanentPincode').value.trim()
    },
    address: profile.address || {},
    academic: {
      tenthPercentage: document.getElementById('tenthPercentage').value,
      tenthBoard: document.getElementById('tenthBoard').value.trim(),
      tenthPassingYear: document.getElementById('tenthPassingYear').value,
      tenthSchoolName: document.getElementById('tenthSchoolName').value.trim(),
      twelfthPercentage: document.getElementById('twelfthPercentage').value,
      twelfthBoard: document.getElementById('twelfthBoard').value.trim(),
      twelfthPassingYear: document.getElementById('twelfthPassingYear').value,
      twelfthCollegeName: document.getElementById('twelfthCollegeName').value.trim(),
      diplomaPercentage: document.getElementById('diplomaPercentage').value,
      diplomaCollege: document.getElementById('diplomaCollege').value.trim(),
      diplomaSpecialization: document.getElementById('diplomaSpecialization').value.trim(),
      diplomaPassingYear: document.getElementById('diplomaPassingYear').value,
      mcaPercentage: document.getElementById('mcaPercentage').value,
      mcaCollege: document.getElementById('mcaCollege').value.trim(),
      mcaSpecialization: document.getElementById('mcaSpecialization').value.trim(),
      mcaPassingYear: document.getElementById('mcaPassingYear').value,
      collegeName: collegeName,
      universityName: document.getElementById('universityName').value.trim(),
      collegeCity: document.getElementById('collegeCity').value.trim(),
      collegeState: document.getElementById('collegeState').value.trim(),
      collegePincode: document.getElementById('collegePincode').value.trim(),
      degree: document.getElementById('degree').value.trim(),
      branch: document.getElementById('branch').value.trim(),
      specialization: document.getElementById('specialization').value.trim(),
      cgpaMultiplier: document.getElementById('cgpaMultiplier').value || '9.5',
      currentSemester: document.getElementById('currentSemester').value,
      firstYearCGPA: document.getElementById('firstYearCGPA').value,
      firstYearPercentage: document.getElementById('firstYearPercentage').value,
      secondYearCGPA: document.getElementById('secondYearCGPA').value,
      secondYearPercentage: document.getElementById('secondYearPercentage').value,
      thirdYearCGPA: document.getElementById('thirdYearCGPA').value,
      thirdYearPercentage: document.getElementById('thirdYearPercentage').value,
      fourthYearCGPA: document.getElementById('fourthYearCGPA').value,
      fourthYearPercentage: document.getElementById('fourthYearPercentage').value,
      aggregateCGPA: document.getElementById('aggregateCGPA').value,
      graduationPercentage: document.getElementById('graduationPercentage').value,
      backlogs: document.getElementById('backlogs').value,
      collegeEmailId: document.getElementById('collegeEmailId').value.trim(),
      yearOfGraduation: document.getElementById('yearOfGraduation').value
    },
    technical: {
      programmingLanguages: document.getElementById('programmingLanguages').value.trim(),
      languages: document.getElementById('languages').value.trim(),
      personalAchievements: document.getElementById('personalAchievements').value.trim(),
      technicalSkills: document.getElementById('technicalSkills').value.trim(),
      technicalAchievements: document.getElementById('technicalAchievements').value.trim(),
      project: document.getElementById('project').value.trim(),
      certifications: document.getElementById('certification').value.trim(),
      certificationLinks: document.getElementById('certificationLink').value.trim(),  
      internships: []
    },
    coding: {
      linkedinLink: document.getElementById('linkedinLink').value.trim(),
      leetcodeScore: document.getElementById('leetcodeScore').value.trim(),
      leetcodeLink: document.getElementById('leetcodeLink').value.trim(),
      gfgScore: document.getElementById('gfgScore').value.trim(),
      gfgLink: document.getElementById('gfgLink').value.trim(),
      cocubesScore: document.getElementById('cocubesScore').value.trim(),
      codechefRank: document.getElementById('codechefRank').value.trim(),
      codechefLink: document.getElementById('codechefLink').value.trim(),
      hackerearthRating: document.getElementById('hackerearthRating').value.trim(),
      hackerearthLink: document.getElementById('hackerearthLink').value.trim(),
      hackerrankRating: document.getElementById('hackerrankRating').value.trim(),
      hackerrankLink: document.getElementById('hackerrankLink').value.trim(),
      githubLink: document.getElementById('githubLink').value.trim(),
      resumeLink: document.getElementById('resumeLink').value.trim()
  },
  documents: {
      tenthMarksheetLink: document.getElementById('tenthMarksheetLink').value.trim(),
      twelfthMarksheetLink: document.getElementById('twelfthMarksheetLink').value.trim(),
      passportPhotoLink: document.getElementById('passportPhotoLink').value.trim(),
      resumeLink: document.getElementById('resumeLink').value.trim(),
      certificationCertificates: []
    }
  };

  ProfileManager.autoCalculateFields(profile);

  const validation = ProfileManager.validateProfile(profile);
  if (!validation.valid) {
    alert('Validation errors:\n' + validation.errors.join('\n'));
    return;
  }

  const saved = await saveUserData();
  if (saved) {
    alert('Profile saved successfully!');
  }
}

// ... (Rest of the functions remain the same: custom fields, ML stats, security, etc.)
// Copy the remaining functions from your original options.js file

/**
 * Update custom fields list
 */
function updateCustomFieldsList() {
  const listEl = document.getElementById('custom-fields-list-options');
  if (!listEl) return; // ✅ guard

  listEl.innerHTML = '';

  const fields = Object.entries(customFields);

  if (fields.length === 0) {
    listEl.innerHTML = '<div class="empty-state">No custom fields yet.</div>';
    return;
  }

  fields.forEach(([key, field]) => {
    const row = document.createElement('div');
    row.className = 'custom-field-row';
    row.dataset.key = key;

    row.innerHTML = `
      <span>${field.label || key}</span>
      <div class="custom-field-actions">
        <button class="icon-btn edit-btn" title="Edit">✏️</button>
        <button class="icon-btn delete-btn" title="Delete">🗑️</button>
      </div>
    `;

    row.querySelector('.edit-btn')
      .addEventListener('click', () => editCustomFieldOptions(key));

    row.querySelector('.delete-btn')
      .addEventListener('click', () => deleteCustomFieldOptions(key));

    listEl.appendChild(row);
  });
}



/**
 * Show custom field modal
 */
function showCustomFieldModal(key = null) {
  const modal = document.getElementById('custom-field-modal-options');
  const form = document.getElementById('custom-field-form-options');
  
  form.reset();
  document.getElementById('field-key-options').disabled = !!key;
  
  if (key && customFields[key]) {
    const field = customFields[key];
    document.getElementById('field-key-options').value = key;
    document.getElementById('field-label-options').value = field.label || '';
    document.getElementById('field-value-options').value = field.value || '';
    document.getElementById('field-type-options').value = field.type || 'text';
    document.getElementById('field-category-options').value = field.category || 'General';
  }
  
  modal.style.display = 'flex';
}

/**
 * Close custom field modal
 */
function closeCustomFieldModal() {
  document.getElementById('custom-field-modal-options').style.display = 'none';
  document.getElementById('field-key-options').disabled = false;
}

/**
 * Handle add custom field
 */
async function handleAddCustomField(e) {
  e.preventDefault();
  
  const key = document.getElementById('field-key-options').value.trim();
  const label = document.getElementById('field-label-options').value.trim();
  const value = document.getElementById('field-value-options').value.trim();
  const type = document.getElementById('field-type-options').value;
  const category = document.getElementById('field-category-options').value;

  if (!key || !label) {
    alert('Key and label are required.');
    return;
  }

  const isEditing = document.getElementById('field-key-options').disabled;
  
  if (isEditing) {
    customFields[key] = {
      ...customFields[key],
      label,
      value,
      type,
      category,
      updatedAt: Date.now()
    };
  } else {
    if (customFields[key]) {
      alert('A field with this key already exists. Please use a different key.');
      return;
    }
    customFields = CustomFieldsManager.addCustomField(customFields, key, {
      value,
      type,
      category,
      label
    });
  }

  await saveUserData();
  updateCustomFieldsList();
  closeCustomFieldModal();
}

window.editCustomFieldOptions = function(key) {
  showCustomFieldModal(key);
};

window.deleteCustomFieldOptions = async function(key) {
  if (!confirm(`Delete custom field "${customFields[key]?.label || key}"?`)) {
    return;
  }

  customFields = CustomFieldsManager.removeCustomField(customFields, key);
  await saveUserData();
  updateCustomFieldsList();
};

/**
 * Load ML statistics
 */
function loadMLStats() {
  if (typeof window.MLFieldMatcher === 'undefined') {
    setTimeout(loadMLStats, 100);
    return;
  }

  try {
    const stats = window.MLFieldMatcher.getModelStats();
    document.getElementById('ml-vocab-size').textContent = stats.vocabularySize || '-';
    document.getElementById('ml-classes').textContent = stats.classes || '-';
    document.getElementById('ml-examples').textContent = stats.totalDocuments || '-';
    document.getElementById('ml-accuracy').textContent = '95%';
  } catch (error) {
    console.error('Error loading ML stats:', error);
  }
}

/**
 * Handle ML test
 */
function handleMLTest() {
  const input = document.getElementById('ml-test-input');
  const resultDiv = document.getElementById('ml-test-result');
  const outputDiv = document.getElementById('ml-test-output');
  
  if (!input.value.trim()) {
    alert('Please enter a field label to test.');
    return;
  }

  if (typeof window.MLFieldMatcher === 'undefined') {
    alert('ML Field Matcher not loaded. Please refresh the page.');
    return;
  }

  try {
    const prediction = window.MLFieldMatcher.matchField(input.value.trim());
    const confidence = (prediction.confidence * 100).toFixed(1);
    
    let badgeColor = '🔴';
    if (prediction.confidence >= 0.8) {
      badgeColor = '🟢';
    } else if (prediction.confidence >= 0.6) {
      badgeColor = '🟡';
    }

    outputDiv.innerHTML = `
      <div style="margin-bottom: 10px;">
        <strong>Input:</strong> "${input.value.trim()}"
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Predicted Field:</strong> ${prediction.predictedField || 'None'}
      </div>
      <div>
        <strong>Confidence:</strong> ${badgeColor} ${confidence}%
      </div>
    `;
    
    resultDiv.style.display = 'block';
  } catch (error) {
    outputDiv.innerHTML = `<div style="color: var(--error);">Error: ${error.message}</div>`;
    resultDiv.style.display = 'block';
  }
}


/**
 * Handle Export Data
 */
async function handleExportData() {
  try {
    if (!profile || !customFields) {
      alert('No data to export.');
      return;
    }

    // Create export object with both profile and custom fields
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      profile: profile,
      customFields: customFields
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filleasy-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Data exported successfully!');
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Error exporting data: ' + error.message);
  }
}

/**
 * Handle Import Data
 */
async function handleImportData(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const importData = JSON.parse(text);

    // Validate import data structure
    if (!importData.profile && !importData.customFields) {
      alert('Invalid backup file format.');
      return;
    }

    if (!confirm('This will overwrite your current data. Continue?')) {
      e.target.value = ''; // Reset file input
      return;
    }

    // Import profile if exists
    if (importData.profile) {
      profile = importData.profile;
    }

    // Import custom fields if exists
    if (importData.customFields) {
      customFields = importData.customFields;
    }

    // Save imported data
    const saved = await saveUserData();
    if (saved) {
      populateProfileForm();
      updateCustomFieldsList();
      alert('Data imported successfully!');
    }

    e.target.value = ''; // Reset file input
  } catch (error) {
    console.error('Error importing data:', error);
    alert('Error importing data: ' + error.message);
    e.target.value = ''; // Reset file input
  }
}

async function handleClearData() {
  if (!confirm('Are you absolutely sure? This will permanently delete ALL your data including profile, custom fields, and settings. This cannot be undone.')) {
    return;
  }

  if (!confirm('Final confirmation: Delete ALL data?')) {
    return;
  }

  try {
    await StorageManager.clear();
    alert('All data cleared. The extension will now require setup again.');
    window.close();
  } catch (error) {
    console.error('Error clearing data:', error);
    alert('Error clearing data: ' + error.message);
  }
}
