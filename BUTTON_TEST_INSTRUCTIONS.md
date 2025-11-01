# Button Test Instructions

## Quick Test Script

I've created a simple test script to check if all buttons are working. Here's how to use it:

### Method 1: Browser Console (Recommended)

1. **Open the application** in your browser (http://localhost:4000)
2. **Login** as admin
3. **Open browser console**:
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - Safari: Press `Cmd+Option+C` (Mac)
4. **Go to the Console tab**
5. **Copy and paste** the entire contents of `test-buttons-simple.js` into the console
6. **Press Enter**
7. **Check the results** - it will show which buttons exist, which functions are available, and test clicking

### Method 2: HTML Test Page

1. **Open** `test-buttons.html` in your browser
2. **Click "Run Tests"** button
3. **View the results** in the results panel

### Method 3: Direct Function Testing

In the browser console, try these commands manually:

```javascript
// Test if functions exist
console.log('showAddSupervisorModal:', typeof window.app?.showAddSupervisorModal);
console.log('showAddTeamLeaderModal:', typeof window.app?.showAddTeamLeaderModal);
console.log('showAddStaffModal:', typeof window.app?.showAddStaffModal);
console.log('showAddInventoryControllerModal:', typeof window.app?.showAddInventoryControllerModal);

// Test if buttons exist
console.log('Add Supervisor button:', document.getElementById('add-supervisor-btn'));
console.log('Add Team Leader button:', document.getElementById('add-teamleader-btn'));
console.log('Add Staff button:', document.getElementById('add-staff-btn'));
console.log('Add Inventory Controller button:', document.getElementById('add-inventorycontroller-btn'));

// Try calling the functions directly
window.app?.showAddSupervisorModal();
window.app?.showAddTeamLeaderModal();
window.app?.showAddStaffModal();
window.app?.showAddInventoryControllerModal();
```

### What to Check

The test script will check:
- ✅ Button existence in DOM
- ✅ Button visibility
- ✅ Click handlers attached
- ✅ Modal functions exist
- ✅ Modals exist in DOM
- ✅ Button clicks open modals

### Common Issues

1. **Buttons not found**: Make sure you're on the correct page (Supervisors, Team Leaders, etc.)
2. **Functions not found**: Make sure you're logged in and the app object is initialized
3. **Modals not opening**: Check if there are JavaScript errors in the console

### Next Steps

If tests fail:
1. Check browser console for JavaScript errors
2. Verify you're logged in
3. Verify you're on the correct page
4. Try refreshing the page
5. Report specific errors found

