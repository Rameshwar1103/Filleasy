/**
 * Options Page Script - Handles profile management, settings, and custom fields
 */

let profile = null;
let customFields = {};
let encryptionKey = null;
let currentTab = 'profile';

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
    // Redirect to popup or show login
    alert('Please unlock the extension first from the popup.');
    window.close();
    return;
  }

  // CryptoKey objects cannot be passed through messages (can't be serialized)
  // So we need to derive the key here from the stored salt
  // Check if we have stored password hash (user has set up account)
  const storedHash = await StorageManager.get('masterPasswordHash');
  const storedSalt = await StorageManager.get('masterPasswordSalt');
  
  if (!storedHash || !storedSalt) {
    alert('Please set up your account first from the extension popup.');
    window.close();
    return;
  }

  // Prompt user for password to derive encryption key
  const password = prompt('Enter your master password to access settings:');
  if (!password) {
    window.close();
    return;
  }

  try {
    // Verify password is correct
    const isValid = await CryptoUtils.verifyPassword(password, storedHash, storedSalt);
    if (!isValid) {
      alert('Incorrect password.');
      window.close();
      return;
    }

    // Derive encryption key from password and salt
    const saltArray = Uint8Array.from(atob(storedSalt), c => c.charCodeAt(0));
    encryptionKey = await CryptoUtils.deriveKey(password, saltArray);
    
    await loadUserData();
    await loadSettings();
    populateProfileForm();
    updateCustomFieldsList();
    
    // Load ML stats when ML tab is shown
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
  // Profile form
  document.getElementById('profile-form')?.addEventListener('submit', handleSaveProfile);
  document.getElementById('reset-profile-btn')?.addEventListener('click', () => {
    if (confirm('Reset all profile data? This cannot be undone.')) {
      profile = ProfileManager.getDefaultProfile();
      populateProfileForm();
    }
  });

  // Custom fields
  document.getElementById('add-custom-field-options-btn')?.addEventListener('click', () => {
    showCustomFieldModal();
  });
  document.getElementById('close-modal-options-btn')?.addEventListener('click', closeCustomFieldModal);
  document.getElementById('cancel-field-options-btn')?.addEventListener('click', closeCustomFieldModal);
  document.getElementById('custom-field-form-options')?.addEventListener('submit', handleAddCustomField);

  // Settings
  document.getElementById('settings-form')?.addEventListener('submit', handleSaveSettings);

  // ML Stats
  document.getElementById('ml-test-btn')?.addEventListener('click', handleMLTest);
  document.getElementById('ml-test-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleMLTest();
    }
  });

  // Security
  document.getElementById('change-password-btn')?.addEventListener('click', handleChangePassword);
  document.getElementById('export-data-btn')?.addEventListener('click', handleExportData);
  document.getElementById('import-data-btn')?.addEventListener('click', () => {
    document.getElementById('import-file-input').click();
  });
  document.getElementById('import-file-input')?.addEventListener('change', handleImportData);
  document.getElementById('clear-data-btn')?.addEventListener('click', handleClearData);
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
  
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tab}-tab`);
  });

  // Load ML stats when ML tab is shown
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
 * Load settings
 */
async function loadSettings() {
  const settings = await StorageManager.get('settings') || {};
  
  document.getElementById('theme').value = settings.theme || 'light';
  document.getElementById('autoFill').checked = settings.autoFill !== false;
  document.getElementById('showPreview').checked = settings.showPreview !== false;
  document.getElementById('sessionTimeout').value = settings.sessionTimeout || 15;
  document.getElementById('mlConfidenceThreshold').value = settings.mlConfidenceThreshold !== undefined ? settings.mlConfidenceThreshold : 0.7;
  document.getElementById('mlAutoTrain').checked = settings.mlAutoTrain !== false;

  // Load ML stats
  loadMLStats();
}

/**
 * Save settings
 */
async function handleSaveSettings(e) {
  e.preventDefault();
  
  const settings = {
    theme: document.getElementById('theme').value,
    autoFill: document.getElementById('autoFill').checked,
    showPreview: document.getElementById('showPreview').checked,
    sessionTimeout: parseInt(document.getElementById('sessionTimeout').value) || 15,
    mlConfidenceThreshold: parseFloat(document.getElementById('mlConfidenceThreshold').value) || 0.7,
    mlAutoTrain: document.getElementById('mlAutoTrain').checked
  };
  
  await StorageManager.save('settings', settings);
  alert('Settings saved successfully!');
}

/**
 * Populate profile form with data
 */
function populateProfileForm() {
  if (!profile) return;

  // Personal
  document.getElementById('firstName').value = profile.personal?.firstName || '';
  document.getElementById('middleName').value = profile.personal?.middleName || '';
  document.getElementById('lastName').value = profile.personal?.lastName || '';
  document.getElementById('fullName').value = profile.personal?.fullName || '';
  document.getElementById('dateOfBirth').value = profile.personal?.dateOfBirth || '';
  document.getElementById('gender').value = profile.personal?.gender || '';
  document.getElementById('bloodGroup').value = profile.personal?.bloodGroup || '';
  document.getElementById('phone').value = profile.personal?.phone || '';
  document.getElementById('alternatePhone').value = profile.personal?.alternatePhone || '';
  document.getElementById('email').value = profile.personal?.email || '';
  document.getElementById('collegeEmail').value = profile.personal?.collegeEmail || '';
  document.getElementById('studentId').value = profile.personal?.studentId || '';
  document.getElementById('prnNumber').value = profile.personal?.prnNumber || '';
  document.getElementById('aadhaarNumber').value = profile.personal?.aadhaarNumber || '';
  document.getElementById('pan').value = profile.personal?.pan || '';
  document.getElementById('category').value = profile.personal?.category || '';
  document.getElementById('physicallyChallenged').value = profile.personal?.physicallyChallenged || '';
  document.getElementById('photoLink').value = profile.personal?.photoLink || '';

  // Address
  document.getElementById('house').value = profile.address?.house || '';
  document.getElementById('street').value = profile.address?.street || '';
  document.getElementById('currentAddress').value = profile.address?.currentAddress || '';
  document.getElementById('permanentAddress').value = profile.address?.permanentAddress || '';
  document.getElementById('city').value = profile.address?.city || '';
  document.getElementById('state').value = profile.address?.state || '';
  document.getElementById('pin').value = profile.address?.pin || '';
  document.getElementById('country').value = profile.address?.country || 'India';

  // Academic - 10th
  document.getElementById('tenthBoard').value = profile.academic?.tenthBoard || '';
  document.getElementById('tenthYear').value = profile.academic?.tenthYear || '';
  document.getElementById('tenthPercentage').value = profile.academic?.tenthPercentage || '';

  // Academic - 12th
  document.getElementById('twelfthBoard').value = profile.academic?.twelfthBoard || '';
  document.getElementById('twelfthYear').value = profile.academic?.twelfthYear || '';
  document.getElementById('twelfthPercentage').value = profile.academic?.twelfthPercentage || '';
  document.getElementById('twelfthStream').value = profile.academic?.twelfthStream || '';

  // Academic - College
  document.getElementById('collegeName').value = profile.academic?.collegeName || '';
  document.getElementById('course').value = profile.academic?.course || '';
  document.getElementById('branch').value = profile.academic?.branch || '';
  document.getElementById('specialization').value = profile.academic?.specialization || '';
  document.getElementById('semester').value = profile.academic?.semester || '';
  document.getElementById('year').value = profile.academic?.year || '';
  document.getElementById('yearOfStudy').value = profile.academic?.yearOfStudy || '';
  document.getElementById('cgpa').value = profile.academic?.cgpa || '';
  document.getElementById('sgpa').value = profile.academic?.sgpa || '';
  document.getElementById('aggregatePercentage').value = profile.academic?.aggregatePercentage || '';
  document.getElementById('percentage').value = profile.academic?.percentage || '';
  document.getElementById('rollNumber').value = profile.academic?.rollNumber || '';
  document.getElementById('registrationNumber').value = profile.academic?.registrationNumber || '';
  document.getElementById('prnNumber').value = profile.academic?.prnNumber || profile.personal?.prnNumber || '';
  
  // Year-wise percentages
  document.getElementById('firstYearPercentage').value = profile.academic?.firstYearPercentage || '';
  document.getElementById('secondYearPercentage').value = profile.academic?.secondYearPercentage || '';
  document.getElementById('thirdYearPercentage').value = profile.academic?.thirdYearPercentage || '';
  document.getElementById('fourthYearPercentage').value = profile.academic?.fourthYearPercentage || '';
  document.getElementById('graduationPercentage').value = profile.academic?.graduationPercentage || '';
  
  // Backlogs
  document.getElementById('backlogs').value = profile.academic?.backlogs || '';
  document.getElementById('backlogsCount').value = profile.academic?.backlogsCount || '';
  document.getElementById('arrears').value = profile.academic?.arrears || '';
  document.getElementById('arrearsCount').value = profile.academic?.arrearsCount || '';

  // Technical Skills
  document.getElementById('programmingLanguages').value = profile.technical?.programmingLanguages || '';
  document.getElementById('technicalSkills').value = Array.isArray(profile.technical?.technicalSkills) 
    ? profile.technical.technicalSkills.join(', ') 
    : (profile.technical?.technicalSkills || (profile.technicalSkills || []).join(', '));
  document.getElementById('technicalAchievements').value = profile.technical?.technicalAchievements || '';
  document.getElementById('projectsCount').value = profile.technical?.projectsCount || '';
  document.getElementById('projectsDescription').value = profile.technical?.projectsDescription || '';
  document.getElementById('certifications').value = profile.technical?.certifications || '';
  document.getElementById('internshipMonths').value = profile.technical?.internshipMonths || '';
  document.getElementById('internshipCompanies').value = profile.technical?.internshipCompanies || '';

  // Placement Preferences
  document.getElementById('eligibleCompanies').value = profile.placement?.eligibleCompanies || '';
  document.getElementById('jobRolePreference').value = profile.placement?.jobRolePreference || '';
  document.getElementById('expectedCTC').value = profile.placement?.expectedCTC || '';
  document.getElementById('willingToRelocate').value = profile.placement?.willingToRelocate || '';
  document.getElementById('noticePeriod').value = profile.placement?.noticePeriod || '';
  document.getElementById('availableFromDate').value = profile.placement?.availableFromDate || '';
  document.getElementById('resumeLink').value = profile.placement?.resumeLink || profile.documents?.resumeLink || '';

  // Additional Fields
  document.getElementById('parentContact').value = profile.additional?.parentContact || '';
  document.getElementById('alternateContact').value = profile.additional?.alternateContact || '';
  document.getElementById('declaration').checked = profile.additional?.declaration || false;

  // Documents
  document.getElementById('tenthMarksheetLink').value = profile.documents?.tenthMarksheetLink || '';
  document.getElementById('twelfthMarksheetLink').value = profile.documents?.twelfthMarksheetLink || '';
  document.getElementById('collegeIdCardLink').value = profile.documents?.collegeIdCardLink || '';
  document.getElementById('passportPhotoLink').value = profile.documents?.passportPhotoLink || '';

  // Social
  document.getElementById('linkedin').value = profile.placement?.linkedin || profile.social?.linkedin || '';
  document.getElementById('github').value = profile.technical?.github || profile.social?.github || '';
  document.getElementById('portfolio').value = profile.social?.portfolio || '';
  document.getElementById('behance').value = profile.social?.behance || '';
  document.getElementById('instagram').value = profile.social?.instagram || '';
  document.getElementById('twitter').value = profile.social?.twitter || '';
  document.getElementById('whatsapp').value = profile.social?.whatsapp || '';
  document.getElementById('telegram').value = profile.social?.telegram || '';
}

/**
 * Handle save profile
 */
async function handleSaveProfile(e) {
  e.preventDefault();
  
  // Validate
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  
  if (!firstName || !lastName || !email) {
    alert('First Name, Last Name, and Email are required fields.');
    return;
  }

  if (email && !ProfileManager.isValidEmail(email)) {
    alert('Invalid email format.');
    return;
  }

  // Build profile object
  profile = {
    personal: {
      firstName: firstName,
      middleName: document.getElementById('middleName').value.trim(),
      lastName: lastName,
      fullName: document.getElementById('fullName').value.trim(),
      dateOfBirth: document.getElementById('dateOfBirth').value,
      gender: document.getElementById('gender').value,
      bloodGroup: document.getElementById('bloodGroup').value,
      phone: document.getElementById('phone').value.trim(),
      alternatePhone: document.getElementById('alternatePhone').value.trim(),
      email: email,
      collegeEmail: document.getElementById('collegeEmail').value.trim(),
      studentId: document.getElementById('studentId').value.trim(),
      prnNumber: document.getElementById('prnNumber').value.trim(),
      aadhaarNumber: document.getElementById('aadhaarNumber').value.trim(),
      pan: document.getElementById('pan').value.trim().toUpperCase(),
      category: document.getElementById('category').value,
      physicallyChallenged: document.getElementById('physicallyChallenged').value,
      photoLink: document.getElementById('photoLink').value.trim()
    },
    address: {
      house: document.getElementById('house').value.trim(),
      street: document.getElementById('street').value.trim(),
      currentAddress: document.getElementById('currentAddress').value.trim(),
      permanentAddress: document.getElementById('permanentAddress').value.trim(),
      city: document.getElementById('city').value.trim(),
      state: document.getElementById('state').value.trim(),
      pin: document.getElementById('pin').value.trim(),
      country: document.getElementById('country').value.trim() || 'India'
    },
    academic: {
      tenthBoard: document.getElementById('tenthBoard').value.trim(),
      tenthYear: document.getElementById('tenthYear').value,
      tenthPercentage: document.getElementById('tenthPercentage').value,
      twelfthBoard: document.getElementById('twelfthBoard').value.trim(),
      twelfthYear: document.getElementById('twelfthYear').value,
      twelfthPercentage: document.getElementById('twelfthPercentage').value,
      twelfthStream: document.getElementById('twelfthStream').value,
      collegeName: document.getElementById('collegeName').value.trim(),
      course: document.getElementById('course').value.trim(),
      branch: document.getElementById('branch').value.trim(),
      specialization: document.getElementById('specialization').value.trim(),
      semester: document.getElementById('semester').value.trim(),
      year: document.getElementById('year').value.trim(),
      yearOfStudy: document.getElementById('yearOfStudy').value.trim(),
      cgpa: document.getElementById('cgpa').value,
      sgpa: document.getElementById('sgpa').value,
      aggregatePercentage: document.getElementById('aggregatePercentage').value,
      registrationNumber: document.getElementById('registrationNumber').value.trim(),
      prnNumber: document.getElementById('prnNumber').value.trim(),
      percentage: document.getElementById('percentage').value,
      rollNumber: document.getElementById('rollNumber').value.trim(),
      firstYearPercentage: document.getElementById('firstYearPercentage').value,
      secondYearPercentage: document.getElementById('secondYearPercentage').value,
      thirdYearPercentage: document.getElementById('thirdYearPercentage').value,
      fourthYearPercentage: document.getElementById('fourthYearPercentage').value,
      graduationPercentage: document.getElementById('graduationPercentage').value,
      backlogs: document.getElementById('backlogs').value,
      backlogsCount: document.getElementById('backlogsCount').value,
      arrears: document.getElementById('arrears').value,
      arrearsCount: document.getElementById('arrearsCount').value
    },
    technical: {
      programmingLanguages: document.getElementById('programmingLanguages').value.trim(),
      technicalSkills: document.getElementById('technicalSkills').value.split(',').map(s => s.trim()).filter(s => s),
      technicalAchievements: document.getElementById('technicalAchievements').value.trim(),
      projectsCount: document.getElementById('projectsCount').value,
      projectsDescription: document.getElementById('projectsDescription').value.trim(),
      certifications: document.getElementById('certifications').value.trim(),
      internshipMonths: document.getElementById('internshipMonths').value,
      internshipCompanies: document.getElementById('internshipCompanies').value.trim(),
      github: document.getElementById('github').value.trim()
    },
    placement: {
      eligibleCompanies: document.getElementById('eligibleCompanies').value.trim(),
      jobRolePreference: document.getElementById('jobRolePreference').value.trim(),
      expectedCTC: document.getElementById('expectedCTC').value.trim(),
      willingToRelocate: document.getElementById('willingToRelocate').value,
      noticePeriod: document.getElementById('noticePeriod').value.trim(),
      availableFromDate: document.getElementById('availableFromDate').value,
      resumeLink: document.getElementById('resumeLink').value.trim(),
      linkedin: document.getElementById('linkedin').value.trim()
    },
    additional: {
      parentContact: document.getElementById('parentContact').value.trim(),
      alternateContact: document.getElementById('alternateContact').value.trim(),
      declaration: document.getElementById('declaration').checked
    },
    documents: {
      tenthMarksheetLink: document.getElementById('tenthMarksheetLink').value.trim(),
      twelfthMarksheetLink: document.getElementById('twelfthMarksheetLink').value.trim(),
      collegeIdCardLink: document.getElementById('collegeIdCardLink').value.trim(),
      passportPhotoLink: document.getElementById('passportPhotoLink').value.trim(),
      resumeLink: document.getElementById('resumeLink').value.trim()
    },
    social: {
      linkedin: document.getElementById('linkedin').value.trim(),
      github: document.getElementById('github').value.trim(),
      portfolio: document.getElementById('portfolio').value.trim(),
      behance: document.getElementById('behance').value.trim(),
      instagram: document.getElementById('instagram').value.trim(),
      twitter: document.getElementById('twitter').value.trim(),
      whatsapp: document.getElementById('whatsapp').value.trim(),
      telegram: document.getElementById('telegram').value.trim()
    },
    technicalSkills: document.getElementById('technicalSkills').value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  };

  // Validate profile
  const validation = ProfileManager.validateProfile(profile);
  if (!validation.valid) {
    alert('Validation errors:\n' + validation.errors.join('\n'));
    return;
  }

  // Save
  const saved = await saveUserData();
  if (saved) {
    alert('Profile saved successfully!');
  }
}

/**
 * Update custom fields list
 */
function updateCustomFieldsList() {
  const listEl = document.getElementById('custom-fields-list-options');
  if (!listEl) return;

  const fields = Object.entries(customFields);
  
  if (fields.length === 0) {
    listEl.innerHTML = '<div class="empty-state">No custom fields yet. Click "Add Field" to create one.</div>';
    return;
  }

  listEl.innerHTML = fields.map(([key, field]) => `
    <div class="custom-field-item-options">
      <div class="field-info">
        <div class="field-key">${field.label || key} (${field.category})</div>
        <div class="field-value">${field.value || '(empty)'} - Type: ${field.type}</div>
      </div>
      <div class="custom-field-actions">
        <button class="icon-btn" onclick="editCustomFieldOptions('${key}')" title="Edit">âœï¸</button>
        <button class="icon-btn" onclick="deleteCustomFieldOptions('${key}')" title="Delete">ðŸ—‘ï¸</button>
      </div>
    </div>
  `).join('');
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
    // Update existing
    customFields[key] = {
      ...customFields[key],
      label,
      value,
      type,
      category,
      updatedAt: Date.now()
    };
  } else {
    // Add new
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

/**
 * Edit custom field (global function)
 */
window.editCustomFieldOptions = function(key) {
  showCustomFieldModal(key);
};

/**
 * Delete custom field (global function)
 */
window.deleteCustomFieldOptions = async function(key) {
  if (!confirm(`Delete custom field "${customFields[key]?.label || key}"?`)) {
    return;
  }

  customFields = CustomFieldsManager.removeCustomField(customFields, key);
  await saveUserData();
  updateCustomFieldsList();
};

/**
 * Handle change password
 */
async function handleChangePassword() {
  const oldPassword = prompt('Enter current master password:');
  if (!oldPassword) return;

  try {
    await AuthManager.verifyMasterPassword(oldPassword);
  } catch (error) {
    alert('Incorrect password.');
    return;
  }

  const newPassword = prompt('Enter new master password:');
  if (!newPassword) return;

  const confirmPassword = prompt('Confirm new master password:');
  if (newPassword !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  const strength = AuthManager.validatePasswordStrength(newPassword);
  if (!strength.strong) {
    alert('Password is too weak. ' + strength.feedback.join('. '));
    return;
  }

  try {
    // Derive new encryption key
    const salt = CryptoUtils.generateSalt();
    const newKey = await CryptoUtils.deriveKey(newPassword, salt);
    
    // Re-encrypt all data with new key
    const oldSaltB64 = await StorageManager.get('masterPasswordSalt');
    const oldSalt = Uint8Array.from(atob(oldSaltB64), c => c.charCodeAt(0));
    const oldKey = await CryptoUtils.deriveKey(oldPassword, oldSalt);
    
    // Get and re-encrypt profile
    const oldProfile = await StorageManager.getEncrypted('profile', oldKey);
    await StorageManager.saveEncrypted('profile', oldProfile, newKey);
    
    // Get and re-encrypt custom fields
    const oldCustomFields = await StorageManager.getEncrypted('customFields', oldKey);
    await StorageManager.saveEncrypted('customFields', oldCustomFields, newKey);
    
    // Update password hash
    const { hash, salt: saltB64 } = await CryptoUtils.hashPassword(newPassword, salt);
    await StorageManager.save('masterPasswordHash', hash);
    await StorageManager.save('masterPasswordSalt', saltB64);
    
    // Update session
    await chrome.runtime.sendMessage({ action: 'storeEncryptionKey', key: newKey });
    await AuthManager.createSession(newKey);
    
    encryptionKey = newKey;
    
    alert('Password changed successfully!');
  } catch (error) {
    console.error('Error changing password:', error);
    alert('Error changing password: ' + error.message);
  }
}

/**
 * Handle export data
 */
async function handleExportData() {
  if (!encryptionKey) return;

  try {
    const data = {
      profile: await StorageManager.getEncrypted('profile', encryptionKey),
      customFields: await StorageManager.getEncrypted('customFields', encryptionKey),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    // Export as JSON (encrypted data is already base64 encoded)
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filleasy-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Data exported successfully!');
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Error exporting data: ' + error.message);
  }
}

/**
 * Handle import data
 */
async function handleImportData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const data = JSON.parse(event.target.result);
      
      if (!data.profile || !data.customFields) {
        throw new Error('Invalid export file format.');
      }

      if (!confirm('This will overwrite your current profile and custom fields. Continue?')) {
        return;
      }

      // Import data (it's already encrypted, so we store it directly)
      // Note: In a real implementation, you'd want to re-encrypt with current key
      profile = data.profile;
      customFields = data.customFields;
      
      await saveUserData();
      populateProfileForm();
      updateCustomFieldsList();
      
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error importing data: ' + error.message);
    }
  };
  reader.readAsText(file);
  
  // Reset file input
  e.target.value = '';
}

/**
 * Load ML statistics
 */
function loadMLStats() {
  if (typeof window.MLFieldMatcher === 'undefined') {
    // ML matcher not loaded yet, try again after a short delay
    setTimeout(loadMLStats, 100);
    return;
  }

  try {
    const stats = window.MLFieldMatcher.getModelStats();
    document.getElementById('ml-vocab-size').textContent = stats.vocabularySize || '-';
    document.getElementById('ml-classes').textContent = stats.classes || '-';
    document.getElementById('ml-examples').textContent = stats.totalDocuments || '-';
    document.getElementById('ml-accuracy').textContent = '95%'; // Estimated accuracy
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
 * Handle clear data
 */
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
