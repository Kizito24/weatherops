# WeatherOps Frontend - Complete Testing Guide

## Setup Instructions

### Step 1: Ensure Backend is Running
```bash
# Make sure backend is running on port 8001
make status

# If not running, start it:
make backend-start
```

### Step 2: Start Frontend Dev Server
```bash
# In a new terminal window
cd /home/kizito/Documents/weatherco/weatherops
make frontend-start

# Frontend will start on http://localhost:3000
```

### Step 3: Open in Browser
- Open browser to: **http://localhost:3000**
- Open DevTools (F12) to watch for errors
- Keep browser console visible during testing

---

## Page 1: Authentication Pages

### Test: Login Page
**URL:** http://localhost:3000 (default page)

**Visible Elements:**
- [ ] WeatherOps logo and branding
- [ ] "Sign in to access event-driven weather intelligence." subtitle
- [ ] Email input field
- [ ] Password input field
- [ ] "Access Dashboard Console" button
- [ ] "Forgot key?" link
- [ ] "Create Account" link at bottom
- [ ] Dark/Light mode indicator (top right)

**Test Cases:**

#### TC1: Invalid Credentials
1. Enter email: `invalid@test.com`
2. Enter password: `WrongPass123`
3. Click "Access Dashboard Console"
4. **Expected:** Error message "Invalid email or password"

#### TC2: Missing Email
1. Leave email empty
2. Enter password: `TestPass123`
3. Click "Access Dashboard Console"
4. **Expected:** Form validation error "Email is required"

#### TC3: Missing Password
1. Enter email: `test@weatherops.com`
2. Leave password empty
3. Click "Access Dashboard Console"
4. **Expected:** Form validation error "Password is required"

#### TC4: Successful Login
1. Enter email: `test@weatherops.com`
2. Enter password: `TestPass123`
3. Click "Access Dashboard Console"
4. **Expected:** 
   - Loading spinner appears
   - Redirects to Overview page
   - User stays logged in on refresh

#### TC5: Switch to Register
1. Click "Create Account" link
2. **Expected:** Page switches to registration form

---

### Test: Registration Page
**URL:** http://localhost:3000#register (or click Create Account)

**Visible Elements:**
- [ ] "Register your organization command center control node." subtitle
- [ ] Full Operational Name input
- [ ] Control Email Address input
- [ ] Encryption Password input
- [ ] "Initialize Command Center" button
- [ ] "Sign In" link at bottom
- [ ] Form validation messages

**Test Cases:**

#### TC6: Registration - Missing Name
1. Leave "Full Operational Name" empty
2. Enter email: `newuser@test.com`
3. Enter password: `NewPass123`
4. Click "Initialize Command Center"
5. **Expected:** Validation error for name field

#### TC7: Registration - Invalid Email
1. Enter name: `Test User`
2. Enter email: `not-an-email`
3. Enter password: `NewPass123`
4. Click "Initialize Command Center"
5. **Expected:** Email validation error

#### TC8: Registration - Short Password
1. Enter name: `Test User`
2. Enter email: `newuser@test.com`
3. Enter password: `Pass123` (only 7 chars)
4. Click "Initialize Command Center"
5. **Expected:** Error "Password must be at least 8 characters"

#### TC9: Registration - Duplicate Email
1. Enter name: `Test User`
2. Enter email: `test@weatherops.com` (existing user)
3. Enter password: `NewPass123`
4. Click "Initialize Command Center"
5. **Expected:** Error "User with email already exists"

#### TC10: Successful Registration
1. Enter name: `New Test User`
2. Enter email: `newuser123@test.com` (unique)
3. Enter password: `NewPass123`
4. Click "Initialize Command Center"
5. **Expected:**
   - No error message
   - Redirected to Overview/Dashboard
   - User logged in automatically
   - New user appears in database

#### TC11: Switch to Login
1. Click "Sign In" link
2. **Expected:** Page switches back to login form

---

## Page 2: Overview/Dashboard Page
**URL:** http://localhost:3000#overview (after login)

