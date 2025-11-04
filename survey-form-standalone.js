// Complete item catalog - matches server.js itemCatalog
const itemCatalog = [
    { name: '1 Seater Sofa', cbm: 0.57 },
    { name: '2 Seater Sofa', cbm: 1 },
    { name: '3 Seater Sofa', cbm: 1.5 },
    { name: '3 Seater Bench', cbm: 0.42 },
    { name: '4 Seater Bench', cbm: 0.56 },
    { name: 'Antenna', cbm: 0.14 },
    { name: 'Arm Chair', cbm: 0.57 },
    { name: "Baby's Crib", cbm: 0.7 },
    { name: 'Bar', cbm: 0.99 },
    { name: 'Bar Stool', cbm: 0.19 },
    { name: 'BBQ Grill', cbm: 0.65 },
    { name: 'Bean Bag', cbm: 0.23 },
    { name: 'Bicycle', cbm: 0.5 },
    { name: 'Book Shelf (L)', cbm: 1 },
    { name: 'Book Shelf (S)', cbm: 0.57 },
    { name: 'Bunk Bed', cbm: 0.65 },
    { name: 'Cabinet', cbm: 0.5 },
    { name: 'Carpet', cbm: 0.28 },
    { name: 'Centre Table', cbm: 0.14 },
    { name: 'Chandeliers(S/m)', cbm: 0.5 },
    { name: 'Chest of Drawers', cbm: 0.5 },
    { name: 'Cloths Drying Rack', cbm: 0.25 },
    { name: 'Coffee Table', cbm: 0.14 },
    { name: 'Computer Monitor', cbm: 0.5 },
    { name: 'Cooker', cbm: 0.6 },
    { name: 'CPU', cbm: 0.5 },
    { name: 'Curtains', cbm: 1 },
    { name: 'Dining Chairs', cbm: 0.19 },
    { name: 'Dining Table(L)', cbm: 0.84 },
    { name: 'Dining Table(S)', cbm: 0.42 },
    { name: 'Dishwasher', cbm: 0.6 },
    { name: 'Dog Kennel', cbm: 0.25 },
    { name: 'Dryer', cbm: 0.3 },
    { name: 'Exercise Machine', cbm: 1 },
    { name: 'Fish Tank', cbm: 0.22 },
    { name: 'Foot Rest', cbm: 0.3 },
    { name: 'Freezer', cbm: 0.39 },
    { name: 'Fridge', cbm: 0.99 },
    { name: 'Ironing Board', cbm: 0.17 },
    { name: 'King Bed', cbm: 2.7 },
    { name: 'Lamps', cbm: 0.5 },
    { name: 'Linen Basket', cbm: 0.08 },
    { name: 'Microwave', cbm: 0.19 },
    { name: 'Mirror', cbm: 0.6 },
    { name: 'Office Table', cbm: 0.42 },
    { name: 'Paintings', cbm: 0.19 },
    { name: 'Piano (Keyboard)', cbm: 0.39 },
    { name: 'Plants (Large)', cbm: 0.25 },
    { name: 'Plants (Medium)', cbm: 0.12 },
    { name: 'Plants (Small)', cbm: 0.08 },
    { name: 'Queen Bed', cbm: 1.5 },
    { name: 'Shoe Rack', cbm: 0.5 },
    { name: 'Side Server', cbm: 0.28 },
    { name: 'Side Table', cbm: 0.14 },
    { name: 'Single Bed', cbm: 0.7 },
    { name: 'Sofa Cum Bed', cbm: 0.99 },
    { name: 'Speakers', cbm: 0.14 },
    { name: 'Stereo', cbm: 0.14 },
    { name: 'Swing Set', cbm: 1.5 },
    { name: 'Table Fan', cbm: 0.08 },
    { name: 'Trampoline', cbm: 0.65 },
    { name: 'TV', cbm: 0.5 },
    { name: 'TV stand (S)', cbm: 0.5 },
    { name: 'TV stand (M)', cbm: 1 },
    { name: 'Vacuum Cleaner', cbm: 0.08 },
    { name: 'Wall Unit', cbm: 0.99 },
    { name: 'Wardrobe (2d)', cbm: 0.5 },
    { name: 'Wardrobe (3d)', cbm: 0.79 },
    { name: 'Wardrobe (4d)', cbm: 1.13 },
    { name: 'Washing Machine', cbm: 0.39 },
    { name: 'Water Dispenser', cbm: 0.3 },
    { name: 'Workstation', cbm: 2 },
    { name: 'Other Heavy Items', cbm: 0 }
];

// Initialize signature canvases
function initSignatures() {
    ['pl-customer-signature', 'pl-moveit-signature'].forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
            isDrawing = true;
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isDrawing) return;
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
            ctx.stroke();
        });
        
        canvas.addEventListener('touchend', stopDrawing);
        
        function startDrawing(e) {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        }
        
        function draw(e) {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
        
        function stopDrawing() {
            isDrawing = false;
        }
    });
}

