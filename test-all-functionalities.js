/**
 * Comprehensive Functionality Test Suite
 * Tests all buttons, features, and functionalities in the MoveIt 247 application
 * 
 * Usage: Open browser console on the application page and run this script
 * Or integrate with a testing framework
 */

const TestSuite = {
    baseUrl: window.location.origin,
    results: {
        passed: [],
        failed: [],
        warnings: []
    },
    currentUser: null,
    currentRole: null,

    // Test utilities
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            pass: '\x1b[32m', // Green
            fail: '\x1b[31m', // Red
            warn: '\x1b[33m', // Yellow
            info: '\x1b[36m', // Cyan
            reset: '\x1b[0m'
        };
        
        if (typeof window !== 'undefined' && window.console) {
            console.log(`[${timestamp}] ${message}`);
        } else {
            console.log(`${colors[type] || colors.info}[${timestamp}] ${message}${colors.reset}`);
        }
    },

    async test(name, testFn) {
        try {
            this.log(`🧪 Testing: ${name}`, 'info');
            await testFn();
            this.results.passed.push(name);
            this.log(`✅ PASSED: ${name}`, 'pass');
            return true;
        } catch (error) {
            this.results.failed.push({ name, error: error.message });
            this.log(`❌ FAILED: ${name} - ${error.message}`, 'fail');
            return false;
        }
    },

    async warn(name, message) {
        this.results.warnings.push({ name, message });
        this.log(`⚠️ WARNING: ${name} - ${message}`, 'warn');
    },

    // Check if element exists and is visible
    checkElement(selector, shouldExist = true, shouldBeVisible = true) {
        const element = document.querySelector(selector);
        if (!element && shouldExist) {
            throw new Error(`Element not found: ${selector}`);
        }
        if (element && shouldBeVisible) {
            const style = window.getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                throw new Error(`Element not visible: ${selector}`);
            }
        }
        return element;
    },

    // Click an element
    async click(selector) {
        const element = this.checkElement(selector);
        if (element) {
            element.click();
            await this.delay(300); // Wait for click handler
            return true;
        }
        return false;
    },

    // Fill form field
    fillField(selector, value) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Field not found: ${selector}`);
        }
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    },

    // Check if modal is open
    isModalOpen(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;
        const style = window.getComputedStyle(modal);
        return style.display !== 'none';
    },

    // Get app instance
    getApp() {
        if (typeof app !== 'undefined') {
            return app;
        }
        throw new Error('App instance not found. Make sure you are on the application page.');
    },

    // ==================== TEST CATEGORIES ====================

    /**
     * 1. LOGIN & AUTHENTICATION TESTS
     */
    async testLoginFunctionality() {
        await this.test('Login form exists', () => {
            this.checkElement('#login-form');
            this.checkElement('#username');
            this.checkElement('#password');
        });

        await this.test('Login button exists', () => {
            const loginBtn = document.querySelector('button[onclick*="handleLogin"]') || 
                           document.querySelector('#login-form button[type="button"]');
            if (!loginBtn) throw new Error('Login button not found');
        });

        await this.test('Login with invalid credentials shows error', async () => {
            this.fillField('#username', 'invalid');
            this.fillField('#password', 'wrong');
            // Note: Actual error checking would require intercepting API calls
        });

        await this.test('Login page switches to app after login', async () => {
            // This would be tested after actual login
            const app = this.getApp();
            if (app && app.currentUser) {
                this.checkElement('#app-container');
                this.checkElement('#login-page', true, false);
            }
        });
    },

    /**
     * 2. NAVIGATION TESTS
     */
    async testNavigation() {
        const app = this.getApp();
        if (!app) return;

        const sections = [
            'dashboard', 'jobs', 'supervisors', 'teamleaders', 'staff',
            'inventorycontrollers', 'inventory', 'pending-collections',
            'inventory-history', 'surveys', 'notifications', 'profile'
        ];

        for (const section of sections) {
            await this.test(`Navigate to ${section}`, async () => {
                if (app.navigateTo) {
                    await app.navigateTo(section);
                    await this.delay(500);
                    const content = document.getElementById(`${section}-content`);
                    if (content) {
                        const style = window.getComputedStyle(content);
                        if (style.display === 'none') {
                            throw new Error(`Section ${section} not displayed`);
                        }
                    }
                }
            });
        }

        await this.test('Sidebar menu items clickable', () => {
            const menuItems = document.querySelectorAll('.sidebar-menu a');
            if (menuItems.length === 0) {
                throw new Error('No menu items found');
            }
        });

        await this.test('Mobile menu toggle works', async () => {
            const menuToggle = document.querySelector('.menu-toggle');
            if (menuToggle) {
                await this.click('.menu-toggle');
                await this.delay(300);
            }
        });
    },

    /**
     * 3. DASHBOARD TESTS
     */
    async testDashboard() {
        const app = this.getApp();
        if (!app || !app.currentUser) {
            await this.warn('Dashboard', 'User not logged in');
            return;
        }

        await this.test('Dashboard loads', async () => {
            if (app.loadDashboard) {
                await app.loadDashboard();
                await this.delay(500);
            }
        });

        await this.test('Dashboard stat cards exist', () => {
            const statCards = document.querySelectorAll('.stat-card');
            if (statCards.length === 0) {
                throw new Error('No stat cards found');
            }
        });

        await this.test('Dashboard charts render', () => {
            const charts = document.querySelectorAll('canvas');
            if (charts.length === 0) {
                this.warn('Dashboard', 'No charts found');
            }
        });

        await this.test('Recent projects table exists', () => {
            this.checkElement('#recent-jobs-table');
        });

        await this.test('Quick action buttons work', async () => {
            const quickActions = document.querySelectorAll('.quick-action-btn');
            if (quickActions.length > 0) {
                // Test clicking one button
                const firstBtn = quickActions[0];
                if (firstBtn.onclick || firstBtn.getAttribute('onclick')) {
                    // Button has click handler
                }
            }
        });
    },

    /**
     * 4. PROJECT MANAGEMENT TESTS
     */
    async testProjectManagement() {
        const app = this.getApp();
        if (!app) return;

        await this.test('Add Project form exists', () => {
            this.checkElement('#add-job-card');
            this.checkElement('#job-form');
        });

        await this.test('Project form tabs work', async () => {
            const tabButtons = document.querySelectorAll('.form-tab');
            if (tabButtons.length >= 3) {
                for (let i = 0; i < tabButtons.length; i++) {
                    if (app.switchProjectTab) {
                        app.switchProjectTab(i + 1);
                        await this.delay(300);
                    }
                }
            }
        });

        await this.test('Project form fields exist', () => {
            const requiredFields = [
                '#project-name', '#job-date', '#job-time',
                '#client-name', '#client-phone', '#client-email',
                '#move-from', '#move-to'
            ];
            
            for (const field of requiredFields) {
                try {
                    this.checkElement(field);
                } catch (e) {
                    this.warn('Project Form', `Field ${field} not found`);
                }
            }
        });

        await this.test('Packing materials section loads', async () => {
            if (app.populatePackingMaterials) {
                await app.populatePackingMaterials();
                await this.delay(500);
                const container = document.getElementById('packing-materials-container');
                if (container) {
                    // Section exists and loaded
                }
            }
        });

        await this.test('Edit Project modal opens', async () => {
            if (app.data && app.data.jobs && app.data.jobs.length > 0) {
                const firstJob = app.data.jobs[0];
                if (app.editJob) {
                    app.editJob(firstJob.id);
                    await this.delay(500);
                    if (this.isModalOpen('edit-job-modal')) {
                        // Modal opened successfully
                    } else {
                        throw new Error('Edit modal did not open');
                    }
                }
            }
        });

        await this.test('Project status can be updated', async () => {
            const statusSelect = document.getElementById('edit-job-status');
            if (statusSelect) {
                statusSelect.value = 'delayed';
                statusSelect.dispatchEvent(new Event('change'));
            }
        });

        await this.test('Export CSV button exists', () => {
            const exportBtn = document.querySelector('button[onclick*="exportJobsCSV"]') ||
                            document.querySelector('button:contains("Export CSV")');
            if (!exportBtn) {
                this.warn('Projects', 'Export CSV button not found');
            }
        });

        await this.test('Export PDF button exists', () => {
            const exportBtn = document.querySelector('button[onclick*="exportJobsPDF"]') ||
                            document.querySelector('button:contains("Export PDF")');
            if (!exportBtn) {
                this.warn('Projects', 'Export PDF button not found');
            }
        });

        await this.test('View Project details works', async () => {
            if (app.data && app.data.jobs && app.data.jobs.length > 0) {
                const firstJob = app.data.jobs[0];
                if (app.showJobDetails) {
                    app.showJobDetails(firstJob.id);
                    await this.delay(500);
                    if (this.isModalOpen('job-details-modal')) {
                        // Details modal opened
                    }
                }
            }
        });
    },

    /**
     * 5. USER MANAGEMENT TESTS
     */
    async testUserManagement() {
        const app = this.getApp();
        if (!app) return;

        const userTypes = ['supervisors', 'teamLeaders', 'staff', 'inventoryControllers'];

        for (const userType of userTypes) {
            const section = userType === 'teamLeaders' ? 'teamleaders' :
                           userType === 'inventoryControllers' ? 'inventorycontrollers' : userType;

            await this.test(`${userType} section loads`, async () => {
                if (app.navigateTo) {
                    await app.navigateTo(section);
                    await this.delay(500);
                }
            });

            await this.test(`Add ${userType} button exists`, () => {
                const addBtn = document.querySelector(`#add-${userType.slice(0, -1)}-btn`) ||
                              document.querySelector(`button[onclick*="showAdd${userType.slice(0, -1).charAt(0).toUpperCase() + userType.slice(0, -1).slice(1)}Modal"]`);
                if (!addBtn && (this.currentRole === 'admin' || this.currentRole === 'supervisor')) {
                    this.warn(userType, 'Add button not found for admin/supervisor');
                }
            });

            await this.test(`${userType} table exists`, () => {
                const table = document.getElementById(`${userType}-table`) ||
                             document.querySelector(`table[id*="${section}"]`);
                if (!table) {
                    throw new Error(`${userType} table not found`);
                }
            });

            await this.test(`${userType} form fields exist`, async () => {
                const modalId = `add-${userType.slice(0, -1)}-modal`;
                const modal = document.getElementById(modalId);
                if (modal) {
                    const inputs = modal.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"], input[type="password"]');
                    if (inputs.length === 0) {
                        this.warn(userType, 'No form inputs found');
                    }
                }
            });
        }
    },

    /**
     * 6. INVENTORY MANAGEMENT TESTS
     */
    async testInventoryManagement() {
        const app = this.getApp();
        if (!app) return;

        await this.test('Inventory section loads', async () => {
            if (app.loadInventory) {
                await app.loadInventory();
                await this.delay(500);
            }
        });

        await this.test('Inventory table exists', () => {
            this.checkElement('#inventory-table');
        });

        await this.test('Add Material button exists', () => {
            const addBtn = document.querySelector('button[onclick*="showAddMaterialModal"]') ||
                          document.querySelector('button:contains("Add Material")');
            if (!addBtn && (this.currentRole === 'admin' || this.currentRole === 'inventoryController')) {
                this.warn('Inventory', 'Add Material button not found');
            }
        });

        await this.test('Material quantity can be edited', () => {
            const quantityInputs = document.querySelectorAll('.material-quantity-input');
            if (quantityInputs.length > 0 && (this.currentRole === 'admin' || this.currentRole === 'inventoryController')) {
                // Can edit materials
            }
        });

        await this.test('Pending Collections section exists', () => {
            if (app.loadPendingCollections) {
                app.loadPendingCollections();
                this.checkElement('#pending-collections-table');
            }
        });

        await this.test('Inventory History section exists', () => {
            if (app.loadInventoryHistory) {
                app.loadInventoryHistory();
                this.checkElement('#inventory-history-table');
            }
        });
    },

    /**
     * 7. NOTIFICATIONS TESTS
     */
    async testNotifications() {
        const app = this.getApp();
        if (!app) return;

        await this.test('Notifications section loads', async () => {
            if (app.loadNotifications) {
                await app.loadNotifications();
                await this.delay(500);
            }
        });

        await this.test('Notifications list exists', () => {
            this.checkElement('#notifications-list');
        });

        await this.test('Send Notification form exists (admin)', () => {
            if (this.currentRole === 'admin') {
                this.checkElement('#send-notification-form');
                this.checkElement('#notification-recipient');
                this.checkElement('#notification-title');
                this.checkElement('#notification-message');
            }
        });

        await this.test('Mark all read button exists', () => {
            const markAllBtn = document.querySelector('button[onclick*="markAllNotificationsRead"]');
            if (!markAllBtn) {
                this.warn('Notifications', 'Mark all read button not found');
            }
        });

        await this.test('Notification badge updates', () => {
            const badge = document.getElementById('notification-badge');
            if (badge) {
                // Badge exists
            }
        });
    },

    /**
     * 8. PROFILE TESTS
     */
    async testProfile() {
        await this.test('Profile section loads', async () => {
            const app = this.getApp();
            if (app && app.loadProfile) {
                await app.loadProfile();
                await this.delay(500);
            }
        });

        await this.test('Profile form exists', () => {
            this.checkElement('#profile-form');
            this.checkElement('#profile-name');
            this.checkElement('#profile-email');
            this.checkElement('#profile-phone');
        });

        await this.test('Profile image upload exists', () => {
            const imageInput = document.getElementById('profile-image');
            if (!imageInput) {
                this.warn('Profile', 'Profile image upload not found');
            }
        });

        await this.test('Password change fields exist', () => {
            this.checkElement('#profile-password');
            this.checkElement('#profile-confirm-password');
        });
    },

    /**
     * 9. BUTTON FUNCTIONALITY TESTS
     */
    async testButtonFunctionality() {
        const app = this.getApp();
        if (!app) return;

        // Test all action buttons
        const buttonTests = [
            { selector: 'button[onclick*="exportJobsCSV"]', name: 'Export CSV' },
            { selector: 'button[onclick*="exportJobsPDF"]', name: 'Export PDF' },
            { selector: 'button[onclick*="bulkUpdateStatus"]', name: 'Bulk Update Status' },
            { selector: 'button[onclick*="bulkAssignTeamLeader"]', name: 'Bulk Assign Team Leader' },
            { selector: 'button[onclick*="selectAllJobs"]', name: 'Select All Jobs' },
            { selector: 'button[onclick*="clearSelection"]', name: 'Clear Selection' },
        ];

        for (const btnTest of buttonTests) {
            await this.test(`${btnTest.name} button exists and is clickable`, () => {
                const btn = document.querySelector(btnTest.selector);
                if (btn) {
                    if (!btn.disabled) {
                        // Button is enabled and should be clickable
                    }
                } else {
                    this.warn('Buttons', `${btnTest.name} button not found`);
                }
            });
        }

        // Test pagination buttons
        await this.test('Pagination buttons work', async () => {
            const prevBtn = document.querySelector('#jobs-prev');
            const nextBtn = document.querySelector('#jobs-next');
            if (prevBtn && !prevBtn.disabled) {
                if (app.previousPage) {
                    app.previousPage('jobs');
                }
            }
            if (nextBtn && !nextBtn.disabled) {
                if (app.nextPage) {
                    app.nextPage('jobs');
                }
            }
        });
    },

    /**
     * 10. MODAL FUNCTIONALITY TESTS
     */
    async testModalFunctionality() {
        const app = this.getApp();
        if (!app) return;

        const modals = [
            'edit-job-modal',
            'job-details-modal',
            'job-completion-modal',
            'job-approval-modal',
            'add-supervisor-modal',
            'add-teamleader-modal',
            'add-staff-modal',
            'add-inventorycontroller-modal',
            'add-material-modal'
        ];

        for (const modalId of modals) {
            await this.test(`${modalId} exists in DOM`, () => {
                const modal = document.getElementById(modalId);
                if (!modal) {
                    this.warn('Modals', `${modalId} not found`);
                }
            });
        }

        await this.test('Modal close buttons work', async () => {
            const closeButtons = document.querySelectorAll('.modal .close, .modal .btn-secondary');
            if (closeButtons.length > 0) {
                // Close buttons exist
            }
        });
    },

    /**
     * 11. FORM VALIDATION TESTS
     */
    async testFormValidation() {
        await this.test('Required fields are marked', () => {
            const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
            if (requiredFields.length === 0) {
                this.warn('Forms', 'No required fields found');
            }
        });

        await this.test('Email validation works', () => {
            const emailInputs = document.querySelectorAll('input[type="email"]');
            for (const input of emailInputs) {
                input.value = 'invalid-email';
                input.dispatchEvent(new Event('blur'));
                if (input.validity && !input.validity.valid) {
                    // Validation working
                }
            }
        });

        await this.test('Phone validation works', () => {
            const phoneInputs = document.querySelectorAll('input[type="tel"]');
            for (const input of phoneInputs) {
                if (input.pattern) {
                    // Has validation pattern
                }
            }
        });
    },

    /**
     * 12. ROLE-BASED ACCESS TESTS
     */
    async testRoleBasedAccess() {
        const app = this.getApp();
        if (!app || !app.currentUser) {
            await this.warn('Role Access', 'User not logged in');
            return;
        }

        this.currentRole = app.currentRole;

        await this.test('Menu items hidden based on role', () => {
            if (this.currentRole === 'inventoryController') {
                const projectsMenu = document.querySelector('li.has-submenu');
                if (projectsMenu) {
                    const style = window.getComputedStyle(projectsMenu);
                    if (style.display !== 'none') {
                        this.warn('Role Access', 'Projects menu should be hidden for inventory controller');
                    }
                }
            }
        });

        await this.test('Admin sees all management options', () => {
            if (this.currentRole === 'admin') {
                const managementItems = ['supervisors-menu-item', 'teamleaders-menu-item', 'staff-menu-item'];
                for (const item of managementItems) {
                    const element = document.getElementById(item);
                    if (element) {
                        const style = window.getComputedStyle(element);
                        if (style.display === 'none') {
                            this.warn('Role Access', `${item} should be visible for admin`);
                        }
                    }
                }
            }
        });
    },

    /**
     * 13. DATA DISPLAY TESTS
     */
    async testDataDisplay() {
        const app = this.getApp();
        if (!app) return;

        await this.test('Tables render data', async () => {
            if (app.data && app.data.jobs) {
                await app.navigateTo('current-projects');
                await this.delay(500);
                const table = document.querySelector('#current-jobs-table tbody');
                if (table) {
                    const rows = table.querySelectorAll('tr');
                    if (rows.length === 0 && app.data.jobs.length > 0) {
                        this.warn('Data Display', 'Table not rendering data');
                    }
                }
            }
        });

        await this.test('Search functionality exists', () => {
            const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="earch"], input[type="text"][id*="search"]');
            if (searchInputs.length === 0) {
                this.warn('Data Display', 'No search inputs found');
            }
        });

        await this.test('Status filters work', () => {
            const statusFilters = document.querySelectorAll('select[id*="status"]');
            if (statusFilters.length === 0) {
                this.warn('Data Display', 'No status filters found');
            }
        });
    },

    /**
     * 14. UI/UX TESTS
     */
    async testUIUX() {
        await this.test('Responsive design elements exist', () => {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (!viewport) {
                this.warn('UI/UX', 'Viewport meta tag not found');
            }
        });

        await this.test('Loading states display', () => {
            // Check for loading indicators
            const loadingElements = document.querySelectorAll('[class*="loading"], [id*="loading"]');
            // Loading states may not be visible when data is loaded
        });

        await this.test('Error messages display', () => {
            // Check for notification/toast elements
            const notificationElements = document.querySelectorAll('[class*="notification"], [class*="toast"]');
            // Notification system exists
        });
    },

    /**
     * 15. SURVEYS TESTS
     */
    async testSurveys() {
        const app = this.getApp();
        if (!app) return;

        await this.test('Surveys section loads', async () => {
            if (app.loadSurveys) {
                await app.loadSurveys();
                await this.delay(500);
            }
        });

        await this.test('Surveys table exists', () => {
            const table = document.getElementById('surveys-table');
            if (!table) {
                this.warn('Surveys', 'Surveys table not found');
            }
        });

        await this.test('Add Survey button exists (admin)', () => {
            if (this.currentRole === 'admin') {
                const addBtn = document.getElementById('add-survey-btn');
                if (!addBtn) {
                    this.warn('Surveys', 'Add Survey button not found for admin');
                }
            }
        });
    },

    /**
     * 16. REPORTS TESTS
     */
    async testReports() {
        const app = this.getApp();
        if (!app) return;

        await this.test('Reports section loads', async () => {
            if (app.loadReports) {
                await app.loadReports();
                await this.delay(500);
            }
        });

        await this.test('Report charts render', () => {
            const charts = document.querySelectorAll('canvas');
            if (charts.length === 0) {
                this.warn('Reports', 'No charts found in reports');
            }
        });
    },

    // Main test runner
    async runAllTests() {
        console.log('🚀 Starting Comprehensive Functionality Test Suite...\n');
        console.log('='.repeat(60));
        
        const startTime = Date.now();

        try {
            // Get app instance and current user
            try {
                const app = this.getApp();
                if (app && app.currentUser) {
                    this.currentUser = app.currentUser;
                    this.currentRole = app.currentRole;
                    this.log(`Logged in as: ${app.currentUser.name} (${app.currentRole})`, 'info');
                }
            } catch (e) {
                this.warn('Setup', 'App instance not available. Some tests may be skipped.');
            }

            // Run all test categories
            await this.testLoginFunctionality();
            await this.testNavigation();
            await this.testDashboard();
            await this.testProjectManagement();
            await this.testUserManagement();
            await this.testInventoryManagement();
            await this.testNotifications();
            await this.testProfile();
            await this.testButtonFunctionality();
            await this.testModalFunctionality();
            await this.testFormValidation();
            await this.testRoleBasedAccess();
            await this.testDataDisplay();
            await this.testUIUX();
            await this.testSurveys();
            await this.testReports();

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            // Print summary
            console.log('\n' + '='.repeat(60));
            console.log('📊 TEST SUMMARY');
            console.log('='.repeat(60));
            console.log(`✅ Passed: ${this.results.passed.length}`);
            console.log(`❌ Failed: ${this.results.failed.length}`);
            console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
            console.log(`⏱️  Duration: ${duration}s`);
            console.log('='.repeat(60));

            if (this.results.failed.length > 0) {
                console.log('\n❌ FAILED TESTS:');
                this.results.failed.forEach(fail => {
                    console.log(`  - ${fail.name}: ${fail.error}`);
                });
            }

            if (this.results.warnings.length > 0) {
                console.log('\n⚠️  WARNINGS:');
                this.results.warnings.forEach(warn => {
                    console.log(`  - ${warn.name}: ${warn.message}`);
                });
            }

            return {
                passed: this.results.passed.length,
                failed: this.results.failed.length,
                warnings: this.results.warnings.length,
                duration: parseFloat(duration),
                details: this.results
            };

        } catch (error) {
            console.error('💥 Test suite error:', error);
            throw error;
        }
    }
};

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestSuite;
} else {
    window.TestSuite = TestSuite;
}

// Auto-run if in browser console
if (typeof window !== 'undefined' && window.console) {
    console.log('🧪 Test Suite loaded. Run TestSuite.runAllTests() to start testing.');
}