**Visible Elements:**
- [ ] Sidebar (left navigation)
- [ ] Top navbar
- [ ] Page title "Overview"
- [ ] KPI cards (metrics display)
- [ ] Weather data display
- [ ] Alerts summary
- [ ] Dark mode toggle (top right)

### Test: Sidebar Navigation
**Elements:**
- [ ] Logo/Home button
- [ ] Overview (selected)
- [ ] Locations link
- [ ] Rules link
- [ ] Alerts link
- [ ] Settings link
- [ ] Collapse/Expand button (hamburger icon)
- [ ] Logout button

**Test Cases:**

#### TC12: Collapse Sidebar
1. Click hamburger/collapse icon
2. **Expected:** Sidebar collapses to icon-only view

#### TC13: Expand Sidebar
1. Click hamburger icon again
2. **Expected:** Sidebar expands back to full width

#### TC14: Navigate to Locations
1. Click "Locations" in sidebar
2. **Expected:** Page changes to Locations page

#### TC15: Navigate to Rules
1. Click "Rules" in sidebar
2. **Expected:** Page changes to Rules page

#### TC16: Navigate to Alerts
1. Click "Alerts" in sidebar
2. **Expected:** Page changes to Alerts page

#### TC17: Navigate to Settings
1. Click "Settings" in sidebar
2. **Expected:** Page changes to Settings page

#### TC18: Navigate back to Overview
1. Click "Overview" in sidebar
2. **Expected:** Returns to Overview page

#### TC19: Logout
1. Click "Logout" button (bottom of sidebar)
2. **Expected:**
   - All tokens cleared from localStorage
   - Redirected to login page
   - Cannot access protected pages without re-login

### Test: Top Navbar
**Elements:**
- [ ] Logo/brand name
- [ ] Current page indicator
- [ ] User profile section
- [ ] Dark mode toggle button
- [ ] Notification bell (if present)

**Test Cases:**

#### TC20: Dark Mode Toggle
1. Click dark/light mode icon in navbar
2. **Expected:** 
   - Theme switches to opposite
   - All colors invert appropriately
   - Setting persists on page reload

#### TC21: Light Mode Toggle
1. With dark mode on, click toggle again
2. **Expected:**
   - Theme switches back to light
   - All elements readable
   - Setting persists on page reload

#### TC22: User Profile Dropdown
1. Click user profile section
2. **Expected:** Dropdown menu appears (if implemented)

---

## Page 3: Locations Page
**URL:** http://localhost:3000#locations

**Visible Elements:**
- [ ] Page title "Locations"
- [ ] "Add Location" button
- [ ] Locations list/table
- [ ] Search/filter (if present)
- [ ] Location cards or rows showing:
  - [ ] Location name
  - [ ] Latitude/Longitude
  - [ ] Edit button
  - [ ] Delete button
- [ ] Pagination (if many locations)

**Test Cases:**

#### TC23: Add Location - Open Modal
1. Click "Add Location" button
2. **Expected:** Modal/form opens for creating new location

#### TC24: Add Location - Missing Name
1. Open Add Location modal
2. Leave "Location Name" empty
3. Enter latitude: `40.7128`
4. Enter longitude: `-74.0060`
5. Click "Create" or "Save"
6. **Expected:** Validation error for name

#### TC25: Add Location - Invalid Coordinates
1. Open Add Location modal
2. Enter name: `New York`
3. Enter latitude: `invalid`
4. Enter longitude: `-74.0060`
5. Click "Create" or "Save"
6. **Expected:** Validation error for latitude

#### TC26: Add Location - Successful
1. Open Add Location modal
2. Enter name: `Test City`
3. Enter latitude: `40.7128`
4. Enter longitude: `-74.0060`
5. Click "Create" or "Save"
6. **Expected:**
   - Modal closes
   - New location appears in list
   - Success notification shown

#### TC27: Edit Location
1. Click edit button on any location
2. Change location name
3. Click "Save" or "Update"
4. **Expected:**
   - Modal closes
   - Location updated in list
   - Changes persist on reload

#### TC28: Delete Location
1. Click delete button on any location
2. **Expected:** 
   - Confirmation dialog appears OR
   - Location deleted immediately with undo option

