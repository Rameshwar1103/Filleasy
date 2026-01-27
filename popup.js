/**
 * Popup Script - Main UI logic for Filleasy extension
 * Handles authentication, profile management, and form filling
 */

// Global state (classes loaded via script tags in popup.html)
let currentScreen = 'login';
let profile = null;
let customFields = {};
let encryptionKey = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await initializePopup();
  setupEventListeners();
});

/**
 * Initialize popup based on authentication state
 */
async function initializePopup() {
  // Check if master password is set
  const isPasswordSet = await AuthManager.isMasterPasswordSet();
  
  if (!isPasswordSet) {
    showScreen('setup');
    return;
  }

  // Check if authenticated
  const isAuthenticated = await AuthManager.isAuthenticated();
  
  if (!isAuthenticated) {
    showScreen('login');
    return;
  }

  // Get encryption key from background
  const response = await chrome.runtime.sendMessage({ action: 'getEncryptionKey' });
  if (response?.key) {
    encryptionKey = response.key;
    await loadUserData();
    showScreen('dashboard');
  } else {
    showScreen('login');
  }

  // Check for form on current tab
  await checkFormDetected();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Login form
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  document.getElementById('setup-form')?.addEventListener('submit', handleSetup);
  document.getElementById('setup-link')?.addEventListener('click', () => showScreen('setup'));
  document.getElementById('back-to-login')?.addEventListener('click', () => showScreen('login'));
  document.getElementById('password-toggle')?.addEventListener('click', togglePasswordVisibility);

  // Dashboard actions
  document.getElementById('fill-all-btn')?.addEventListener('click', handleFillAll);
  document.getElementById('preview-btn')?.addEventListener('click', handlePreview);
  document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  document.getElementById('add-custom-field-btn')?.addEventListener('click', () => {
    showCustomFieldModal();
  });
  document.getElementById('import-template-btn')?.addEventListener('click', () => {
    showTemplateModal();
  });
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
  document.getElementById('settings-btn')?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Modal handlers
  document.getElementById('close-modal-btn')?.addEventListener('click', closeCustomFieldModal);
  document.getElementById('cancel-field-btn')?.addEventListener('click', closeCustomFieldModal);
  document.getElementById('custom-field-form')?.addEventListener('submit', handleAddCustomField);
  document.getElementById('close-preview-btn')?.addEventListener('click', closePreviewModal);
  document.getElementById('cancel-preview-btn')?.addEventListener('click', closePreviewModal);
  document.getElementById('confirm-fill-btn')?.addEventListener('click', handleConfirmFill);
  document.getElementById('close-template-btn')?.addEventListener('click', closeTemplateModal);

  // Password strength check
  document.getElementById('setup-password')?.addEventListener('input', checkPasswordStrength);
  document.getElementById('setup-confirm')?.addEventListener('input', checkPasswordMatch);
}

/**
 * Show specific screen
 */
function showScreen(screen) {
  currentScreen = screen;
  document.getElementById('login-screen').style.display = screen === 'login' ? 'flex' : 'none';
  document.getElementById('setup-screen').style.display = screen === 'setup' ? 'flex' : 'none';
  document.getElementById('dashboard-screen').style.display = screen === 'dashboard' ? 'flex' : 'none';

  if (screen === 'dashboard') {
    updateDashboard();
  }
}

/**
 * Handle login
 */
async function handleLogin(e) {
  e.preventDefault();
  
  const passwordInput = document.getElementById('master-password');
  const password = passwordInput.value;
  const errorEl = document.getElementById('login-error');
  const lockoutEl = document.getElementById('lockout-message');
  
  errorEl.style.display = 'none';
  lockoutEl.style.display = 'none';

  try {
    // Check if locked
    if (await AuthManager.isLocked()) {
      const remaining = await AuthManager.getLockoutRemaining();
      lockoutEl.textContent = `Account locked. Try again in ${remaining} minutes.`;
      lockoutEl.style.display = 'block';
      return;
    }

    const result = await AuthManager.verifyMasterPassword(password);
    if (result.success) {
      encryptionKey = result.encryptionKey;
      passwordInput.value = '';
      await loadUserData();
      showScreen('dashboard');
    }
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.style.display = 'block';
  }
}

/**
 * Handle setup (first time)
 */
