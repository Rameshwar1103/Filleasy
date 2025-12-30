# Quick Start Guide - Adding Icons & Running Filleasy

This guide will walk you through adding icons and running the extension step-by-step.

## Step 1: Create or Add Icons

You need 3 icon files in PNG format. Here are your options:

### Option A: Create Simple Icons (Recommended for Quick Testing)

1. **Use an Online Icon Generator:**
   - Visit: https://www.favicon-generator.org/ or https://realfavicongenerator.net/
   - Create a simple icon with text "FF" (Form Filler) or a form/document symbol
   - Use color: #6366F1 (indigo/purple)
   - Download as PNG

2. **Use Canva/Figma (Free):**
   - Create a 128x128px design
   - Use a simple form/document icon or text "FF"
   - Export as PNG
   - Resize to create 16x16, 48x48, and 128x128 versions

3. **Use Any Image Editor:**
   - Create a simple square icon (128x128px recommended)
   - Fill with color #6366F1
   - Add white text "FF" or a form icon
   - Save as PNG
   - Create smaller versions (48x48, 16x16)

### Option B: Use Placeholder Icons (For Testing Only)

1. **Create Simple Colored Squares:**
   - Use any image editor or online tool
   - Create 3 PNG files:
     - icon16.png (16x16 pixels) - Solid color #6366F1
     - icon48.png (48x48 pixels) - Solid color #6366F1
     - icon128.png (128x128 pixels) - Solid color #6366F1 with white "FF" text

2. **Save Files:**
   - Save all 3 files in the `icons/` folder
   - Make sure filenames are exactly: `icon16.png`, `icon48.png`, `icon128.png`

### Quick Method: Download Ready-Made Icons

1. Search for "form icon png" on Google Images
2. Find simple, free icons
3. Resize to 16x16, 48x48, and 128x128 pixels
4. Save in `icons/` folder with correct names

## Step 2: Verify Icon Files

After adding icons, your `icons/` folder should contain:
```
icons/
├── icon16.png   (16x16 pixels)
├── icon48.png   (48x48 pixels)
├── icon128.png  (128x128 pixels)
└── README.md
```

**Check file names are EXACTLY:**
- `icon16.png` (lowercase, no spaces)
- `icon48.png`
- `icon128.png`

## Step 3: Load Extension in Chrome

1. **Open Chrome Browser**
   - Make sure you're using Google Chrome (not other browsers)
   - Version 88 or higher recommended

2. **Navigate to Extensions Page**
   - Type in address bar: `chrome://extensions/`
   - OR click Menu (⋮) → More Tools → Extensions
   - OR press: `Ctrl+Shift+E` (Windows) / `Cmd+Shift+E` (Mac)

3. **Enable Developer Mode**
   - Look for "Developer mode" toggle in top-right corner
   - Click the toggle to turn it ON
   - You should see additional buttons appear

4. **Load the Extension**
   - Click the "Load unpacked" button
   - Navigate to your Filleasy folder: `D:\Filleasy`
   - Select the folder (click "Select Folder" or "Open")
   - The extension should now appear in your extensions list

5. **Verify Installation**
   - You should see "Filleasy - Smart Form Filler" in the extensions list
   - The icon should appear in your Chrome toolbar (top-right area)
   - If icon is not visible, click the puzzle/piece icon (Extensions icon) and pin Filleasy

## Step 4: Set Up Your Account

1. **Click the Extension Icon**
   - Click the Filleasy icon in your Chrome toolbar
   - The popup window should open

2. **Create Master Password**
   - You'll see a setup screen (if first time)
   - Enter a strong password:
     - Minimum 8 characters
     - Mix of uppercase, lowercase, numbers, special characters
     - Example: `MySecure123!Pass`
   - Confirm the password
   - Click "Create Account"

   ⚠️ **IMPORTANT**: Remember this password! It cannot be recovered.

3. **Set Up Your Profile**
   - Click "Edit" button or the Settings (⚙️) icon
   - Fill in your information:
     - **Required**: First Name, Last Name, Email
     - Fill other fields as needed
   - Click "Save Profile" at the bottom

