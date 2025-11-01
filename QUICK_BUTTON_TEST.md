# Quick Button Test Guide

## ⚠️ IMPORTANT: Use the Server

**DO NOT** open `index.html` directly via `file://` protocol.  
**DO** access the app via `http://localhost:4000` (after running `npm start`)

## 🚀 Quick Test Steps

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open the app in your browser:**
   ```
   http://localhost:4000
   ```

3. **Login as admin:**
   - Username: `admin`
   - Password: `admin123`

4. **Navigate to a page with buttons:**
   - Go to "Supervisors" page
   - Or "Team Leaders" page
   - Or "Staff" page

5. **Open browser console:**
   - Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Click on the "Console" tab

6. **Run the test:**
   - Copy all contents from `test-buttons-direct.js`
   - Paste into the console
   - Press `Enter`

7. **Check results:**
   - Green ✅ = Working
   - Red ❌ = Issue found

## 🧪 Manual Button Test

In the browser console, try these commands:

```javascript
// Test Add Supervisor button
window.app?.showAddSupervisorModal();

// Test Add Team Leader button
window.app?.showAddTeamLeaderModal();

// Test Add Staff button
window.app?.showAddStaffModal();

// Test Add Inventory Controller button
window.app?.showAddInventoryControllerModal();
```

If the modals open, the buttons are working! ✅

## 🔍 Check Button Existence

```javascript
// Check if buttons exist
console.log('Add Supervisor:', document.getElementById('add-supervisor-btn'));
console.log('Add Team Leader:', document.getElementById('add-teamleader-btn'));
console.log('Add Staff:', document.getElementById('add-staff-btn'));
console.log('Add Inventory Controller:', document.getElementById('add-inventorycontroller-btn'));

// Check if functions exist
console.log('showAddSupervisorModal:', typeof window.app?.showAddSupervisorModal);
console.log('showAddTeamLeaderModal:', typeof window.app?.showAddTeamLeaderModal);
console.log('showAddStaffModal:', typeof window.app?.showAddStaffModal);
console.log('showAddInventoryControllerModal:', typeof window.app?.showAddInventoryControllerModal);
```

## ❌ Common Issues

1. **CORS errors:** You're accessing via `file://` - use `http://localhost:4000` instead
2. **App object not found:** Make sure you're logged in
3. **Buttons not found:** Make sure you're on the correct page
4. **Functions not found:** Check browser console for JavaScript errors

## 📝 Test Results

After running the test, you'll see:
- ✅ Passed tests count
- ❌ Failed tests count
- ⚠️ Errors and suggestions