async function handleSetup(e) {
  e.preventDefault();
  
  const password = document.getElementById('setup-password').value;
  const confirm = document.getElementById('setup-confirm').value;
  const errorEl = document.getElementById('setup-error');
  
  errorEl.style.display = 'none';

  if (password !== confirm) {
    errorEl.textContent = 'Passwords do not match';
    errorEl.style.display = 'block';
    return;
  }

  const strength = AuthManager.validatePasswordStrength(password);
  if (!strength.strong) {
    errorEl.textContent = 'Password is too weak. ' + strength.feedback.join('. ');
    errorEl.style.display = 'block';
    return;
  }

  try {
    // Generate salt as Uint8Array for key derivation
    const salt = CryptoUtils.generateSalt();
    
    // Derive encryption key using the salt
    const key = await CryptoUtils.deriveKey(password, salt);
    
    // Convert salt to base64 string for password hashing
    // hashPassword expects either null (to generate new) or base64 string (to use existing)
    const saltB64 = btoa(String.fromCharCode(...salt));
    
    // Hash password using the same salt (pass as base64 string)
    const { hash } = await CryptoUtils.hashPassword(password, saltB64);
    await StorageManager.save('masterPasswordHash', hash);
    await StorageManager.save('masterPasswordSalt', saltB64);
    
    // Store encryption key in background
    await chrome.runtime.sendMessage({ action: 'storeEncryptionKey', key: key });
    
    // Create session
    await AuthManager.createSession(key);
    
    encryptionKey = key;
    
    // Initialize default profile
    profile = ProfileManager.getDefaultProfile();
    await saveUserData();
    
    // Clear form
    document.getElementById('setup-password').value = '';
    document.getElementById('setup-confirm').value = '';
    
    showScreen('dashboard');
  } catch (error) {
    errorEl.textContent = 'Setup failed: ' + error.message;
    errorEl.style.display = 'block';
  }
}

/**
 * Check password strength
 */
function checkPasswordStrength() {
  const password = document.getElementById('setup-password').value;
  const strengthEl = document.getElementById('password-strength');
  
  if (!password) {
    strengthEl.textContent = '';
    strengthEl.className = 'password-strength';
    return;
  }

  const strength = AuthManager.validatePasswordStrength(password);
  strengthEl.textContent = `Strength: ${strength.strength.toUpperCase()} (${strength.score}/6)`;
  strengthEl.className = `password-strength ${strength.strength}`;
}

/**
 * Check password match
 */
function checkPasswordMatch() {
  const password = document.getElementById('setup-password').value;
  const confirm = document.getElementById('setup-confirm').value;
  const matchEl = document.getElementById('password-match');
  
  if (!confirm) {
    matchEl.textContent = '';
    matchEl.className = 'password-match';
    return;
  }

  if (password === confirm) {
    matchEl.textContent = '✓ Passwords match';
    matchEl.className = 'password-match';
    matchEl.style.color = 'var(--success)';
  } else {
    matchEl.textContent = '✗ Passwords do not match';
    matchEl.className = 'password-match';
    matchEl.style.color = 'var(--error)';
  }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
  const input = document.getElementById('master-password');
  const toggle = document.getElementById('password-toggle');
  
  if (input.type === 'password') {
    input.type = 'text';
    toggle.textContent = '🙈';
  } else {
    input.type = 'password';
    toggle.textContent = '👁️';
  }
}

/**
 * Load user data from encrypted storage
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
 * Save user data to encrypted storage
 */