#### TC29: Delete with Confirmation
1. Click delete on a location
2. If confirmation appears, click "Delete" to confirm
3. **Expected:** Location removed from list

#### TC30: View Location Details
1. Click on a location name/card
2. **Expected:** Location details view or edit form opens

#### TC31: Cancel Adding Location
1. Click "Add Location"
2. Click "Cancel" or close button
3. **Expected:** Modal closes without saving

---

## Page 4: Rules Page
**URL:** http://localhost:3000#rules

**Visible Elements:**
- [ ] Page title "Rules"
- [ ] "Add Rule" button
- [ ] Rules list/table
- [ ] Filter by location (dropdown)
- [ ] Rules showing:
  - [ ] Metric (Temperature, Rainfall, Wind Speed, etc.)
  - [ ] Operator (>, <, ==, >=, <=, !=)
  - [ ] Threshold value
  - [ ] Status (Active/Inactive)
  - [ ] Edit button
  - [ ] Delete button
  - [ ] Toggle Enable/Disable
- [ ] Pagination (if many rules)

**Test Cases:**

#### TC32: Add Rule - No Locations
1. If no locations exist, try "Add Rule"
2. **Expected:** Either error "Create a location first" OR
   - Location dropdown empty but form accessible

#### TC33: Create Location First
1. Go to Locations page
2. Create a location: `Test City` at `40.7128, -74.0060`
3. Return to Rules page
4. Click "Add Rule"
5. **Expected:** Modal opens with location selector

#### TC34: Add Rule - Complete Form
1. Click "Add Rule"
2. Select location: `Test City`
3. Select metric: `Temperature`
4. Select operator: `>`
5. Enter threshold: `30`
6. Click "Create" or "Save"
7. **Expected:**
   - Modal closes
   - New rule appears in list
   - Rule is marked as Active

#### TC35: Edit Rule
1. Click edit button on a rule
2. Change threshold value
3. Click "Save" or "Update"
4. **Expected:** Rule updated in list

#### TC36: Toggle Rule Active/Inactive
1. Find an active rule
2. Click status toggle or checkbox
3. **Expected:** Rule marked as Inactive

#### TC37: Toggle Back to Active
1. Find an inactive rule
2. Click status toggle
3. **Expected:** Rule marked as Active

#### TC38: Delete Rule
1. Click delete button on a rule
2. Confirm deletion if prompted
3. **Expected:** Rule removed from list

#### TC39: Filter Rules by Location
1. If multiple locations exist, use location filter
2. Select a specific location
3. **Expected:** List shows only rules for that location

#### TC40: Clear Location Filter
1. With a location filter applied, click "All" or clear filter
2. **Expected:** List shows all rules again

#### TC41: Search/Filter Rules
1. If search is available, enter a metric name
2. **Expected:** Rules filtered by search term

---

## Page 5: Alerts Page
**URL:** http://localhost:3000#alerts

**Visible Elements:**
- [ ] Page title "Alerts"
- [ ] Alert list/table showing:
  - [ ] Severity badge (LOW, MEDIUM, HIGH)
  - [ ] Metric name
  - [ ] Location
  - [ ] Actual value
  - [ ] Threshold
  - [ ] Status (Active/Resolved)
  - [ ] Timestamp
  - [ ] Resolve button (if active)
  - [ ] Details button
- [ ] Severity filter (Low/Medium/High)
- [ ] Status filter (Active/Resolved)
- [ ] Pagination

**Test Cases:**

#### TC42: View Alerts List
1. Go to Alerts page
2. **Expected:** List shows any triggered alerts

#### TC43: Filter by Severity - Low
1. Click "Low" filter
2. **Expected:** Shows only LOW severity alerts

#### TC44: Filter by Severity - Medium
1. Click "Medium" filter
2. **Expected:** Shows only MEDIUM severity alerts

#### TC45: Filter by Severity - High
1. Click "High" filter
2. **Expected:** Shows only HIGH severity alerts

#### TC46: Clear Severity Filter
1. With filter applied, click "All" or clear button
2. **Expected:** Shows all alerts again

#### TC47: Filter by Status - Active
1. Click "Active" status filter
2. **Expected:** Shows only unresolved alerts

