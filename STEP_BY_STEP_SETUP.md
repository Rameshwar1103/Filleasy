# Step-by-Step Setup Guide

Complete walkthrough from icons to running the extension.

## Part 1: Creating Icons (5 minutes)

### Option A: Quick Placeholder Icons

1. **Open Paint (Windows)** or any image editor
2. **Create 128x128 image:**
   - Open Paint
   - Go to: Home → Resize → Pixels
   - Uncheck "Maintain aspect ratio"
   - Set Width: 128, Height: 128
   - Click OK

3. **Fill with color:**
   - Click "Color 1" (foreground)
   - Click "Edit colors"
   - Enter RGB: Red: 99, Green: 102, Blue: 241
   - Click "Add to Custom Colors" → OK
   - Use "Fill with color" tool to fill the canvas

4. **Add text:**
   - Click "A" (Text tool)
   - Draw a text box
   - Type: **FF**
   - Select text → Font: Arial Bold, Size: 72
   - Color: White
   - Center the text

5. **Save:**
   - File → Save As
   - File name: `icon128.png`
   - Save type: PNG (*.png)
   - Location: `D:\Filleasy\icons\`

6. **Create smaller versions:**
   - Open `icon128.png` again
   - Resize to 48x48 → Save as `icon48.png` in same folder
   - Resize to 16x16 → Save as `icon16.png` in same folder

**✅ Done!** You now have 3 icon files in `D:\Filleasy\icons\`

### Option B: Use Online Tool (Even Faster)

1. Go to: https://www.favicon-generator.org/
2. Click "Generate Favicons"
3. Upload any square image (or create one)
4. Download the generated files
5. Rename to: `icon16.png`, `icon48.png`, `icon128.png`
6. Move to `D:\Filleasy\icons\` folder

---

## Part 2: Loading Extension in Chrome (2 minutes)

### Step 1: Open Chrome Extensions Page

1. Open Google Chrome browser
2. In the address bar, type: `chrome://extensions/`
3. Press Enter

**Alternative:** Click Menu (⋮) → More Tools → Extensions

### Step 2: Enable Developer Mode

1. Look at the top-right corner of the extensions page
2. Find the toggle switch labeled **"Developer mode"**
3. Click it to turn it **ON** (should turn blue)
4. You'll see new buttons appear below

### Step 3: Load the Extension

1. Click the **"Load unpacked"** button (appears after enabling Developer mode)
2. A file picker window will open
3. Navigate to: `D:\Filleasy`
4. **Select the Filleasy folder** (click on it once, then click "Select Folder" or "Open")
5. The extension should now appear in your extensions list!

### Step 4: Verify Installation

You should see:
- **"Filleasy - Smart Form Filler"** in the extensions list
- Status: "Enabled" with a toggle switch
- The Filleasy icon somewhere on the page

### Step 5: Pin Extension to Toolbar

1. Look at the top-right of Chrome (next to address bar)
2. Click the **Extensions icon** (puzzle piece icon 🧩)
3. Find **"Filleasy - Smart Form Filler"**
4. Click the **pin icon** (📌) next to it
5. The Filleasy icon should now appear in your toolbar!

**✅ Extension is now installed and ready!**

---

## Part 3: First-Time Setup (3 minutes)

### Step 1: Open Extension

1. Click the **Filleasy icon** in your Chrome toolbar
2. The extension popup window will open
3. You should see a setup screen (if first time)

### Step 2: Create Master Password

1. **Enter a strong password:**
   - Minimum 8 characters
   - Use mix of: uppercase, lowercase, numbers, special characters
   - Example: `MySecure123!Pass`
   
2. **Confirm password:**
   - Type the same password again

3. **Click "Create Account"**
   - If password is weak, you'll see feedback
   - Adjust password until it shows "Strong"

⚠️ **IMPORTANT:** Remember this password! It cannot be recovered if forgotten.

### Step 3: Set Up Basic Profile

1. **Click "Edit" button** in the popup (or click Settings icon ⚙️)
2. You'll be taken to the Settings/Profile page

3. **Fill in required fields:**
   - **First Name:** Your first name (required)
   - **Last Name:** Your last name (required)
   - **Email:** Your email address (required)