async function saveUserData() {
  if (!encryptionKey) return;

  try {
    await StorageManager.saveEncrypted('profile', profile, encryptionKey);
    await StorageManager.saveEncrypted('customFields', customFields, encryptionKey);
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
}

/**
 * Update dashboard UI
 */
async function updateDashboard() {
  updateProfilePreview();
  updateCustomFieldsList();
  updateSecurityStatus();
}

/**
 * Update profile preview
 */
function updateProfilePreview() {
  const previewEl = document.getElementById('profile-preview');
  if (!profile || !previewEl) return;

  const previewItems = [
    { label: 'Name', value: [profile.personal?.firstName, profile.personal?.middleName, profile.personal?.lastName].filter(Boolean).join(' ') || 'Not set' },
    { label: 'Email', value: profile.personal?.email || 'Not set' },
    { label: 'Phone', value: profile.personal?.phone || 'Not set' },
    { label: 'College', value: profile.academic?.collegeName || 'Not set' }
  ].filter(item => item.value !== 'Not set');

  if (previewItems.length === 0) {
    previewEl.innerHTML = '<p class="empty-state">Profile not set up. Click Edit to configure.</p>';
    return;
  }

  previewEl.innerHTML = previewItems.map(item => `
    <div class="profile-info-item">
      <span>${item.label}</span>
      <span>${item.value}</span>
    </div>
  `).join('');
}

/**
 * Update custom fields list
 */
function updateCustomFieldsList() {
  const listEl = document.getElementById('custom-fields-list');
  if (!listEl) return; 

  listEl.innerHTML = '';

  const fields = Object.entries(customFields);

  if (fields.length === 0) {
    listEl.innerHTML = '<p class="empty-state">No custom fields yet. Click + to add.</p>';
    return;
  }

  fields.forEach(([key, field]) => {
    const item = document.createElement('div');
    item.className = 'custom-field-item';
    item.dataset.key = key;

    item.innerHTML = `
      <div class="field-info">
        <div class="field-key">${field.label || key}</div>
        <div class="field-value">${field.value || '(empty)'}</div>
      </div>
      <div class="custom-field-actions">
        <button class="icon-btn small edit-btn" title="Edit">✏️</button>
        <button class="icon-btn small delete-btn" title="Delete">🗑️</button>
      </div>
    `;

    //attach listeners AFTER creation
    item.querySelector('.edit-btn')
      .addEventListener('click', () => editCustomField(key));

    item.querySelector('.delete-btn')
      .addEventListener('click', () => deleteCustomField(key));

    listEl.appendChild(item);
  });
}


/**
 * Update security status
 */
function updateSecurityStatus() {
  const statusEl = document.getElementById('security-status');
  if (statusEl) {
    statusEl.textContent = '🔓 Unlocked';
    statusEl.style.background = 'var(--success)';
  }
}

/**
 * Handle fill all
 */
async function handleFillAll() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url?.includes('docs.google.com/forms') && !tab.url?.includes('forms.gle')) {
      alert('Please navigate to a Google Form first.\n\nValid URLs:\n• https://docs.google.com/forms/...\n• https://forms.gle/...');
      return;
    }

    // Inject content script if needed
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['lib/ml-field-matcher.js', 'content.js']
    });

    // Send fill command
    chrome.tabs.sendMessage(tab.id, {
      action: 'fillForm',
      profile: profile,
      customFields: customFields,
      preview: false
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError);
        alert('Error filling form. Please refresh the page and try again.');
        return;
      }

      if (response?.success) {
        alert(`Successfully filled ${response.filled} field(s)!`);
      } else {
        alert('Error filling form: ' + (response?.error || 'Unknown error'));
      }
    });
  } catch (error) {
    console.error('Error:', error);
    alert('Error: ' + error.message);
  }
}

/**
 * Handle preview
 */
async function handlePreview() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url?.includes('docs.google.com/forms') && !tab.url?.includes('forms.gle')) {
      alert('Please navigate to a Google Form first.\n\nValid URLs:\n• https://docs.google.com/forms/...\n• https://forms.gle/...');
      return;
    }

    // Inject scripts
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['lib/ml-field-matcher.js', 'content.js']
    });

    // Get preview
    chrome.tabs.sendMessage(tab.id, {
      action: 'fillForm',
      profile: profile,
      customFields: customFields,
      preview: true
    }, (response) => {
      if (chrome.runtime.lastError || !response?.mappings) {
        alert('Could not detect form fields. Please make sure you are on a Google Form.');
        return;
      }

      showPreviewModal(response.mappings);
    });
  } catch (error) {
    console.error('Error:', error);
    alert('Error: ' + error.message);
  }
}

/**
 * Show preview modal
 */
function showPreviewModal(mappings) {
  const modal = document.getElementById('preview-modal');
  const content = document.getElementById('preview-content');
  
  if (mappings.length === 0) {
    content.innerHTML = '<p class="empty-state">No matching fields found.</p>';
  } else {
    content.innerHTML = mappings.map(mapping => {
      const confidence = mapping.match.confidence || 0;
      const confidencePercent = (confidence * 100).toFixed(0);
      
      // Determine confidence badge color
      let badgeColor = '🔴'; // Red < 60%
      if (confidence >= 0.8) {
        badgeColor = '🟢'; // Green >= 80%
      } else if (confidence >= 0.6) {
        badgeColor = '🟡'; // Yellow 60-80%
      }
      
      return `
        <div class="preview-mapping">
          <div class="field-label">${mapping.field.label}</div>
          <div class="field-value">${mapping.value}</div>
          <div class="field-match" style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            → ${mapping.match.field} ${badgeColor} ${confidencePercent}%
          </div>
        </div>
      `;
    }).join('');
  }
  
  modal.style.display = 'flex';
}