function clearSignature(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showAddCustomItemModal() {
    document.getElementById('add-custom-item-form').reset();
    showModal('add-custom-item-modal');
}

function addCustomItem() {
    const name = document.getElementById('custom-item-name').value.trim();
    const cbm = parseFloat(document.getElementById('custom-item-cbm').value || 0);
    
    if (!name || cbm <= 0 || isNaN(cbm)) {
        alert('Please enter item name and valid CBM');
        return;
    }
    
    const tbody = document.getElementById('packing-list-items-tbody');
    if (!tbody) {
        alert('Packing list table not found');
        return;
    }
    
    // Check if item already exists
    const existingItems = Array.from(tbody.querySelectorAll('.item-name'));
    const itemExists = existingItems.some(item => item.textContent.trim().toLowerCase() === name.toLowerCase());
    
    if (itemExists) {
        alert('This item already exists in the list');
        return;
    }
    
    const row = createItemRow({ name, cbm, pieces: 0 }, tbody.children.length);
    tbody.appendChild(row);
    
    document.getElementById('add-custom-item-form').reset();
    hideModal('add-custom-item-modal');
    updatePackingListTotals();
    alert('Custom item added successfully');
}

function createItemRow(item, index) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="item-name">${item.name || ''}</td>
        <td class="item-cbm" style="text-align:center;">${(item.cbm || 0).toFixed(2)}</td>
        <td><input type="number" class="form-control item-pieces" min="0" value="${item.pieces || 0}" onchange="updatePackingListTotals()" style="width:80px;"></td>
        <td class="item-total-cbm" style="text-align:center;">${((item.cbm || 0) * (item.pieces || 0)).toFixed(2)}</td>
        <td><button type="button" class="btn btn-sm btn-danger" onclick="removeItemFromTable(this)">Remove</button></td>
    `;
    return row;
}

function removeItemFromTable(btn) {
    btn.closest('tr').remove();
    updatePackingListTotals();
}

function updatePackingListTotals() {
    let totalCbm = 0;
    
    const rows = document.querySelectorAll('#packing-list-items-tbody tr');
    rows.forEach(row => {
        const cbm = parseFloat(row.querySelector('.item-cbm')?.textContent || 0);
        const pieces = parseInt(row.querySelector('.item-pieces')?.value || 0);
        const totalRowCbm = cbm * pieces;
        totalCbm += totalRowCbm;
        
        const totalCell = row.querySelector('.item-total-cbm');
        if (totalCell) totalCell.textContent = totalRowCbm.toFixed(2);
    });
    
    document.getElementById('pl-total-cbm').value = totalCbm.toFixed(2);
}

async function loadItemCatalog() {
    try {
        // Try to fetch from API if available
        const response = await fetch('/api/item-catalog');
        if (response.ok) {
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        }
    } catch (error) {
        console.log('API not available, using complete catalog');
    }
    // Return complete catalog if API is not available
    return itemCatalog;
}

async function populateItemsTable(existingItems = []) {
    const tbody = document.getElementById('packing-list-items-tbody');
    if (!tbody) {
        console.error('packing-list-items-tbody not found');
        return;
    }
    
    let itemsToAdd = [];
    
    if (existingItems.length > 0) {
        // Use existing items from saved data
        itemsToAdd = existingItems;
    } else {
        // Load from catalog
        const catalog = await loadItemCatalog();
        itemsToAdd = catalog;
    }
    
    // Clear table
    tbody.innerHTML = '';
    
    if (itemsToAdd.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#64748b;">No items available.</td></tr>';
        return;
    }
    
    itemsToAdd.forEach((item, index) => {
        const row = createItemRow(item, index);
        tbody.appendChild(row);
    });
    
    // Update totals
    updatePackingListTotals();
}

function filterPackingListItems() {
    const searchTerm = document.getElementById('packing-list-search')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#packing-list-items-tbody tr');
    
    rows.forEach(row => {
        const itemName = row.querySelector('.item-name')?.textContent.toLowerCase() || '';
        if (itemName.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function handleImagePreview(input) {
    const preview = document.getElementById('survey-images-preview');
    preview.innerHTML = '';
    
    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
}

// Form submission
document.getElementById('complete-survey-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = {
        customerName: document.getElementById('pl-customer-name').value,
        customerName2: document.getElementById('pl-customer-name-2').value,
        mobile: document.getElementById('pl-mobile').value,
        surveyDate: document.getElementById('pl-survey-date').value,
        movingFrom: document.getElementById('pl-moving-from').value,
        movingTo: document.getElementById('pl-moving-to').value,
        apartmentSize: document.getElementById('pl-apartment-size').value,
        serviceTypes: Array.from(document.querySelectorAll('input[name="service-type"]:checked')).map(cb => cb.value),
        items: Array.from(document.querySelectorAll('#packing-list-items-tbody tr')).map(row => ({
            name: row.querySelector('.item-name').textContent,
            cbm: parseFloat(row.querySelector('.item-cbm').textContent),
            pieces: parseInt(row.querySelector('.item-pieces').value),
            totalCbm: parseFloat(row.querySelector('.item-total-cbm').textContent)
        })).filter(item => item.pieces > 0), // Only include items with quantity > 0
        totals: {
            permit: document.getElementById('pl-permit').value,
            workingDays: document.getElementById('pl-working-days').value,
            trips: document.getElementById('pl-trips').value,
            totalCbm: document.getElementById('pl-total-cbm').value,
            amount: document.getElementById('pl-amount').value
        },
        comments: document.getElementById('survey-comments').value,
        clientInstructions: document.getElementById('survey-client-instructions').value,
        terms: document.getElementById('pl-terms').value,
        customerSignature: document.getElementById('pl-customer-signature').toDataURL(),
        moveitSignature: document.getElementById('pl-moveit-signature').toDataURL()
    };
    
    console.log('Form Data:', formData);
    alert('Form submitted! Check console for data. Integrate with your backend/Zoho API here.');
    
    // Here you can send the data to your backend or Zoho API
    // Example:
    // fetch('YOUR_API_ENDPOINT', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    // });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    initSignatures();
    await populateItemsTable();
    updatePackingListTotals();
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