4. **Fill in other fields as needed:**
   - Phone number
   - Date of birth
   - Address information
   - Academic details (if you're a student)

5. **Click "Save Profile"** at the bottom
   - You'll see a success message

**✅ Profile is set up!**

---

## Part 4: Test the Extension (5 minutes)

### Step 1: Create a Test Google Form

1. Go to: https://forms.google.com
2. Sign in with your Google account
3. Click **"Blank"** to create a new form
4. Add these fields:
   - **Question 1:** "First Name" → Short answer
   - **Question 2:** "Last Name" → Short answer
   - **Question 3:** "Email" → Short answer
   - **Question 4:** "Phone Number" → Short answer
   - **Question 5:** "Date of Birth" → Date
   - **Question 6:** "Address" → Short answer
5. Click **"Send"** (top-right)
6. Click the **link icon** (🔗)
7. Copy the form link
8. Open the link in a new tab

### Step 2: Use Filleasy to Fill the Form

1. **On the Google Form page**, click the **Filleasy icon** in toolbar
2. The extension popup will open
3. You should see "Form Detected" status

4. **Option A: Preview First (Recommended)**
   - Click **"Preview & Edit"**
   - Review what fields will be filled
   - Check if values look correct
   - Click **"Fill Form"** to proceed

5. **Option B: Fill Directly**
   - Click **"Fill All Fields"**
   - Form should fill automatically!

6. **Review the form:**
   - Check all fields are filled correctly
   - Make any manual corrections if needed
   - Submit the form to test

**✅ Extension is working!**

---

## Part 5: Daily Usage

Once set up, using Filleasy is simple:

1. **Navigate to any Google Form**
   - Open the form in Chrome
   - Filleasy automatically detects it

2. **Click Filleasy icon**
   - Extension popup opens

3. **Fill the form:**
   - Click **"Fill All Fields"** for instant filling
   - OR click **"Preview & Edit"** to review first

4. **Review and submit**
   - Check filled values
   - Make corrections if needed
   - Submit the form

**That's it!** The extension handles everything else.

---

## Troubleshooting

### Icons Not Showing

**Problem:** Extension icon is missing or shows default icon

**Solution:**
1. Check `D:\Filleasy\icons\` folder has 3 PNG files
2. Verify filenames: `icon16.png`, `icon48.png`, `icon128.png` (exact, lowercase)
3. Go to `chrome://extensions/` → Find Filleasy → Click reload (⟳)

### Extension Won't Load

**Problem:** "Load unpacked" shows error

**Solution:**
1. Make sure Developer mode is enabled
2. Check you selected the correct folder (`D:\Filleasy`)
3. Open Developer Tools (click "service worker" link) → Check for errors
4. Verify `manifest.json` exists in the folder

### Master Password Issues

**Problem:** Can't unlock extension

**Solution:**
1. Check Caps Lock is off
2. Type password carefully (no extra spaces)
3. If locked: Wait 30 minutes (after 5 failed attempts)
4. If forgotten: Settings → Security → Clear All Data (⚠️ deletes everything)

### Form Not Filling

**Problem:** Fields not being filled

**Solution:**
1. Make sure you're on `forms.google.com` or `forms.gle`
2. Refresh the page
3. Click "Fill All Fields" again
4. Check your profile has data (Settings → Profile tab)
5. Use "Preview & Edit" to see what's being matched

### Extension Icon Not in Toolbar

**Problem:** Can't find Filleasy icon

**Solution:**
1. Click Extensions icon (🧩) in toolbar
2. Find "Filleasy"
3. Click pin icon (📌) next to it
4. Icon should appear in toolbar

---

## Quick Checklist

Before you start:
- [ ] Chrome browser installed (version 88+)
- [ ] Filleasy folder at `D:\Filleasy`
- [ ] All files present in folder

Icon setup:
- [ ] 3 PNG files created (16x16, 48x48, 128x128)
- [ ] Files saved in `icons/` folder
- [ ] Correct filenames (icon16.png, icon48.png, icon128.png)

Extension installation:
- [ ] Opened `chrome://extensions/`
- [ ] Enabled Developer mode
- [ ] Clicked "Load unpacked"
- [ ] Selected `D:\Filleasy` folder
- [ ] Extension appears in list
- [ ] Extension icon pinned to toolbar

Account setup:
- [ ] Master password created
- [ ] Profile information filled
- [ ] Profile saved successfully

Testing:
- [ ] Created test Google Form
- [ ] Opened form in Chrome
- [ ] Clicked Filleasy icon
- [ ] Form fields filled correctly
- [ ] Submitted test form successfully

---

## Success!

If you've completed all steps, Filleasy is now:
- ✅ Installed and running
- ✅ Configured with your profile
- ✅ Ready to fill Google Forms automatically

**Enjoy using Filleasy! 🎉**

For more information:
- See `USER_GUIDE.md` for detailed usage
- See `README.md` for features overview
- See `INSTALL.md` for advanced troubleshooting

