# Filleasy User Guide

Complete guide to using Filleasy - the smart form filler for Google Forms.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Setting Up Your Profile](#setting-up-your-profile)
3. [Using Custom Fields](#using-custom-fields)
4. [Filling Forms](#filling-forms)
5. [Settings & Preferences](#settings--preferences)
6. [Security & Privacy](#security--privacy)
7. [Troubleshooting](#troubleshooting)
8. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### First-Time Setup

1. **Install the Extension**
   - Follow the installation guide in [INSTALL.md](INSTALL.md)
   - The Filleasy icon should appear in your Chrome toolbar

2. **Create Your Account**
   - Click the Filleasy icon
   - Enter a strong master password (minimum 8 characters)
   - Confirm your password
   - Click "Create Account"

   **⚠️ Important**: Your master password cannot be recovered. Store it securely!

3. **Set Up Your Profile**
   - Click "Edit" button or open Settings
   - Fill in your information (see Profile Setup below)
   - Click "Save Profile"

4. **Test It Out**
   - Navigate to a Google Form
   - Click the Filleasy icon
   - Click "Fill All Fields" to test

---

## Setting Up Your Profile

### Personal Information

Fill in your basic personal details:

- **First Name, Middle Name, Last Name**: Your full name
- **Date of Birth**: Your birth date
- **Gender**: Select from dropdown
- **Blood Group**: Select your blood type (optional)
- **Phone Number**: 10-digit phone number
- **Email**: Your email address (required)
- **Aadhaar Number**: 12-digit Aadhaar number (India)
- **PAN**: Permanent Account Number (optional)

### Address Information

Complete your address details:

- **House/Apartment Number**: Building number
- **Street Address**: Street name and number
- **City**: City name
- **State**: State name
- **PIN Code**: 6-digit postal code
- **Country**: Defaults to "India"

### Academic Information

#### 10th Standard Details
- **Board**: School board (e.g., CBSE, ICSE, State Board)
- **Year**: Year of passing
- **Percentage**: Marks percentage

#### 12th Standard Details
- **Board**: School board
- **Year**: Year of passing
- **Percentage**: Marks percentage
- **Stream**: Science, Commerce, Arts, or Other

#### College/University Information
- **College/University Name**: Full name of your institution
- **Course/Degree**: Degree program (e.g., B.Tech, B.Sc, B.Com)
- **Branch/Department**: Your specialization
- **Current Semester**: Current semester (e.g., 5th)
- **Current Year**: Current year (e.g., 3rd Year)
- **CGPA**: Current CGPA (if applicable)
- **Percentage**: Current percentage
- **Roll Number**: Your roll number
- **Registration Number**: Your registration number
- **Technical Skills**: Comma-separated list (e.g., "JavaScript, Python, React")

### Document Links

Store links to important documents:

- **10th Marksheet Link**: URL to your 10th marksheet
- **12th Marksheet Link**: URL to your 12th marksheet
- **College ID Card Link**: URL to your college ID
- **Passport Size Photo Link**: URL to your photo

**Note**: These should be accessible URLs (Google Drive share links, etc.)

### Social & Professional Links

Add your online profiles:

- **LinkedIn**: Your LinkedIn profile URL
- **GitHub**: Your GitHub profile URL
- **Portfolio**: Your portfolio website
- **Behance**: Your Behance profile (for designers)
- **Instagram**: Instagram handle (@username)
- **Twitter/X**: Twitter handle (@username)
- **WhatsApp**: WhatsApp number with country code
- **Telegram**: Telegram username (@username)

---

## Using Custom Fields

### Adding Custom Fields

Custom fields allow you to store additional information not in your main profile.

1. **Open Settings**
   - Click the Filleasy icon
   - Click the Settings (⚙️) icon
   - Go to "Custom Fields" tab

2. **Add a Field**
   - Click "+ Add Field"
   - Enter:
     - **Field Key**: Unique identifier (e.g., `familyIncome`)
     - **Display Label**: How it appears (e.g., "Family Annual Income")
     - **Value**: The actual value
     - **Field Type**: Text, Number, Date, Dropdown, or Long Text
     - **Category**: General, Academic, Financial, Documents, etc.
   - Click "Save Field"

### Organizing Fields by Category

Use categories to organize your custom fields:

- **General**: Miscellaneous fields
- **Academic**: Education-related fields
- **Financial**: Income, bank details, etc.
- **Documents**: Document links
- **Personal**: Personal information
- **Scholarship**: Scholarship-specific fields
- **Employment**: Job-related fields
- **Other**: Custom categories

### Using Scholarship Templates

Pre-built templates make it easy to add scholarship-specific fields:

1. Go to Custom Fields tab
2. Click "Import Template" (📥 icon in popup)
3. Select a template:
   - Government Scholarship (India)
   - Merit-Based Scholarship
   - Need-Based Scholarship
   - International Scholarship
4. Template fields will be added to your custom fields

### Editing and Deleting Fields

- **Edit**: Click the edit (✏️) icon next to a field
- **Delete**: Click the delete (🗑️) icon and confirm

### Exporting and Importing Fields

**Export**:
- Settings → Security → Export Data
- Saves all custom fields as JSON file

**Import**:
- Settings → Security → Import Data
- Select exported JSON file
- Confirms before overwriting existing fields

---

## Filling Forms

### Basic Filling

1. **Navigate to a Google Form**
   - Open any form on `forms.google.com` or `forms.gle`
   - The extension automatically detects the form

2. **Fill the Form**
   - Click the Filleasy icon
   - Click "Fill All Fields" to automatically fill all detected fields
   - Review and submit the form

### Preview Before Fill

To review what will be filled:

1. Click the Filleasy icon
2. Click "Preview & Edit"
3. Review the field mappings:
   - See which profile fields match form fields
   - Check the confidence scores
   - Review the values that will be filled
4. Click "Fill Form" to proceed or "Cancel" to abort

### Field Matching

Filleasy uses intelligent matching to map form fields to your profile:

1. **Exact Match**: Field names match exactly (100% confidence)
2. **Fuzzy Match**: Similar field names (60-99% confidence)
3. **Keyword Match**: Related keywords found (70% confidence)
4. **Custom Fields**: Matches against your custom fields

### Handling Multi-Page Forms

For forms with multiple pages:

1. Fill the first page
2. Click "Next" to go to the next page
3. Click "Fill All Fields" again for the next page
4. Repeat until the form is complete

### What Gets Filled

- ✅ Text fields (names, addresses, etc.)
- ✅ Email fields
- ✅ Phone number fields
- ✅ Date fields (formatted correctly)
- ✅ Dropdown/select fields
- ✅ Radio button fields
- ✅ Checkbox fields
- ✅ Textarea/long text fields
- ❌ File upload fields (must upload manually)

---

## Settings & Preferences

### General Settings

Access via: Settings (⚙️) icon → Settings tab

- **Theme**: Light, Dark, or Auto (follows system)
- **Auto-fill on form detection**: Automatically fill when form detected
- **Show preview before filling**: Always show preview modal
- **Session Timeout**: Minutes before auto-lock (5-60 minutes)

### Security Settings

Access via: Settings → Security tab

- **Change Master Password**: Update your master password
- **Export Data**: Download your encrypted data backup
- **Import Data**: Restore from backup
- **Clear All Data**: Permanently delete all data (⚠️ irreversible)

### Profile Settings

Access via: Settings → Profile tab

- Edit all profile information
- Reset profile to defaults
- Validation feedback on save

---

## Security & Privacy

### Master Password

- **Required** to unlock the extension
- **Cannot be recovered** if forgotten
- **Strong password recommended**:
  - Minimum 8 characters
  - Mix of uppercase, lowercase, numbers, special characters
  - Unique (not used elsewhere)

### Session Management

- Extension auto-locks after 15 minutes of inactivity
- Re-enter master password to unlock
- Session cleared on browser restart

### Data Storage

- All data stored **locally** in Chrome
- **Encrypted** with AES-256 encryption
- **Never transmitted** to external servers
- **No analytics** or tracking

### Privacy Features

- Zero data collection
- No external servers
- No network requests
- Complete local processing

### Backup & Recovery

- **Export**: Settings → Security → Export Data
- **Import**: Settings → Security → Import Data
- Store backups securely
- Don't share master password with backups

---

## Troubleshooting

### Extension Not Filling Forms

**Problem**: Form fields are not being filled

**Solutions**:
1. Check you're on a Google Form (`forms.google.com` or `forms.gle`)
2. Refresh the page and try again
3. Click "Fill All Fields" manually
4. Check if fields are detected: Use "Preview & Edit"
5. Verify your profile is set up correctly

### Field Matching Issues

**Problem**: Wrong fields are being matched

**Solutions**:
1. Use "Preview & Edit" to review mappings
2. Add custom fields with better labels
3. Manually fill mismatched fields
4. Form field labels may be ambiguous

### Master Password Not Working

**Problem**: Can't unlock extension

**Solutions**:
1. Check Caps Lock is off
2. Verify you're entering the correct password
3. Wait 30 minutes if account is locked (after 5 failed attempts)
4. If forgotten, you'll need to clear data and start over

### Profile Not Saving

**Problem**: Changes to profile don't save

**Solutions**:
1. Check for validation errors (red text)
2. Required fields must be filled (First Name, Last Name, Email)
3. Email must be valid format
4. Try refreshing the page

### Extension Not Detecting Form

**Problem**: "Form Detected" status doesn't appear

**Solutions**:
1. Ensure you're on `docs.google.com/forms` or `forms.gle`
2. Wait for the form to fully load
3. Refresh the page
4. Check browser console for errors (F12)

### Session Expired

**Problem**: Extension keeps locking

**Solutions**:
1. This is normal security behavior (15-minute timeout)
2. Increase session timeout in Settings (up to 60 minutes)
3. Re-enter master password to unlock
4. Consider shorter timeout for better security

---

## Tips & Best Practices

### Profile Setup

1. **Fill All Fields**: Complete as much information as possible for better matching
2. **Use Consistent Format**: Use the same format for dates, phone numbers, etc.
3. **Keep Updated**: Update your profile when information changes
4. **Use Document Links**: Store links to important documents (marksheets, IDs)

### Custom Fields

1. **Use Descriptive Keys**: Use clear, unique keys (e.g., `familyIncome`, not `fi`)
2. **Organize by Category**: Group related fields by category
3. **Use Templates**: Start with scholarship templates and customize
4. **Regular Backups**: Export custom fields regularly

### Form Filling

1. **Always Preview First**: Use "Preview & Edit" for important forms
2. **Review Before Submit**: Check filled values before submitting
3. **Manual Corrections**: Some fields may need manual correction
4. **Multi-Page Forms**: Fill each page separately

### Security

1. **Strong Password**: Use a unique, strong master password
2. **Regular Backups**: Export your data regularly
3. **Secure Storage**: Store backups in a secure location
4. **Lock Device**: Lock your device when not in use
5. **Don't Share Password**: Never share your master password

### Performance

1. **Large Custom Fields**: Having many custom fields (1000+) may slow down matching
2. **Profile Size**: Keep profile data concise for faster processing
3. **Browser Performance**: Extension has minimal impact on browser performance

### Common Use Cases

**College Applications**:
- Fill personal, academic, and contact information
- Use technical skills field for programming languages
- Add document links for certificates

**Scholarship Applications**:
- Import scholarship template
- Fill financial information (family income, etc.)
- Add academic achievements

**Job Applications**:
- Fill personal and professional information
- Use LinkedIn and GitHub links
- Add portfolio link

---

## Keyboard Shortcuts

Currently, Filleasy doesn't support keyboard shortcuts. All actions are performed via mouse clicks on the extension popup.

---

## FAQ

**Q: Can I recover my master password if I forget it?**  
A: No, the master password cannot be recovered. You'll need to clear all data and start over. Always keep backups.

**Q: Does Filleasy work offline?**  
A: Yes, all processing happens locally. Internet is only needed to access Google Forms.

**Q: Can I use Filleasy on other form platforms?**  
A: Currently, only Google Forms are supported. Other platforms may be added in future versions.

**Q: Is my data safe?**  
A: Yes, all data is encrypted and stored locally. No data is sent to external servers.

**Q: Can I sync data across devices?**  
A: Currently, data is stored locally per device. Cloud sync may be added in the future.

**Q: Does Filleasy work on mobile?**  
A: Filleasy is a Chrome extension and works on Chrome for desktop. Chrome extensions don't work on mobile Chrome.

**Q: How accurate is field matching?**  
A: Field matching uses fuzzy logic with typically 90%+ accuracy. Use "Preview & Edit" to verify.

**Q: Can I disable auto-fill?**  
A: Yes, disable "Auto-fill on form detection" in Settings.

---

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check the troubleshooting section
- Review the documentation

---

**Last Updated**: December 27, 2025  
**Version**: 1.0.0

