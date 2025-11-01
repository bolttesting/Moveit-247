/**
 * Simple Button Test Script
 * Run this in the browser console on the application page
 * 
 * Usage: Copy and paste this entire script into the browser console
 */

(function() {
    console.log('🧪 Starting Button Functionality Tests...\n');
    
    const results = { passed: 0, failed: 0, errors: [] };
    
    function test(name, condition, errorMsg) {
        if (condition) {
            console.log(`✅ ${name}`);
            results.passed++;
        } else {
            console.error(`❌ ${name}: ${errorMsg}`);
            results.failed++;
            results.errors.push(`${name}: ${errorMsg}`);
        }
    }
    
    // Wait for app to be ready
    function runTests() {
        console.log('🔍 Checking buttons and functions...\n');
        
        // Check if app object exists
        test('App object exists', typeof window.app !== 'undefined', 'App object not found');
        
        if (typeof window.app === 'undefined') {
            console.error('❌ Cannot run tests - app object not found. Make sure you are on the application page.');
            return;
        }
        
        // Test Add buttons
        console.log('\n📋 Testing Add Buttons:');
        const addSupervisorBtn = document.getElementById('add-supervisor-btn');
        test('Add Supervisor button exists', addSupervisorBtn !== null, 'Button not found in DOM');
        
        if (addSupervisorBtn) {
            const isVisible = addSupervisorBtn.offsetParent !== null && 
                             window.getComputedStyle(addSupervisorBtn).display !== 'none';
            test('Add Supervisor button is visible', isVisible, 'Button exists but is hidden');
            
            // Check for click handler
            const hasHandler = addSupervisorBtn.onclick !== null || 
                             addSupervisorBtn.getAttribute('onclick') !== null ||
                             window.app.showAddSupervisorModal !== undefined;
            test('Add Supervisor has click handler', hasHandler, 'No click handler attached');
            
            // Test function exists
            test('showAddSupervisorModal function exists', 
                typeof window.app.showAddSupervisorModal === 'function',
                'Function not found');
        }
        
        const addTeamLeaderBtn = document.getElementById('add-teamleader-btn');
        test('Add Team Leader button exists', addTeamLeaderBtn !== null, 'Button not found');
        
        const addStaffBtn = document.getElementById('add-staff-btn');
        test('Add Staff button exists', addStaffBtn !== null, 'Button not found');
        
        const addInventoryControllerBtn = document.getElementById('add-inventorycontroller-btn');
        test('Add Inventory Controller button exists', addInventoryControllerBtn !== null, 'Button not found');
        
        // Test Save buttons
        console.log('\n📋 Testing Save Buttons:');
        const saveSupervisorBtn = document.getElementById('save-supervisor');
        test('Save Supervisor button exists', saveSupervisorBtn !== null, 'Button not found');
        
        const saveTeamLeaderBtn = document.getElementById('save-teamleader');
        test('Save Team Leader button exists', saveTeamLeaderBtn !== null, 'Button not found');
        
        const saveStaffBtn = document.getElementById('save-staff');
        test('Save Staff button exists', saveStaffBtn !== null, 'Button not found');
        
        const saveInventoryControllerBtn = document.getElementById('save-inventorycontroller');
        test('Save Inventory Controller button exists', saveInventoryControllerBtn !== null, 'Button not found');
        
        // Test Update buttons
        console.log('\n📋 Testing Update Buttons:');
        const updateJobBtn = document.getElementById('update-job');
        test('Update Job button exists', updateJobBtn !== null, 'Button not found');
        
        const updateSupervisorBtn = document.getElementById('update-supervisor');
        test('Update Supervisor button exists', updateSupervisorBtn !== null, 'Button not found');
        
        const updateTeamLeaderBtn = document.getElementById('update-teamleader');
        test('Update Team Leader button exists', updateTeamLeaderBtn !== null, 'Button not found');
        
        const updateStaffBtn = document.getElementById('update-staff');
        test('Update Staff button exists', updateStaffBtn !== null, 'Button not found');
        
        // Test Modal functions
        console.log('\n📋 Testing Modal Functions:');
        const app = window.app;
        if (app) {
            test('showAddSupervisorModal exists', 
                typeof app.showAddSupervisorModal === 'function',
                'Function not found');
            
            test('showAddTeamLeaderModal exists',
                typeof app.showAddTeamLeaderModal === 'function',
                'Function not found');
            
            test('showAddStaffModal exists',
                typeof app.showAddStaffModal === 'function',
                'Function not found');
            
            test('showAddInventoryControllerModal exists',
                typeof app.showAddInventoryControllerModal === 'function',
                'Function not found');
            
            test('showModal function exists',
                typeof app.showModal === 'function',
                'showModal function not found');
        }
        
        // Test Modals exist
        console.log('\n📋 Testing Modals:');
        const addSupervisorModal = document.getElementById('add-supervisor-modal');
        test('Add Supervisor modal exists', addSupervisorModal !== null, 'Modal not found');
        
        const addTeamLeaderModal = document.getElementById('add-teamleader-modal');
        test('Add Team Leader modal exists', addTeamLeaderModal !== null, 'Modal not found');
        
        const addStaffModal = document.getElementById('add-staff-modal');
        test('Add Staff modal exists', addStaffModal !== null, 'Modal not found');
        
        const addInventoryControllerModal = document.getElementById('add-inventorycontroller-modal');
        test('Add Inventory Controller modal exists', addInventoryControllerModal !== null, 'Modal not found');
        
        // Try clicking buttons
        console.log('\n🔘 Testing Button Clicks:');
        
        if (addSupervisorBtn && addSupervisorBtn.offsetParent !== null) {
            try {
                console.log('  ⏳ Clicking Add Supervisor button...');
                const beforeClick = addSupervisorModal?.style.display !== 'none' ||
                                  addSupervisorModal?.classList.contains('active');
                
                // Simulate click
                addSupervisorBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                
                // Wait and check
                setTimeout(() => {
                    const afterClick = addSupervisorModal?.style.display !== 'none' ||
                                     addSupervisorModal?.classList.contains('active') ||
                                     window.getComputedStyle(addSupervisorModal).display !== 'none';
                    
                    test('Add Supervisor button opens modal', afterClick, 'Modal did not open after click');
                    
                    // Print summary
                    printSummary();
                }, 300);
                
                return; // Exit early to wait for async test
            } catch (e) {
                test('Add Supervisor click test', false, `Error: ${e.message}`);
            }
        }
        
        // Print summary immediately if no async tests
        printSummary();
    }
    
    function printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 Test Summary:');
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log('='.repeat(60));
        
        if (results.errors.length > 0) {
            console.log('\n⚠️ Errors Found:');
            results.errors.forEach(err => console.error(`  - ${err}`));
        }
        
        if (results.failed === 0) {
            console.log('\n🎉 All tests passed! Buttons should be working correctly.');
        } else {
            console.log(`\n⚠️ ${results.failed} test(s) failed. Please check the errors above.`);
            console.log('\n💡 Suggestions:');
            console.log('  - Make sure you are logged in');
            console.log('  - Make sure you are on the correct page (Supervisors, Team Leaders, etc.)');
            console.log('  - Check browser console for JavaScript errors');
            console.log('  - Try refreshing the page');
        }
    }
    
    // Run tests after a short delay to ensure page is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runTests, 500);
        });
    } else {
        setTimeout(runTests, 500);
    }
})();

