# Filleasy Installation Guide

This guide will walk you through installing the Filleasy Chrome extension.

## Prerequisites

- Google Chrome browser (version 88 or higher)
- Admin access to install extensions (or permission to load unpacked extensions)

## Installation Methods

### Method 1: Load Unpacked (Development/Manual)

1. **Download the Extension**
   - Download the extension ZIP file or clone the repository
   - Extract the ZIP file to a location on your computer (e.g., `D:\Filleasy`)

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or go to Menu (⋮) → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Select the folder where you extracted the extension
   - The extension should now appear in your extensions list

5. **Verify Installation**
   - You should see the Filleasy icon in your Chrome toolbar
   - Click the icon to open the extension popup

### Method 2: Chrome Web Store (Future)

Once published to the Chrome Web Store:
1. Visit the Chrome Web Store listing
2. Click "Add to Chrome"
3. Confirm the installation
4. The extension will be automatically installed and kept up to date

## First-Time Setup

After installation, you need to set up your account:

1. **Click the Extension Icon**
   - Click the Filleasy icon in your Chrome toolbar
   - The extension popup will open

2. **Create Master Password**
   - You'll see the setup screen
   - Enter a strong master password (minimum 8 characters, mix of letters, numbers, and special characters)
   - Confirm your password
   - Click "Create Account"

3. **Configure Your Profile**
   - Click "Edit" or go to Settings (⚙️ icon)
   - Fill in your personal information:
     - Personal details (name, email, phone, date of birth)
     - Address information
     - Academic information (10th, 12th, college details)
     - Document links
     - Social media profiles
   - Click "Save Profile"

4. **Add Custom Fields (Optional)**
   - Navigate to the "Custom Fields" tab in Settings
   - Click "+ Add Field" to create custom fields
   - Or import a scholarship template

5. **You're Ready!**
   - Navigate to any Google Form
   - Click the Filleasy icon
   - Click "Fill All Fields" or "Preview & Edit"

## Post-Installation Checklist

- [ ] Extension installed successfully
- [ ] Master password created
- [ ] Profile information filled
- [ ] Custom fields added (if needed)
- [ ] Tested on a Google Form

## Troubleshooting

### Extension Not Appearing

- **Check Extensions Page**: Go to `chrome://extensions/` and verify Filleasy is listed
- **Check if Enabled**: Ensure the extension is enabled (toggle switch should be ON)
- **Reload Extension**: Click the reload icon (⟳) next to the extension
- **Check Toolbar**: Right-click the toolbar and ensure the extension icon is pinned

### "Load Unpacked" Button Not Available

- **Enable Developer Mode**: Toggle "Developer mode" switch in the top-right of the extensions page
- **Check Permissions**: Ensure you have permission to install extensions

### Extension Not Working on Google Forms

- **Check URL**: Ensure you're on `docs.google.com/forms` or `forms.gle`
- **Refresh Page**: Refresh the Google Form page
- **Check Console**: Open Developer Tools (F12) and check for errors
- **Reload Extension**: Go to `chrome://extensions/` and reload the extension

### Master Password Issues

- **Forgot Password**: Unfortunately, the master password cannot be recovered. You'll need to clear all data and start over (Settings → Security → Clear All Data)
- **Password Not Working**: Ensure Caps Lock is off and you're typing the correct password
- **Account Locked**: Wait 30 minutes after 5 failed attempts, then try again

### Data Not Saving

- **Check Storage**: Go to `chrome://extensions/` → Filleasy → "Service worker" → "Inspect" → "Application" → "Local Storage"
- **Clear Cache**: Clear browser cache and cookies (Settings → Privacy → Clear browsing data)
- **Reload Extension**: Reload the extension from the extensions page

## Updating the Extension

### For Unpacked Extensions

1. Download the latest version
2. Replace the old files with new ones
3. Go to `chrome://extensions/`
4. Click the reload icon (⟳) next to Filleasy

### For Chrome Web Store

The extension will update automatically. You can also manually check for updates:
1. Go to `chrome://extensions/`
2. Click "Update" button if available

## Uninstallation

1. Go to `chrome://extensions/`
2. Find Filleasy in the list
3. Click "Remove"
4. Confirm removal

**Note**: Uninstalling will NOT delete your stored data. To delete all data, go to Settings → Security → Clear All Data before uninstalling.

## System Requirements

- **Operating System**: Windows, macOS, Linux, or Chrome OS
- **Chrome Version**: 88 or higher
- **Storage**: ~1MB disk space
- **Memory**: Minimal impact on browser performance

## Permissions Explained

Filleasy requests the following permissions:

- **storage**: To save your profile and custom fields locally
- **activeTab**: To interact with Google Forms on the current tab
- **scripting**: To inject form-filling scripts
- **identity**: For future OAuth integration (not currently used)

All data is stored locally and never sent to external servers.

## Getting Help

If you encounter issues during installation:

1. Check this guide first
2. Review the [USER_GUIDE.md](USER_GUIDE.md) for usage instructions
3. Check the [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for security information
4. Open an issue on GitHub with:
   - Chrome version
   - Operating system
   - Steps to reproduce
   - Error messages (if any)

---

**Need help? Open an issue on GitHub or refer to the user guide.**