4. **Add Custom Fields (Optional)**
   - Go to "Custom Fields" tab
   - Click "+ Add Field" to add custom fields
   - Or click "Import Template" to add scholarship templates

## Step 5: Test the Extension

1. **Open a Test Google Form**
   - Create a test form at: https://forms.google.com
   - Add some fields like:
     - First Name (text)
     - Last Name (text)
     - Email (email)
     - Phone (text)
     - Address (text)
     - Date of Birth (date)
   - Save the form

2. **Open the Form**
   - Click "Send" → Get the link
   - Open the form link in Chrome

3. **Use Filleasy**
   - Click the Filleasy icon in toolbar
   - Click "Preview & Edit" to see what will be filled
   - OR click "Fill All Fields" to fill immediately
   - Review the filled form
   - Submit if everything looks correct

## Step 6: Troubleshooting Common Issues

### Issue: Icons Not Showing

**Solution:**
1. Check file names are exactly `icon16.png`, `icon48.png`, `icon128.png` (lowercase)
2. Verify files are PNG format
3. Check file sizes (16x16, 48x48, 128x128 pixels)
4. Reload the extension in `chrome://extensions/`

### Issue: Extension Not Loading

**Solution:**
1. Check for errors in `chrome://extensions/` (red error messages)
2. Open Developer Tools: Click "service worker" link → Check console
3. Verify all files are in correct locations
4. Make sure `manifest.json` is valid (no syntax errors)

### Issue: "Load Unpacked" Button Not Visible

**Solution:**
1. Enable "Developer mode" toggle (top-right of extensions page)
2. Refresh the extensions page

### Issue: Extension Icon Not in Toolbar

**Solution:**
1. Click the puzzle/extensions icon (top-right)
2. Find "Filleasy" in the list
3. Click the pin icon (📌) next to it
4. Icon should now appear in toolbar

### Issue: Form Not Filling

**Solution:**
1. Make sure you're on a Google Form (`forms.google.com` or `forms.gle`)
2. Refresh the form page
3. Click "Fill All Fields" button again
4. Check your profile has data filled
5. Use "Preview & Edit" to see what's being matched

### Issue: Master Password Not Working

**Solution:**
1. Check Caps Lock is off
2. Type password carefully (no extra spaces)
3. If locked: Wait 30 minutes after 5 failed attempts
4. If forgotten: Clear data and start over (Settings → Security → Clear All Data)

## Step 7: Daily Usage

Once set up, using Filleasy is simple:

1. **Navigate to any Google Form**
2. **Click Filleasy icon**
3. **Click "Fill All Fields"** (or "Preview & Edit" first)
4. **Review and submit the form**

The extension will:
- Detect the form automatically
- Match form fields to your profile
- Fill all matching fields
- Show you a preview before filling (if enabled)

## Quick Reference: File Locations

```
D:\Filleasy\
├── icons\
│   ├── icon16.png    ← Place your 16x16 icon here
│   ├── icon48.png    ← Place your 48x48 icon here
│   └── icon128.png   ← Place your 128x128 icon here
├── manifest.json     ← Extension configuration
├── popup.html/js/css ← Extension popup UI
├── options.html/js/css ← Settings page
├── background.js     ← Background service worker
└── content.js        ← Form filling script
```

## Tips for Success

1. **Start Simple**: Test with a basic form first (name, email, phone)
2. **Fill Your Profile**: More complete profile = better field matching
3. **Use Preview**: Always use "Preview & Edit" for important forms
4. **Regular Backups**: Export your data regularly (Settings → Security → Export Data)
5. **Keep Updated**: Keep Chrome and the extension updated

## Next Steps

After getting it running:
- ✅ Fill out your complete profile
- ✅ Add custom fields for specific forms
- ✅ Test on different types of forms
- ✅ Use scholarship templates for scholarship applications
- ✅ Export your data as backup

---

**Need Help?**
- Check `USER_GUIDE.md` for detailed usage instructions
- Check `INSTALL.md` for installation troubleshooting
- Review `README.md` for feature overview

**Enjoy using Filleasy! 🚀**

