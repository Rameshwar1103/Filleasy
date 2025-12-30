# Filleasy Project Structure

Complete file structure and organization of the Filleasy Chrome extension.

## Directory Structure

```
Filleasy/
├── manifest.json              # Extension manifest (Manifest V3)
├── background.js              # Background service worker
├── content.js                 # Content script for form filling
│
├── popup.html                 # Extension popup HTML
├── popup.css                  # Popup styles (Material Design 3)
├── popup.js                   # Popup logic and UI handlers
│
├── options.html               # Settings/Profile page HTML
├── options.css                # Options page styles
├── options.js                 # Options page logic
│
├── lib/                       # Core libraries
│   ├── crypto-utils.js       # Encryption utilities (AES-256, PBKDF2)
│   ├── auth-manager.js       # Authentication and session management
│   ├── storage-manager.js    # Encrypted storage management
│   ├── profile-manager.js    # Profile data structure and validation
│   ├── custom-fields-manager.js  # Custom fields management
│   └── fuzzy-matcher.js      # AI-powered field matching engine
│
├── icons/                     # Extension icons
│   ├── icon16.png            # 16x16 toolbar icon (required)
│   ├── icon48.png            # 48x48 extension management icon (required)
│   ├── icon128.png           # 128x128 Chrome Web Store icon (required)
│   └── README.md             # Icon guidelines
│
├── README.md                  # Main documentation
├── INSTALL.md                 # Installation guide
├── USER_GUIDE.md             # Comprehensive user guide
├── SECURITY_AUDIT.md         # Security documentation
├── CHANGELOG.md              # Version history
├── LICENSE                   # MIT License
├── PROJECT_STRUCTURE.md      # This file
└── .gitignore                # Git ignore rules
```

## File Descriptions

### Core Extension Files

#### manifest.json
- Extension configuration
- Permissions and host permissions
- Content scripts configuration
- Background service worker setup
- Icons and action configuration

#### background.js
- Service worker for Manifest V3
- Session management
- Encryption key caching (in-memory)
- Message routing
- Auto-lock functionality

#### content.js
- Injected into Google Forms pages
- Form field detection
- Form filling logic
- Integration with fuzzy matcher
- Message handling from popup

### User Interface

#### popup.html/css/js
- Extension popup interface (450x700px)
- Login/setup screens
- Dashboard with profile preview
- Quick fill buttons
- Custom fields manager
- Preview modal
- Template selector

#### options.html/css/js
- Full settings page
- Profile editor (all fields)
- Custom fields management
- Settings configuration
- Security options
- Data import/export

### Core Libraries

#### lib/crypto-utils.js
- AES-256-GCM encryption/decryption
- PBKDF2 key derivation
- Password hashing (PBKDF2, 100k iterations)
- Session token generation
- Salt generation

#### lib/auth-manager.js
- Master password management
- Session creation and validation
- Failed attempt tracking
- Account lockout logic
- Password strength validation

#### lib/storage-manager.js
- Encrypted data storage/retrieval
- Chrome storage wrapper
- Default settings initialization
- Storage cleanup utilities

#### lib/profile-manager.js
- Profile data structure definition
- Profile validation (email, phone, etc.)
- Default profile generation
- Profile merging utilities

#### lib/custom-fields-manager.js
- Custom field CRUD operations
- Category management
- Field type handling
- Import/export functionality
- Scholarship template system

#### lib/fuzzy-matcher.js
- Levenshtein distance calculation
- String similarity scoring
- Field matching patterns
- Profile value extraction
- Date formatting utilities

### Documentation

#### README.md
- Project overview
- Feature list
- Quick start guide
- Requirements
- License information

#### INSTALL.md
- Step-by-step installation
- Troubleshooting
- Post-installation checklist
- Uninstallation guide

#### USER_GUIDE.md
- Complete usage instructions
- Profile setup guide
- Custom fields tutorial
- Form filling workflow
- Settings explanation
- FAQ

#### SECURITY_AUDIT.md
- Security architecture
- Encryption details
- Threat analysis
- Best practices
- Compliance information

#### CHANGELOG.md
- Version history
- Feature additions
- Bug fixes
- Breaking changes

## Dependencies

### Browser APIs
- Chrome Extension API (Manifest V3)
- Web Crypto API (encryption)
- Chrome Storage API (data persistence)
- Chrome Tabs API (tab management)
- Chrome Scripting API (content script injection)

### External Libraries
- **None** - All functionality implemented using native browser APIs

## Data Flow

### Initialization Flow
1. Extension installed → background.js initializes
2. User clicks icon → popup.js loads
3. Check authentication → AuthManager.isAuthenticated()
4. If not authenticated → show login screen
5. User enters password → AuthManager.verifyMasterPassword()
6. Derive encryption key → CryptoUtils.deriveKey()
7. Load encrypted data → StorageManager.getEncrypted()
8. Decrypt profile/custom fields → CryptoUtils.decrypt()
9. Display dashboard → showScreen('dashboard')

### Form Filling Flow
1. User navigates to Google Form
2. content.js detects form (automatic injection)
3. User clicks "Fill All Fields" in popup
4. popup.js sends message to content.js
5. content.js detects all form fields
6. FuzzyMatcher matches fields to profile
7. Fill form fields with matched values
8. Return success/failure to popup

### Data Storage Flow
1. User edits profile in options.html
2. options.js collects form data
3. Validate data → ProfileManager.validateProfile()
4. Encrypt data → CryptoUtils.encrypt()
5. Save to Chrome storage → StorageManager.saveEncrypted()
6. Data stored encrypted in chrome.storage.local

## Security Considerations

### Encryption
- All sensitive data encrypted with AES-256-GCM
- Encryption keys derived from master password (PBKDF2)
- Keys never stored, only derived on-demand
- Session tokens for temporary access

### Data Privacy
- Local storage only (chrome.storage.local)
- No external network requests
- No analytics or tracking
- No data transmission to servers

### Access Control
- Master password required for access
- Session-based authentication
- Auto-lock after inactivity
- Failed attempt protection

## Browser Compatibility

- **Chrome**: 88+ (Manifest V3 support)
- **Edge**: 88+ (Chromium-based)
- **Other Chromium browsers**: Should work (not tested)

## Build Process

This extension does not require a build process. It can be loaded directly as "unpacked" in Chrome.

For production:
1. Create icons (16x16, 48x48, 128x128 PNG files)
2. Place icons in `icons/` directory
3. Load extension in Chrome Developer mode
4. Test all functionality
5. Create ZIP file for distribution
6. Submit to Chrome Web Store (if publishing)

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Master password setup works
- [ ] Login/logout functionality
- [ ] Profile saving and loading
- [ ] Custom fields CRUD operations
- [ ] Form detection on Google Forms
- [ ] Field matching accuracy
- [ ] Form filling success rate
- [ ] Preview before fill
- [ ] Settings persistence
- [ ] Data export/import
- [ ] Password change
- [ ] Session expiration
- [ ] Failed attempt lockout
- [ ] Dark/light theme switching

## Notes

- All scripts are loaded via `<script>` tags (no module system)
- Classes are global (loaded before use)
- Chrome extension APIs are available globally
- Content scripts run in isolated context
- Background service worker runs separately

---

**Last Updated**: December 27, 2025

