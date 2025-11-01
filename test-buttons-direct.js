/**
 * Direct Button Test Script
 * Run this directly in the browser console on the application page
 * 
 * IMPORTANT: Make sure you're accessing the app via http://localhost:4000
 * NOT via file:// protocol
 * 
 * Usage:
 * 1. Open http://localhost:4000 in your browser
 * 2. Login as admin
 * 3. Navigate to Supervisors/Team Leaders/Staff page
 * 4. Open browser console (F12)
 * 5. Copy and paste this entire script
 * 6. Press Enter
 */

(function() {
    console.log('%c🧪 Starting Button Functionality Tests...', 'font-size: 16px; font-weight: bold; color: #6366f1;');
    console.log('');
    
    const results = { passed: 0, failed: 0, errors: [] };
    
    function test(name, condition, errorMsg) {
        if (condition) {
            console.log('%c✅ ' + name, 'color: #10b981;');
            results.passed++;
        } else {
            console.error('%c❌ ' + name + ': ' + errorMsg, 'color: #ef4444;');
            results.failed++;
            results.errors.push(`${name}: ${errorMsg}`);
        }
    }
    
    // Check if running on server
    if (window.location.protocol === 'file:') {
        console.error('%c❌ ERROR: You are accessing the app via file:// protocol', 'color: #ef4444; font-weight: bold;');
        console.error('%cPlease use http://localhost:4000 instead', 'color: #ef4444;');
        console.error('%cStart the server with: npm start', 'color: #f59e0b;');
        return;
    }
    
    // Check if app object exists
    if (typeof window.app === 'undefined') {
        console.error('%c❌ ERROR: App object not found', 'color: #ef4444; font-weight: bold;');
        console.error('%cMake sure you are logged in and on the application page', 'color: #ef4444;');
        return;
    }
    
    console.log('%c✅ App object found', 'color: #10b981;');
    console.log('');
    
    // Test Add buttons
    console.log('%c📋 Testing Add Buttons:', 'font-weight: bold; color: #6366f1;');
    console.log('');
    
    const addSupervisorBtn = document.getElementById('add-supervisor-btn');
    test('Add Supervisor button exists', addSupervisorBtn !== null, 'Button not found in DOM');
    
    if (addSupervisorBtn) {
        const isVisible = addSupervisorBtn.offsetParent !== null && 
                         window.getComputedStyle(addSupervisorBtn).display !== 'none';
        test('Add Supervisor button is visible', isVisible, 'Button exists but is hidden');
        
        // Test if function exists
        test('showAddSupervisorModal function exists', 
            typeof window.app.showAddSupervisorModal === 'function',
            'Function not found');
        
        // Test clicking the button
        try {
            console.log('%c  ⏳ Testing click...', 'color: #3b82f6;');
            const modal = document.getElementById('add-supervisor-modal');
            const wasHidden = modal && (modal.style.display === 'none' || 
                                       window.getComputedStyle(modal).display === 'none');
            
            // Click the button
            addSupervisorBtn.click();
            
            setTimeout(() => {
                if (modal) {
                    const isVisible = modal.style.display !== 'none' && 
                                     window.getComputedStyle(modal).display !== 'none';
                    test('Add Supervisor button opens modal', isVisible || modal.classList.contains('active'), 
                         'Modal did not open after click');
                    
                    // Close modal if it opened
                    if (isVisible || modal.classList.contains('active')) {
                        window.app?.hideModals();
                    }
                }
                continueTests();
            }, 300);
            return; // Exit early to wait for async test
        } catch (e) {
            test('Add Supervisor click handler', false, `Error: ${e.message}`);
            continueTests();
        }
    } else {
        continueTests();
    }
    
    function continueTests() {
        const addTeamLeaderBtn = document.getElementById('add-teamleader-btn');
        test('Add Team Leader button exists', addTeamLeaderBtn !== null, 'Button not found');
        
        if (addTeamLeaderBtn) {
            test('showAddTeamLeaderModal function exists',
                typeof window.app.showAddTeamLeaderModal === 'function',
                'Function not found');
        }
        
        const addStaffBtn = document.getElementById('add-staff-btn');
        test('Add Staff button exists', addStaffBtn !== null, 'Button not found');
        
        if (addStaffBtn) {
            test('showAddStaffModal function exists',
                typeof window.app.showAddStaffModal === 'function',
                'Function not found');
        }
        
        const addInventoryControllerBtn = document.getElementById('add-inventorycontroller-btn');
        test('Add Inventory Controller button exists', addInventoryControllerBtn !== null, 'Button not found');
        
        if (addInventoryControllerBtn) {
            test('showAddInventoryControllerModal function exists',
                typeof window.app.showAddInventoryControllerModal === 'function',
                'Function not found');
        }
        
        // Test Save buttons
        console.log('');
        console.log('%c📋 Testing Save Buttons:', 'font-weight: bold; color: #6366f1;');
        console.log('');
        
        const saveSupervisorBtn = document.getElementById('save-supervisor');
        test('Save Supervisor button exists', saveSupervisorBtn !== null, 'Button not found');
        
        const saveTeamLeaderBtn = document.getElementById('save-teamleader');
        test('Save Team Leader button exists', saveTeamLeaderBtn !== null, 'Button not found');
        
        const saveStaffBtn = document.getElementById('save-staff');
        test('Save Staff button exists', saveStaffBtn !== null, 'Button not found');
        
        const saveInventoryControllerBtn = document.getElementById('save-inventorycontroller');
        test('Save Inventory Controller button exists', saveInventoryControllerBtn !== null, 'Button not found');
        
        // Test Update buttons
        console.log('');
        console.log('%c📋 Testing Update Buttons:', 'font-weight: bold; color: #6366f1;');
        console.log('');
        
        const updateJobBtn = document.getElementById('update-job');
        test('Update Job button exists', updateJobBtn !== null, 'Button not found');
        
        const updateSupervisorBtn = document.getElementById('update-supervisor');
        test('Update Supervisor button exists', updateSupervisorBtn !== null, 'Button not found');
        
        const updateTeamLeaderBtn = document.getElementById('update-teamleader');
        test('Update Team Leader button exists', updateTeamLeaderBtn !== null, 'Button not found');
        
        const updateStaffBtn = document.getElementById('update-staff');
        test('Update Staff button exists', updateStaffBtn !== null, 'Button not found');
        
        // Test Modal functions
        console.log('');
        console.log('%c📋 Testing Modal Functions:', 'font-weight: bold; color: #6366f1;');
        console.log('');
        
        const app = window.app;
        test('showModal function exists', typeof app.showModal === 'function', 'Function not found');
        test('hideModals function exists', typeof app.hideModals === 'function', 'Function not found');
        
        // Test Modals exist
        console.log('');
        console.log('%c📋 Testing Modals:', 'font-weight: bold; color: #6366f1;');
        console.log('');
        
        const addSupervisorModal = document.getElementById('add-supervisor-modal');
        test('Add Supervisor modal exists', addSupervisorModal !== null, 'Modal not found');
        
        const addTeamLeaderModal = document.getElementById('add-teamleader-modal');
        test('Add Team Leader modal exists', addTeamLeaderModal !== null, 'Modal not found');
        
        const addStaffModal = document.getElementById('add-staff-modal');
        test('Add Staff modal exists', addStaffModal !== null, 'Modal not found');
        
        const addInventoryControllerModal = document.getElementById('add-inventorycontroller-modal');
        test('Add Inventory Controller modal exists', addInventoryControllerModal !== null, 'Modal not found');
        
        // Test direct function calls
        console.log('');
        console.log('%c🔘 Testing Direct Function Calls:', 'font-weight: bold; color: #6366f1;');
        console.log('');
        
        try {
            window.app.showAddSupervisorModal();
            setTimeout(() => {
                const modalOpen = addSupervisorModal && 
                    (addSupervisorModal.style.display !== 'none' || 
                     addSupervisorModal.classList.contains('active'));
                test('showAddSupervisorModal() opens modal', modalOpen, 'Modal did not open');
                
                if (modalOpen) {
                    window.app.hideModals();
                }
                
                printSummary();
            }, 300);
        } catch (e) {
            test('Direct function call', false, `Error: ${e.message}`);
            printSummary();
        }
    }
    
    function printSummary() {
        console.log('');
        console.log('%c' + '='.repeat(60), 'color: #6366f1;');
        console.log('%c📊 Test Summary:', 'font-weight: bold; color: #6366f1;');
        console.log('%c✅ Passed: ' + results.passed, 'color: #10b981;');
        console.log('%c❌ Failed: ' + results.failed, results.failed > 0 ? 'color: #ef4444;' : 'color: #10b981;');
        console.log('%c' + '='.repeat(60), 'color: #6366f1;');
        
        if (results.errors.length > 0) {
            console.log('');
            console.log('%c⚠️ Errors Found:', 'font-weight: bold; color: #f59e0b;');
            results.errors.forEach(err => console.error('%c  - ' + err, 'color: #ef4444;'));
        }
        
        if (results.failed === 0) {
            console.log('');
            console.log('%c🎉 All tests passed! Buttons should be working correctly.', 'font-weight: bold; color: #10b981;');
        } else {
            console.log('');
            console.log('%c⚠️ ' + results.failed + ' test(s) failed.', 'font-weight: bold; color: #ef4444;');
            console.log('');
            console.log('%c💡 Suggestions:', 'font-weight: bold; color: #3b82f6;');
            console.log('%c  - Make sure you are logged in', 'color: #64748b;');
            console.log('%c  - Make sure you are on the correct page (Supervisors, Team Leaders, etc.)', 'color: #64748b;');
            console.log('%c  - Check browser console for JavaScript errors', 'color: #64748b;');
            console.log('%c  - Try refreshing the page', 'color: #64748b;');
            console.log('%c  - Make sure server is running (npm start)', 'color: #64748b;');
        }
    }
})();