#### TC48: Filter by Status - Resolved
1. Click "Resolved" status filter
2. **Expected:** Shows only resolved alerts

#### TC49: Resolve Alert
1. Find an active alert
2. Click "Resolve" button
3. **Expected:**
   - Alert status changes to Resolved
   - Alert may move to resolved section

#### TC50: View Alert Details
1. Click alert row or "Details" button
2. **Expected:** Modal or details view shows:
   - Full alert information
   - Weather snapshot
   - Rule details
   - Close button

#### TC51: Simulate Alert Trigger (if available)
1. Look for "Simulate" or "Test" button
2. Click it
3. **Expected:** Test alert is created and appears in list

---

## Page 6: Settings Page
**URL:** http://localhost:3000#settings

**Visible Elements:**
- [ ] Page title "Settings"
- [ ] User profile section
- [ ] API Key display/generate
- [ ] Notification preferences
- [ ] Save/Update button
- [ ] Danger zone section (if present)

**Test Cases:**

#### TC52: View User Profile
1. Go to Settings page
2. **Expected:** User email and profile info displayed

#### TC53: Update Notification Settings
1. Find notification checkboxes
2. Toggle "Email alerts"
3. Click "Save" or "Update"
4. **Expected:** Setting saved

#### TC54: Update SMS Notifications
1. Toggle "SMS alerts"
2. Enter phone number: `+1234567890`
3. Click "Save"
4. **Expected:** Setting saved or error if invalid

#### TC55: View API Key
1. Look for API Key section
2. **Expected:** Shows masked/hidden API key with:
   - [ ] Copy button
   - [ ] Show/Hide button
   - [ ] Regenerate button

#### TC56: Copy API Key
1. Click Copy button next to API key
2. **Expected:** Key copied to clipboard (notification shown)

#### TC57: Generate New API Key
1. Click "Generate New Key" or similar
2. If confirmation appears, confirm
3. **Expected:** New key generated and displayed

#### TC58: Logout from Settings
1. Scroll to bottom (if logout is here)
2. Click "Logout" button
3. **Expected:** Redirects to login page

---

## Global Features Testing

### Test: Dark Mode Persistence
#### TC59: Dark Mode Across Pages
1. Enable dark mode
2. Navigate between different pages
3. **Expected:** Dark mode stays active on all pages

#### TC60: Dark Mode Persists on Reload
1. Enable dark mode
2. Refresh the page (Ctrl+R)
3. **Expected:** Dark mode still active after reload

#### TC61: Light Mode Across Pages
1. Disable dark mode
2. Navigate to multiple pages
3. **Expected:** Light mode stays active on all pages

### Test: Navigation with URL Hash
#### TC62: Direct URL Access
1. In address bar, change URL to: `http://localhost:3000#locations`
2. Press Enter
3. **Expected:** Locations page loads directly

#### TC63: Direct URL - Alerts
1. In address bar, go to: `http://localhost:3000#alerts`
2. **Expected:** Alerts page loads directly

#### TC64: Direct URL - Settings
1. In address bar, go to: `http://localhost:3000#settings`
2. **Expected:** Settings page loads directly

### Test: Token & Session Management
#### TC65: Page Reload Stays Logged In
1. Login successfully
2. Go to any page
3. Refresh the page (F5)
4. **Expected:** Still logged in, page loads

#### TC66: Multiple Tab Session
1. Login in one tab
2. Open a new tab to `http://localhost:3000`
3. **Expected:** New tab shows login page OR same session (depends on implementation)

#### TC67: Logout Session
1. Login successfully
2. Click Logout
3. Try to access a page URL like `#overview`
4. **Expected:** Redirected to login page

### Test: Error Handling
#### TC68: API Error - Network Down
1. Disconnect from network (or turn off backend)
2. Try to navigate to a data page
3. **Expected:** Error message or empty state shown

#### TC69: Form Error Display
1. Try to create something with invalid data
2. **Expected:** Error message appears on form

#### TC70: Toast Notifications
1. Perform successful action (create, update, delete)
2. **Expected:** Toast notification appears with success message