/**
 * Close preview modal
 */
function closePreviewModal() {
  document.getElementById('preview-modal').style.display = 'none';
}

/**
 * Handle confirm fill (from preview)
 */
async function handleConfirmFill() {
  closePreviewModal();
  await handleFillAll();
}

/**
 * Show custom field modal
 */
function showCustomFieldModal() {
  const modal = document.getElementById('custom-field-modal');
  const form = document.getElementById('custom-field-form');
  form.reset();
  modal.style.display = 'flex';
}

/**
 * Close custom field modal
 */
function closeCustomFieldModal() {
  document.getElementById('custom-field-modal').style.display = 'none';
}

/**
 * Handle add custom field
 */
async function handleAddCustomField(e) {
  e.preventDefault();
  
  const key = document.getElementById('field-key').value.trim();
  const label = document.getElementById('field-label').value.trim();
  const value = document.getElementById('field-value').value.trim();
  const type = document.getElementById('field-type').value;
  const category = document.getElementById('field-category').value;

  if (!key || !label) {
    alert('Key and label are required.');
    return;
  }

  // Add field
  customFields = CustomFieldsManager.addCustomField(customFields, key, {
    value,
    type,
    category,
    label
  });

  await saveUserData();
  updateCustomFieldsList();
  closeCustomFieldModal();
}

/**
 * Edit custom field (global function for on clicking it)
 */
window.editCustomField = async function(key) {
  const field = customFields[key];
  if (!field) return;

  document.getElementById('field-key').value = key;
  document.getElementById('field-key').disabled = true;
  document.getElementById('field-label').value = field.label;
  document.getElementById('field-value').value = field.value || '';
  document.getElementById('field-type').value = field.type;
  document.getElementById('field-category').value = field.category;
  
  showCustomFieldModal();
  
  // Update form submit handler
  const form = document.getElementById('custom-field-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const label = document.getElementById('field-label').value.trim();
    const value = document.getElementById('field-value').value.trim();
    const type = document.getElementById('field-type').value;
    const category = document.getElementById('field-category').value;

    customFields[key] = { ...customFields[key], label, value, type, category, updatedAt: Date.now() };
    await saveUserData();
    updateCustomFieldsList();
    closeCustomFieldModal();
    document.getElementById('field-key').disabled = false;
    form.onsubmit = handleAddCustomField;
  };
};

/**
 * Delete custom field (global function for on clicking it)
 */
window.deleteCustomField = async function(key) {
  if (!confirm(`Delete custom field "${customFields[key]?.label || key}"?`)) {
    return;
  }

  customFields = CustomFieldsManager.removeCustomField(customFields, key);
  await saveUserData();
  updateCustomFieldsList();
};

/**
 * Show template modal
 */
function showTemplateModal() {
  const modal = document.getElementById('template-modal');
  const list = document.getElementById('template-list');
  
  const templates = ScholarshipTemplates.getTemplateNames();
  
  list.innerHTML = templates.map(name => {
    const template = ScholarshipTemplates.getTemplate(name);
    const fieldCount = Object.keys(template).length;
    return `
      <div class="template-item" on clicking it="applyTemplate('${name}')">
        <h4>${name}</h4>
        <p>${fieldCount} fields</p>
      </div>
    `;
  }).join('');
  
  modal.style.display = 'flex';
}

/**
 * Close template modal
 */
function closeTemplateModal() {
  document.getElementById('template-modal').style.display = 'none';
}

/**
 * Apply template (global function)
 */
window.applyTemplate = async function(templateName) {
  const template = ScholarshipTemplates.getTemplate(templateName);
  if (!template) return;

  customFields = CustomFieldsManager.applyTemplate(customFields, template);
  await saveUserData();
  updateCustomFieldsList();
  closeTemplateModal();
};

/**
 * Check if form is detected on current tab
 */
async function checkFormDetected() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url?.includes('forms.google.com') || tab.url?.includes('forms.gle')) {
      const statusEl = document.getElementById('form-status');
      if (statusEl) {
        statusEl.style.display = 'block';
      }
    }
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  if (confirm('Lock the extension? You will need to enter your master password again.')) {
    await AuthManager.clearSession();
    encryptionKey = null;
    profile = null;
    customFields = {};
    showScreen('login');
  }
}

// All required classes (CryptoUtils, AuthManager, StorageManager, ProfileManager, CustomFieldsManager, ScholarshipTemplates)
// are loaded via script tags in popup.html and available globally

