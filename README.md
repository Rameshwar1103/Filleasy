# Filleasy - Smart Form Filler

**Filleasy** is a powerful Chrome extension designed to auto-fill Google Forms with personal information. Built primarily for college students, scholarship applicants, and general form fillers with enterprise-grade security.

## 🌟 Features

### Core Functionality
- **Smart Auto-Fill**: Automatically detects and fills Google Forms with your profile information
- **ML-Powered Matching**: Bag of Words + Naive Bayes ML classifier (95%+ accuracy) intelligently matches form fields to your profile data
- **Confidence Indicators**: Visual confidence badges (🟢 Green ≥80%, 🟡 Yellow 60-80%, 🔴 Red <60%) show prediction confidence
- **One-Click Fill**: Fill entire forms with a single click
- **Preview Before Fill**: Review and edit field mappings with confidence scores before filling

### Profile Management
- **Comprehensive Profile**: Store personal, academic, address, and social information
- **Student-Specific Fields**: Pre-configured fields for college students (CGPA, semester, roll number, etc.)
- **Document Links**: Store links to important documents (marksheets, ID cards, photos)
- **Social Profiles**: LinkedIn, GitHub, Portfolio, and other professional links

### Dynamic Custom Fields
- **Unlimited Custom Fields**: Add any number of custom key-value pairs
- **Categories**: Organize fields by category (Academic, Financial, Documents, etc.)
- **Field Types**: Support for text, number, date, dropdown, and long text fields
- **Templates**: Pre-built scholarship templates for quick setup
- **Import/Export**: Backup and restore your custom fields

### Enterprise-Grade Security
- **Double Encryption**: AES-256 encryption with PBKDF2 key derivation
- **Master Password**: Additional security layer beyond Chrome storage
- **Session Management**: Auto-lock after 15 minutes of inactivity
- **Failed Attempt Protection**: Account lockout after 5 failed password attempts
- **Local-Only Storage**: All data stored locally, no external servers
- **Zero Analytics**: Complete privacy, no tracking or analytics

### User Experience
- **Material Design 3**: Modern, beautiful UI with animations
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Responsive Design**: Works perfectly on all screen sizes
- **Form Detection**: Automatically detects Google Forms on the page
- **Progress Indicators**: Visual feedback during form filling

## 📋 Requirements

- Google Chrome browser (version 88 or higher)
- Google account (for accessing Google Forms)
- Master password (set during first-time setup)

## 🚀 Installation

See [INSTALL.md](INSTALL.md) for detailed installation instructions.

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory
5. The extension icon will appear in your toolbar

## 📖 User Guide

See [USER_GUIDE.md](USER_GUIDE.md) for a comprehensive user guide covering:
- First-time setup
- Profile configuration
- Custom fields management
- Form filling workflow
- Security best practices
- Troubleshooting

## 🔒 Security

Filleasy implements multiple layers of security:

1. **Password-Based Encryption**: Your master password is hashed using PBKDF2 with 100,000+ iterations
2. **AES-256-GCM**: All sensitive data is encrypted using industry-standard AES-256-GCM
3. **Session Tokens**: Secure session management with automatic expiration
4. **Local Storage**: All data stored locally in Chrome, never sent to external servers
5. **No Tracking**: Zero analytics, zero tracking, complete privacy

See [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for a detailed security audit.

## 🛠️ Technical Architecture

- **Manifest V3**: Built with the latest Chrome extension API
- **Content Scripts**: Detects and fills forms on Google Forms pages
- **Background Service Worker**: Manages sessions and encryption keys
- **Web Crypto API**: Uses browser's native crypto API for encryption
- **Material Design 3**: Modern UI components and animations

### File Structure
```
Filleasy/
├── manifest.json          # Extension manifest
├── popup.html/js/css      # Extension popup UI
├── options.html/js/css    # Settings and profile page
├── background.js          # Service worker
├── content.js             # Form filling logic
├── lib/                   # Core libraries
│   ├── crypto-utils.js    # Encryption utilities
│   ├── auth-manager.js    # Authentication
│   ├── storage-manager.js # Storage management
│   ├── profile-manager.js # Profile data structure
│   ├── custom-fields-manager.js # Custom fields
│   └── fuzzy-matcher.js   # Field matching engine
└── icons/                 # Extension icons
```

## 🎯 Target Users

1. **College Students**: Academic forms, internship applications, placement forms
2. **Scholarship Applicants**: Financial aid forms, government schemes, merit scholarships
3. **General Users**: Job applications, registrations, surveys

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Reporting Issues

If you encounter any bugs or have feature requests, please open an issue on GitHub.

## 📧 Support

For support, please open an issue on GitHub or refer to the user guide.

## 🙏 Acknowledgments

- Built with Chrome Extension Manifest V3
- Uses Web Crypto API for encryption
- Material Design 3 for UI components

---

**Made with ❤️ for students and form fillers everywhere**