---

## Browser Console Testing

### While on any page, open DevTools (F12) and check:

#### TC71: Console Errors
- [ ] No red error messages
- [ ] No warning messages (unless expected)
- [ ] API calls show in Network tab

#### TC72: Network Requests
1. Open Network tab
2. Perform an action (login, create location, etc.)
3. **Expected:**
   - Requests complete successfully
   - Status codes are 200/201 (success)
   - No 401/403 (auth errors)
   - No 500 (server errors)

#### TC73: LocalStorage Check
1. Open Application/Storage tab
2. Check LocalStorage
3. **Expected:**
   - `weatherops_access_token` present (when logged in)
   - `weatherops_refresh_token` present (when logged in)
   - `weatherops_theme` shows current theme
   - Tokens are cleared after logout

#### TC74: Token in Network Requests
1. In Network tab, filter by XHR/Fetch
2. Click on a request
3. Go to Headers
4. **Expected:** 
   - Authorization header shows: `Bearer [token]`
   - Content-Type is `application/json`

---

## Performance Testing

#### TC75: Page Load Time
1. Note time when clicking a link
2. Measure time until page fully loads
3. **Expected:** < 3 seconds

#### TC76: Form Submission Time
1. Fill out a form (create location, rule, etc.)
2. Click submit
3. **Expected:** Response < 2 seconds

#### TC77: List Load Time
1. Go to locations/rules/alerts page
2. **Expected:** Data loads within 2 seconds

---

## Responsive Design Testing

#### TC78: Mobile View (320px)
1. Open DevTools (F12)
2. Click device toolbar icon
3. Select iPhone SE or similar (320px width)
4. **Expected:**
   - All elements visible and usable
   - No horizontal scrolling
   - Buttons easily clickable
   - Text readable

#### TC79: Tablet View (768px)
1. Select iPad or similar (768px width)
2. **Expected:**
   - Layout adjusts for tablet
   - Content readable
   - Navigation accessible

#### TC80: Desktop View (1440px)
1. Resize to full desktop width
2. **Expected:**
   - Optimal layout at desktop size
   - Sidebar visible by default
   - Comfortable spacing

---

## Test Result Summary

### Create a checklist as you go:

**Authentication:**
- [ ] Login works
- [ ] Registration works
- [ ] Logout works
- [ ] Session persists on reload

**Navigation:**
- [ ] All pages accessible
- [ ] Sidebar navigation works
- [ ] URL hash routing works

**Locations:**
- [ ] Can view locations
- [ ] Can add location
- [ ] Can edit location
- [ ] Can delete location

**Rules:**
- [ ] Can view rules
- [ ] Can add rule
- [ ] Can edit rule
- [ ] Can delete rule
- [ ] Can toggle active/inactive

**Alerts:**
- [ ] Can view alerts
- [ ] Can filter by severity
- [ ] Can filter by status
- [ ] Can resolve alerts

**Settings:**
- [ ] Can view settings
- [ ] Can update preferences
- [ ] Can copy API key

**UI/UX:**
- [ ] Dark mode works
- [ ] Light mode works
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop

**Performance:**
- [ ] Pages load quickly
- [ ] Forms submit quickly
- [ ] No console errors

---

## Notes While Testing

Keep a notepad handy to record:
1. **Working Features:**
   - What buttons/features work perfectly

2. **Issues Found:**
   - Button doesn't respond
   - Error message confusing
   - UI breaks on certain screen sizes
   - Slow load times

3. **Unexpected Behavior:**
   - Different from expected result
   - Feature not implemented yet

4. **Edge Cases:**
   - What happens when data is empty
   - What happens with special characters in forms
   - What happens when you spam clicking buttons

---

## How to Report Issues

When you find a problem, note:
1. **Page:** Which page (Locations, Rules, etc.)
2. **Test Case:** Which test case (TC23, TC45, etc.)
3. **Steps:** Exact steps to reproduce
4. **Expected:** What should happen
5. **Actual:** What actually happened
6. **Screenshot:** If possible, capture the screen
7. **Console Error:** Any error message from DevTools

Good luck with testing! 🚀
