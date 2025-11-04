import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Zoho CRM Configuration
const ZOHO_API_VERSION = process.env.ZOHO_API_VERSION || 'v2';
const ZOHO_REGION = process.env.ZOHO_REGION || 'com'; // Options: com, eu, in, jp, au
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID || '';
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET || '';
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN || '';
const ZOHO_ORG_ID = process.env.ZOHO_ORG_ID || '';

// Cache for access token
let zohoAccessToken = null;
let zohoTokenExpiry = 0;

// Zoho CRM Integration Helper Functions
async function getZohoAccessToken() {
  try {
    // Check if we have a valid cached token
    const now = Date.now();
    if (zohoAccessToken && now < zohoTokenExpiry) {
      return zohoAccessToken;
    }

    // Get new access token using refresh token
    const response = await fetch(
      `https://accounts.zoho.${ZOHO_REGION}/oauth/v2/token?refresh_token=${ZOHO_REFRESH_TOKEN}&client_id=${ZOHO_CLIENT_ID}&client_secret=${ZOHO_CLIENT_SECRET}&grant_type=refresh_token`,
      { method: 'POST' }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get Zoho access token:', errorText);
      return null;
    }

    const data = await response.json();
    zohoAccessToken = data.access_token;
    // Token expires in ~55 minutes, cache for 50 minutes
    zohoTokenExpiry = now + (50 * 60 * 1000);

    console.log('✅ Successfully obtained Zoho access token');
    return zohoAccessToken;
  } catch (error) {
    console.error('Error getting Zoho access token:', error);
    return null;
  }
}

async function submitSurveyToZoho(survey, packingList) {
  try {
    // Check if Zoho is configured
    if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
      console.log('⚠️  Zoho CRM not configured, skipping integration');
      return { success: false, reason: 'not_configured' };
    }

    const accessToken = await getZohoAccessToken();
    if (!accessToken) {
      return { success: false, reason: 'auth_failed' };
    }

    // Prepare lead/contact data for Zoho CRM
    const leadData = {
      Last_Name: packingList?.personName || survey.clientName || 'Survey Lead',
      Mobile: packingList?.mobile || survey.clientNumber || '',
      Email: packingList?.email || '',
      Company: packingList?.companyName || '',
      Description: `Survey Completed\n\nSurvey Details:\n- Location: ${survey.location || 'N/A'}\n- Apartment Size: ${survey.apartmentSize || 'N/A'}\n- Survey Date: ${survey.surveyDate || 'N/A'} ${survey.surveyTime || ''}\n\n${
        packingList ? `Service Type: ${packingList.serviceTypes?.join(', ') || 'N/A'}\nOrigin: ${packingList.origin || 'N/A'}\nDestination: ${packingList.destination || 'N/A'}\nTotal CBM: ${packingList.totalCbm || 0}\nTotal Value: ${packingList.totalValue || 0} AED\n` : ''
      }Comments: ${survey.surveyData?.comments || 'N/A'}\nClient Instructions: ${survey.surveyData?.clientInstructions || 'N/A'}`,
      Lead_Status: 'Not Contacted',
      Lead_Source: packingList?.source || 'Survey Form',
      // Add custom fields if your Zoho CRM has them
      // Custom_Field_1: survey.clientNumber,
      // Custom_Field_2: survey.location
    };

    // Create lead in Zoho CRM
    const zohoApiUrl = `https://www.zohoapis.${ZOHO_REGION}/crm/${ZOHO_API_VERSION}/Leads`;
    const response = await fetch(zohoApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: [leadData]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create lead in Zoho CRM:', errorText);
      return { success: false, reason: 'api_error', error: errorText };
    }

    const result = await response.json();
    console.log('✅ Successfully created lead in Zoho CRM:', result);

    // If there's packing list data, you could also create an attached note or deal
    if (packingList && packingList.items && packingList.items.length > 0) {
      // Optional: Create a note with packing list details
      try {
        const noteData = {
          Note_Title: `Packing List - ${packingList.serialNo || survey.id}`,
          Note_Content: `Items List:\n${packingList.items.map((item, idx) => 
            `${idx + 1}. ${item.name}: ${item.pieces} pcs (${item.totalCbm} CBM)`
          ).join('\n')}\n\nTotal Boxes: ${packingList.totalBoxes}\nTotal CBM: ${packingList.totalCbm}\nAmount: ${packingList.amount} AED`
        };

        // Attach note to the created lead
        if (result.data && result.data.length > 0 && result.data[0].details) {
          const leadId = result.data[0].details.id;
          const notesUrl = `https://www.zohoapis.${ZOHO_REGION}/crm/${ZOHO_API_VERSION}/Leads/${leadId}/Notes`;
          
          await fetch(notesUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Zoho-oauthtoken ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: [noteData] })
          });
        }
      } catch (noteError) {
        console.error('Error creating note in Zoho:', noteError);
        // Don't fail the whole process if note creation fails
      }
    }

    return { success: true, zohoData: result };
  } catch (error) {
    console.error('Error submitting survey to Zoho:', error);
    return { success: false, reason: 'exception', error: error.message };
  }
}

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Landing page at root (register BEFORE static so it isn't shadowed by index.html)
app.get('/', (req, res) => {
  const homePath = path.join(__dirname, 'home.html');
  if (fs.existsSync(homePath)) {
    res.sendFile(homePath);
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});
// Serve static frontend from project root but do NOT auto-serve index.html at '/'
app.use(express.static(__dirname, { index: false }));
// Portal (original app)
app.get(['/portal', '/app', '/dashboard'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Universal Database System - Works on any platform
const dbPath = path.join(__dirname, 'db.json');
let inMemoryDb = null;
let useFileSystem = true;

// Check if we can use file system (works on VPS, not on Vercel/Railway)
function canUseFileSystem() {
  try {
    // Try to write a test file
    const testPath = path.join(__dirname, '.test-write');
    fs.writeFileSync(testPath, 'test');
    fs.unlinkSync(testPath);
    return true;
  } catch (error) {
    console.log('File system not available, using in-memory database');
    return false;
  }
}

// Initialize database system
function initDatabase() {
  useFileSystem = canUseFileSystem();
  
  if (useFileSystem) {
    console.log('Using file-based database (db.json)');
    return readDbFromFile();
  } else {
    console.log('Using in-memory database (platform compatible)');
    return readDbFromMemory();
  }
}

function readDbFromFile() {
  if (!fs.existsSync(dbPath)) {
    const seed = getSeedData();
    fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function readDbFromMemory() {
  if (!inMemoryDb) {
    inMemoryDb = getSeedData();
  }
  return inMemoryDb;
}

function getSeedData() {
  return {
    users: { 
      admin: { 
        username: 'admin', 
        password: 'admin123', 
        role: 'admin', 
        name: 'Admin User',
        email: 'admin@moveit247.com',
        phone: '+1234567890'
      } 
    },
    jobs: [], // Will be renamed to projects in frontend
    notifications: [],
    supervisors: [],
    teamLeaders: [],
    staff: [],
    inventoryControllers: [], // New role
    surveys: [],
    tracking: {},
    branding: { logoUrl: '' },
    // Inventory Management System
    inventory: {
      materials: [
        { id: 1, name: 'Medium Box', quantity: 0, quantityNew: 0, quantityOld: 0, minThreshold: 10 },
        { id: 2, name: 'Large Box', quantity: 0, quantityNew: 0, quantityOld: 0, minThreshold: 10 },
        { id: 3, name: 'Tapes', quantity: 0, quantityNew: 0, quantityOld: 0, minThreshold: 20 },
        { id: 4, name: 'Cling wrap', quantity: 0, quantityNew: 0, quantityOld: 0, minThreshold: 15 },
        { id: 5, name: 'Blanket', quantity: 0, quantityNew: 0, quantityOld: 0, minThreshold: 5 },
        { id: 6, name: 'Hanger Box', quantity: 0, quantityNew: 0, quantityOld: 0, minThreshold: 10 },
        { id: 7, name: 'Packing paper', quantity: 0, quantityNew: 0, quantityOld: 0, minThreshold: 10 },
        { id: 8, name: 'Bubble wrap', quantity: 0, quantityNew: 0, quantityOld: 0, minThreshold: 10 }
      ],
      transactions: [],
      pendingCollections: []
    },
    itemCatalog: [
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
    ],
    packingListSerialNo: 1001
  };
}

function readDb() {
  if (useFileSystem) {
    return readDbFromFile();
  } else {
    return readDbFromMemory();
  }
}

function writeDb(db) {
  if (useFileSystem) {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    } catch (error) {
      console.error('Failed to write to file system, switching to in-memory:', error.message);
      useFileSystem = false;
      inMemoryDb = db;
    }
  } else {
    inMemoryDb = db;
  }
}

// Universal file storage - works on any platform
const storage = multer.memoryStorage(); // Use memory storage for universal compatibility

// Alternative disk storage for platforms that support it
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, 'uploads');
    try {
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${Date.now()}-${nanoid(8)}${ext}`);
  }
});

// Use memory storage by default (works everywhere)
const upload = multer({ storage: storage });

// Auth
app.post('/api/auth/login', (req, res) => {
  try {
    let { username, password } = req.body || {};
    username = typeof username === 'string' ? username.trim() : '';
    password = typeof password === 'string' ? password : '';
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Use cached database for faster login
    const db = useFileSystem ? readDb() : inMemoryDb;
    if (!db || !db.users) {
      return res.status(500).json({ error: 'Database not available' });
    }
    
    // Case-insensitive username lookup to improve UX
    const matchedKey = Object.keys(db.users).find(k => k.toLowerCase() === username.toLowerCase());
    let user = matchedKey ? db.users[matchedKey] : undefined;
    
    // If not found in users, check staff array (for staff members)
    if (!user && db.staff && Array.isArray(db.staff)) {
      const staffMember = db.staff.find(s => s.username && s.username.toLowerCase() === username.toLowerCase());
      if (staffMember && staffMember.password === password) {
        // Check if staff is promoted to team leader
        const role = (staffMember.isTeamLeader === true) ? 'teamleader' : 'staff';
        return res.json({ 
          user: { 
            username: staffMember.username, 
            role: role, 
            name: staffMember.name, 
            phone: staffMember.phone || '', 
            email: staffMember.email || '', 
            profileImage: staffMember.profileImage || '' 
          } 
        });
      }
    }
    
    // If not found, check inventoryControllers array
    if (!user && db.inventoryControllers && Array.isArray(db.inventoryControllers)) {
      const inventoryController = db.inventoryControllers.find(ic => ic.username && ic.username.toLowerCase() === username.toLowerCase());
      if (inventoryController && inventoryController.password === password) {
        return res.json({ 
          user: { 
            username: inventoryController.username, 
            role: 'inventoryController', 
            name: inventoryController.name, 
            phone: inventoryController.phone || '', 
            email: inventoryController.email || '', 
            profileImage: inventoryController.profileImage || '' 
          } 
        });
      }
    }
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is staff and promoted to team leader
    let finalRole = user.role;
    if (user.role === 'staff' && db.staff && Array.isArray(db.staff)) {
      const staffMember = db.staff.find(s => s.username === user.username);
      if (staffMember && staffMember.isTeamLeader === true) {
        finalRole = 'teamleader';
      }
    }
    
    res.json({ user: { username: user.username, role: finalRole, name: user.name, phone: user.phone || '', email: user.email || '', profileImage: user.profileImage || '' } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Emergency admin restore endpoint
// POST /api/admin/reset { password?: string, name?: string }
app.post('/api/admin/reset', (req, res) => {
  try {
    const db = readDb();
    const password = (req.body && typeof req.body.password === 'string' && req.body.password.trim()) || 'admin123';
    const name = (req.body && typeof req.body.name === 'string' && req.body.name.trim()) || 'Admin User';
    db.users = db.users || {};
    db.users.admin = {
      username: 'admin',
      password,
      role: 'admin',
      name,
      email: db.users.admin?.email || 'admin@moveit247.com',
      phone: db.users.admin?.phone || ''
    };
    writeDb(db);
    res.json({ success: true, user: { username: 'admin' } });
  } catch (error) {
    console.error('Admin reset failed:', error);
    res.status(500).json({ error: 'Admin reset failed' });
  }
});

// Generic helpers
function listRoute(key) {
  return (req, res) => {
    const db = readDb();
    res.json(db[key]);
  };
}

function createRoute(key, idField = 'id') {
  return (req, res) => {
    try {
      const db = readDb();
      const item = req.body;
      if (!item) {
        return res.status(400).json({ error: 'Request body is required' });
      }
      
        // Check for duplicate username in people collections
      if (['supervisors', 'teamLeaders', 'staff', 'inventoryControllers'].includes(key) && item.username) {
        const existingUser = db[key].find(existing => existing.username === item.username);
        if (existingUser) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Also check in users collection
        if (db.users[item.username]) {
          return res.status(400).json({ error: 'Username already exists' });
        }
      }
      
      if (!item[idField]) {
        // assign id if missing
        const nextId = db[key].length ? Math.max(...db[key].map(x => Number(x[idField]) || 0)) + 1 : 1;
        item[idField] = nextId;
      }
      db[key].push(item);
      
      // Add user to users collection for login (for people collections)
      if (['supervisors', 'teamLeaders', 'staff', 'inventoryControllers'].includes(key) && item.username && item.password) {
        const role = key === 'supervisors' ? 'supervisor' : 
                     key === 'teamLeaders' ? 'teamLeader' : 
                     key === 'inventoryControllers' ? 'inventoryController' : 
                     'staff';
        db.users[item.username] = {
          username: item.username,
          password: item.password,
          role: role,
          name: item.name || item.fullName || 'User',
          email: item.email || '',
          phone: item.phone || ''
        };
        console.log(`✅ Created ${role} user: ${item.username} (${item.name || item.fullName})`);
      }
      
      // post-create hooks
      if (key === 'jobs') {
        // initialize defaults
        item.status = item.status || 'assigned';
        item.history = Array.isArray(item.history) ? item.history : [];
        item.history.push({ status: item.status, at: new Date().toISOString() });
        item.requirementsAcknowledged = !!item.requirementsAcknowledged;
        item.bills = Array.isArray(item.bills) ? item.bills : [];
        // Create notifications for new job
        if (!db.notifications) db.notifications = [];
        
        const jobTitle = `New Job Assigned: #${item.id} - ${item.clientName || 'Client'}`;
        const jobMessage = `A new job has been assigned to ${item.teamLeader || 'Team Leader'}. Job details: ${item.fromAddress || 'From'} to ${item.toAddress || 'To'}`;
        
        // Notify assigned team leader
        if (item.teamLeader) {
          const teamLeaderNotification = {
            id: Date.now() + Math.random(),
            recipient: item.teamLeader,
            recipientName: item.teamLeader,
            title: jobTitle,
            message: jobMessage,
            type: 'job-assigned',
            createdBy: 'system',
            createdAt: new Date().toISOString(),
            readBy: []
          };
          db.notifications.push(teamLeaderNotification);
        }
        
        // Notify all supervisors about new job
        const supervisors = db.supervisors || [];
        supervisors.forEach(supervisor => {
          const supervisorNotification = {
            id: Date.now() + Math.random() + Math.random(),
            recipient: supervisor.username,
            recipientName: supervisor.name,
            title: `New Job Created: #${item.id}`,
            message: `A new job has been created and assigned to ${item.teamLeader || 'Team Leader'}. Client: ${item.clientName || 'N/A'}`,
            type: 'job-created',
            createdBy: 'system',
            createdAt: new Date().toISOString(),
            readBy: []
          };
          db.notifications.push(supervisorNotification);
        });
        
        console.log(`📢 Job #${item.id} created - Notifications sent to team leader and ${supervisors.length} supervisors`);
      }
      // sync users for people collections
      if (['supervisors', 'teamLeaders', 'staff', 'inventoryControllers'].includes(key)) {
        if (item.username) {
          const role = key === 'staff' ? 'staff' : 
                       key === 'teamLeaders' ? 'teamLeader' : 
                       key === 'inventoryControllers' ? 'inventoryController' : 
                       'supervisor';
          db.users[item.username] = { 
            username: item.username, 
            password: item.password, 
            role: role, 
            name: item.name,
            phone: item.phone || '',
            email: item.email || '',
            profileImage: item.profileImage || ''
          };
        }
      }
      
      // Handle inventory deduction when creating job with packingMaterials
      if (key === 'jobs' && item.packingMaterials && Array.isArray(item.packingMaterials) && item.packingMaterials.length > 0) {
        if (!db.inventory) {
          db.inventory = { materials: [], transactions: [], pendingCollections: [] };
        }
        
        // Check stock availability and deduct
        for (const mat of item.packingMaterials) {
          const material = db.inventory.materials.find(m => m.id === mat.id);
          if (!material) {
            console.warn(`Material with id ${mat.id} not found in inventory`);
            continue;
          }
          
          const quantity = parseInt(mat.quantity) || 0;
          if (quantity <= 0) continue;
          
          // Check if enough stock (unless admin/inventoryController - they can override)
          const user = db.users[req.body.username] || db.users['admin']; // Default to admin if not specified
          if (!user || (user.role !== 'admin' && user.role !== 'inventoryController')) {
            if (material.quantity < quantity) {
              return res.status(400).json({ 
                error: `Insufficient stock for ${material.name}. Available: ${material.quantity}, Required: ${quantity}` 
              });
            }
          }
          
          // Deduct from inventory
          const oldQuantity = material.quantity;
          material.quantity -= quantity;
          
          // Log transaction
          db.inventory.transactions.push({
            id: Date.now() + Math.random(),
            type: 'assignment',
            materialId: mat.id,
            materialName: material.name,
            quantity: -quantity,
            projectId: item.id,
            performedBy: user ? user.username : 'system',
            performedByName: user ? user.name : 'System',
            timestamp: new Date().toISOString(),
            notes: `Assigned to project #${item.id}`
          });
          
          console.log(`📦 Material ${material.name}: ${oldQuantity} → ${material.quantity} (assigned ${quantity} to project #${item.id})`);
        }
      }
      
      writeDb(db);
      res.status(201).json(item);
    } catch (error) {
      console.error(`Error creating ${key}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

function updateRoute(key, idField = 'id') {
  return (req, res) => {
    try {
      const db = readDb();
      const id = String(req.params.id);
      const idx = db[key].findIndex(x => String(x[idField]) === id);
      if (idx === -1) return res.status(404).json({ error: 'Not found' });
      const old = db[key][idx];
      const updated = { ...old, ...req.body };
      
      // Handle inventory deduction when updating job with packingMaterials
      if (key === 'jobs' && updated.packingMaterials && Array.isArray(updated.packingMaterials)) {
        if (!db.inventory) {
          db.inventory = { materials: [], transactions: [], pendingCollections: [] };
        }
        
        const oldMaterials = old.packingMaterials || [];
        const newMaterials = updated.packingMaterials || [];
        
        // First, restore old materials back to inventory
        for (const oldMat of oldMaterials) {
          const material = db.inventory.materials.find(m => m.id === oldMat.id);
          if (!material) continue;
          
          const oldQuantity = parseInt(oldMat.quantity) || 0;
          if (oldQuantity <= 0) continue;
          
          // Restore quantity back to inventory
          material.quantity += oldQuantity;
          
          // Log transaction for restoration
          db.inventory.transactions.push({
            id: Date.now() + Math.random(),
            type: 'return',
            materialId: oldMat.id,
            materialName: material.name,
            quantity: oldQuantity,
            projectId: id,
            performedBy: req.body.username || 'system',
            performedByName: req.body.username || 'System',
            timestamp: new Date().toISOString(),
            notes: `Returned from project #${id} (update)`
          });
        }
        
        // Now deduct new materials from inventory
        for (const newMat of newMaterials) {
          const material = db.inventory.materials.find(m => m.id === newMat.id);
          if (!material) {
            console.warn(`Material with id ${newMat.id} not found in inventory`);
            continue;
          }
          
          const newQuantity = parseInt(newMat.quantity) || 0;
          if (newQuantity <= 0) continue;
          
          // Check if enough stock (unless admin/inventoryController - they can override)
          const user = db.users[req.body.username] || db.users['admin']; // Default to admin if not specified
          if (!user || (user.role !== 'admin' && user.role !== 'inventoryController')) {
            if (material.quantity < newQuantity) {
              // Restore already returned materials if insufficient stock
              for (const oldMat of oldMaterials) {
                const mat = db.inventory.materials.find(m => m.id === oldMat.id);
                if (mat) {
                  const oldQty = parseInt(oldMat.quantity) || 0;
                  mat.quantity -= oldQty; // Reverse the restoration
                }
              }
              return res.status(400).json({ 
                error: `Insufficient stock for ${material.name}. Available: ${material.quantity}, Required: ${newQuantity}` 
              });
            }
          }
          
          // Deduct from inventory
          const oldQuantity = material.quantity;
          material.quantity -= newQuantity;
          
          // Log transaction
          db.inventory.transactions.push({
            id: Date.now() + Math.random(),
            type: 'assignment',
            materialId: newMat.id,
            materialName: material.name,
            quantity: -newQuantity,
            projectId: id,
            performedBy: user ? user.username : 'system',
            performedByName: user ? user.name : 'System',
            timestamp: new Date().toISOString(),
            notes: `Assigned to project #${id} (update)`
          });
          
          console.log(`📦 Material ${material.name}: ${oldQuantity} → ${material.quantity} (assigned ${newQuantity} to project #${id})`);
        }
      }
      
      db[key][idx] = updated;
      if (['supervisors', 'teamLeaders', 'staff', 'inventoryControllers'].includes(key)) {
        if (old.username && db.users[old.username] && old.username !== updated.username) {
          delete db.users[old.username];
        }
        const role = key === 'staff' ? 'staff' : 
                     key === 'teamLeaders' ? 'teamLeader' : 
                     key === 'inventoryControllers' ? 'inventoryController' : 
                     'supervisor';
        db.users[updated.username] = {
          username: updated.username,
          password: updated.password || db.users[updated.username]?.password || old.password,
          role: role,
          name: updated.name
        };
      }
      writeDb(db);
      res.json(updated);
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

function deleteRoute(key, idField = 'id') {
  return (req, res) => {
    const db = readDb();
    const id = String(req.params.id);
    const idx = db[key].findIndex(x => String(x[idField]) === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const [removed] = db[key].splice(idx, 1);
    if (['supervisors', 'teamLeaders', 'staff', 'inventoryControllers'].includes(key) && removed?.username) {
      delete db.users[removed.username];
    }
    writeDb(db);
    res.json({ ok: true });
  };
}

// Jobs
app.get('/api/jobs', listRoute('jobs'));
app.get('/api/jobs/:id', (req, res) => {
  const db = readDb();
  const id = String(req.params.id);
  const job = db.jobs.find(j => String(j.id) === id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});
app.post('/api/jobs', createRoute('jobs', 'id'));
app.put('/api/jobs', (req, res) => {
  const db = readDb();
  db.jobs = req.body;
  writeDb(db);
  res.json({ success: true });
});
app.put('/api/jobs/:id', updateRoute('jobs', 'id'));
app.delete('/api/jobs/:id', deleteRoute('jobs', 'id'));

// Job status transitions (acknowledge endpoint kept for backward compatibility but not used in new flow)

app.post('/api/jobs/:id/status', (req, res) => {
  const db = readDb();
  const id = String(req.params.id);
  const { status, image, notes } = req.body || {};
  const allowed = new Set(['assigned', 'arrived', 'packing-start', 'first-location-completed', 'arrived-second-location', 'unpacking-start', 'waiting-approval', 'completed', 'delayed']);
  if (!allowed.has(status)) return res.status(400).json({ error: 'Invalid status' });
  const job = db.jobs.find(j => String(j.id) === id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  job.status = status;
  job.history = job.history || [];
  job.history.push({ 
    status, 
    at: new Date().toISOString(),
    image: image || null,
    notes: notes || null
  });
  writeDb(db);
  res.json(job);
});

// Approvals
app.post('/api/jobs/:id/submit-completion', (req, res) => {
  const db = readDb();
  const id = String(req.params.id);
  const job = db.jobs.find(j => String(j.id) === id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  job.status = 'waiting-approval';
  job.completionData = req.body;
  writeDb(db);
  res.json(job);
});

app.post('/api/jobs/:id/complete', (req, res) => {
  const db = readDb();
  const id = String(req.params.id);
  const { rating, signature, notes, tipAmount, boxesCollected, boxesCount, materialsCollected, materialsCollectedList } = req.body || {};
  const job = db.jobs.find(j => String(j.id) === id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  
  // Handle both old format (boxesCollected) and new format (materialsCollected)
  const materialsToCollect = materialsCollectedList || 
                             (materialsCollected === true || materialsCollected === 'yes' ? [] : []);
  
  job.status = 'waiting-approval';
  job.completionData = {
    rating: rating || 0,
    signature: signature || null,
    notes: notes || '',
    tipAmount: tipAmount || 0,
    boxesCollected: boxesCollected || 'no', // Keep for backward compatibility
    boxesCount: boxesCount || 0, // Keep for backward compatibility
    materialsCollected: materialsCollected || false,
    materialsCollectedList: materialsToCollect, // Array of {id, name, quantity}
    completedAt: new Date().toISOString()
  };
  
  // If materials need to be collected, create pending collection
  if (materialsCollected === true || materialsCollected === 'yes') {
    if (materialsToCollect && Array.isArray(materialsToCollect) && materialsToCollect.length > 0) {
      if (!db.inventory) {
        db.inventory = { materials: [], transactions: [], pendingCollections: [] };
      }
      
      const collection = {
        id: Date.now() + Math.random(),
        projectId: id,
        projectName: job.projectName || job.clientName || `Project #${id}`,
        materials: materialsToCollect,
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: job.teamLeader || 'system'
      };
      
      db.inventory.pendingCollections.push(collection);
      
      // Notify inventory controllers
      const inventoryControllers = db.inventoryControllers || [];
      if (!db.notifications) db.notifications = [];
      
      inventoryControllers.forEach(ic => {
        const notification = {
          id: Date.now() + Math.random(),
          recipient: ic.username,
          recipientName: ic.name,
          title: `Materials to Collect: Project #${id}`,
          message: `Project #${id} completed. ${materialsToCollect.length} material(s) need to be collected.`,
          type: 'inventory-collection',
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          readBy: []
        };
        db.notifications.push(notification);
      });
      
      console.log(`📦 Pending collection created for project #${id}: ${materialsToCollect.length} material(s)`);
    } else {
      // If materialsCollected is true but no list provided, check if job has packingMaterials
      const assignedMaterials = job.packingMaterials || [];
      if (assignedMaterials.length > 0) {
        // Use assigned materials as default collection list
        const defaultCollection = assignedMaterials.map(m => ({
          id: m.id,
          name: m.name || 'Unknown Material',
          quantity: m.quantity || 0
        }));
        
        const collection = {
          id: Date.now() + Math.random(),
          projectId: id,
          projectName: job.projectName || job.clientName || `Project #${id}`,
          materials: defaultCollection,
          status: 'pending',
          createdAt: new Date().toISOString(),
          createdBy: job.teamLeader || 'system'
        };
        
        if (!db.inventory) {
          db.inventory = { materials: [], transactions: [], pendingCollections: [] };
        }
        db.inventory.pendingCollections.push(collection);
        
        // Notify inventory controllers
        const inventoryControllers = db.inventoryControllers || [];
        if (!db.notifications) db.notifications = [];
        
        inventoryControllers.forEach(ic => {
          const notification = {
            id: Date.now() + Math.random(),
            recipient: ic.username,
            recipientName: ic.name,
            title: `Materials to Collect: Project #${id}`,
            message: `Project #${id} completed. ${defaultCollection.length} material(s) need to be collected.`,
            type: 'inventory-collection',
            createdBy: 'system',
            createdAt: new Date().toISOString(),
            readBy: []
          };
          db.notifications.push(notification);
        });
      }
    }
  }
  
  // Add to history
  job.history = job.history || [];
  job.history.push({ 
    status: 'waiting-approval', 
    at: new Date().toISOString(),
    notes: 'Job completed and submitted for approval',
    completionData: job.completionData
  });
  
  writeDb(db);
  res.json(job);
});

app.post('/api/jobs/:id/approve', (req, res) => {
  const db = readDb();
  const id = String(req.params.id);
  const job = db.jobs.find(j => String(j.id) === id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  job.status = 'completed';
  job.completedDate = new Date().toISOString();
  const tl = db.teamLeaders.find(t => t.name === job.teamLeader);
  if (tl) tl.jobsCompleted = (tl.jobsCompleted || 0) + 1;
  writeDb(db);
  res.json(job);
});

// Bills - Attach bill to job
app.post('/api/jobs/:id/bills', (req, res) => {
  try {
    const db = readDb();
    const id = String(req.params.id);
    const job = db.jobs.find(j => String(j.id) === id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    const billData = req.body;
    if (!billData.description || !billData.amount || !billData.fileUrl) {
      return res.status(400).json({ error: 'Missing required bill fields' });
    }
    
    // Initialize bills array if it doesn't exist
    if (!job.bills) {
      job.bills = [];
    }
    
    // Add bill to job
    const bill = {
      id: Date.now(), // Simple ID generation
      description: billData.description,
      amount: parseFloat(billData.amount),
      fileUrl: billData.fileUrl,
      notes: billData.notes || '',
      attachedBy: billData.attachedBy || 'admin',
      attachedAt: billData.attachedAt || new Date().toISOString(),
      date: billData.date || new Date().toISOString()
    };
    job.bills.push(bill);
    
    writeDb(db);
    res.json({ success: true, bill: bill, job: job });
  } catch (error) {
    console.error('Error attaching bill:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bills for a job
app.get('/api/jobs/:id/bills', (req, res) => {
  const db = readDb();
  const id = String(req.params.id);
  const job = db.jobs.find(j => String(j.id) === id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job.bills || []);
});

// Delete item image from job (Admin only - checked in frontend)
app.delete('/api/jobs/:id/images/:imageIndex', (req, res) => {
  try {
    const db = readDb();
    const id = String(req.params.id);
    const imageIndex = parseInt(req.params.imageIndex);
    const job = db.jobs.find(j => String(j.id) === id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (!job.itemImages || !Array.isArray(job.itemImages)) {
      return res.status(400).json({ error: 'No images found for this job' });
    }
    
    if (imageIndex < 0 || imageIndex >= job.itemImages.length) {
      return res.status(400).json({ error: 'Invalid image index' });
    }
    
    // Remove the image from the array
    const deletedImage = job.itemImages.splice(imageIndex, 1);
    
    writeDb(db);
    
    res.json({ 
      success: true, 
      message: 'Image deleted successfully',
      deletedImage: deletedImage[0],
      remainingImages: job.itemImages
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Users (admin/profile) - minimal API for updating a user in users map
app.get('/api/users', (req, res) => {
  const db = readDb();
  res.json(db.users);
});

app.get('/api/users/:username', (req, res) => {
  const db = readDb();
  const username = String(req.params.username);
  const user = db.users[username];
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

app.put('/api/users/:username', (req, res) => {
  const db = readDb();
  const username = String(req.params.username);
  const existing = db.users[username];
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const updates = req.body || {};
  const updated = { ...existing, ...updates };
  db.users[username] = updated;
  writeDb(db);
  res.json(updated);
});

app.put('/api/users', (req, res) => {
  try {
    const db = readDb();
    const incoming = req.body || {};
    // Merge incoming users onto existing to avoid accidentally removing accounts (e.g., admin)
    db.users = { ...(db.users || {}), ...incoming };
    // Ensure admin user always exists
    if (!db.users.admin) {
      db.users.admin = {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'Admin User',
        email: db.users.admin?.email || 'admin@moveit247.com',
        phone: db.users.admin?.phone || ''
      };
    }
    writeDb(db);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save users:', error);
    res.status(500).json({ error: 'Failed to save users' });
  }
});

// People collections
app.get('/api/supervisors', listRoute('supervisors'));
app.post('/api/supervisors', createRoute('supervisors'));
app.put('/api/supervisors', (req, res) => {
  const db = readDb();
  db.supervisors = req.body;
  writeDb(db);
  res.json({ success: true });
});
app.put('/api/supervisors/:id', updateRoute('supervisors'));
app.delete('/api/supervisors/:id', deleteRoute('supervisors'));

app.get('/api/teamleaders', listRoute('teamLeaders'));
app.post('/api/teamleaders', createRoute('teamLeaders'));
app.put('/api/teamleaders', (req, res) => {
  const db = readDb();
  db.teamLeaders = req.body;
  writeDb(db);
  res.json({ success: true });
});
app.put('/api/teamleaders/:id', updateRoute('teamLeaders'));
app.delete('/api/teamleaders/:id', deleteRoute('teamLeaders'));

app.get('/api/staff', listRoute('staff'));
app.post('/api/staff', createRoute('staff'));
app.put('/api/staff', (req, res) => {
  const db = readDb();
  db.staff = req.body;
  writeDb(db);
  res.json({ success: true });
});
app.put('/api/staff/:id', updateRoute('staff'));
app.delete('/api/staff/:id', deleteRoute('staff'));

app.get('/api/inventorycontrollers', listRoute('inventoryControllers'));
app.post('/api/inventorycontrollers', createRoute('inventoryControllers'));
app.put('/api/inventorycontrollers', (req, res) => {
  const db = readDb();
  db.inventoryControllers = req.body;
  writeDb(db);
  res.json({ success: true });
});
app.put('/api/inventorycontrollers/:id', updateRoute('inventoryControllers'));
app.delete('/api/inventorycontrollers/:id', deleteRoute('inventoryControllers'));

// Surveys
app.get('/api/surveys', listRoute('surveys'));
app.post('/api/surveys', createRoute('surveys', 'id'));
app.put('/api/surveys', (req, res) => {
  const db = readDb();
  db.surveys = req.body;
  writeDb(db);
  res.json({ success: true });
});
app.put('/api/surveys/:id', updateRoute('surveys', 'id'));
app.delete('/api/surveys/:id', deleteRoute('surveys', 'id'));

// Zoho Survey API - Fetch surveys from Zoho Survey
app.get('/api/zoho/surveys', async (req, res) => {
  try {
    // Check if Zoho is configured
    if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
      return res.status(400).json({ 
        error: 'Zoho not configured',
        message: 'Please configure Zoho credentials in environment variables'
      });
    }

    const accessToken = await getZohoAccessToken();
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Failed to get Zoho access token'
      });
    }

    // Zoho Survey API - List surveys
    // Note: Zoho Survey API endpoint may vary. This is a common pattern.
    // You may need to adjust based on your Zoho Survey API version
    const zohoSurveyApiUrl = `https://surveys.zoho.com/api/v1/surveys`;
    
    const response = await fetch(zohoSurveyApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zoho Survey API error:', errorText);
      
      // If the endpoint doesn't exist, try alternative endpoint pattern
      // Some Zoho Survey APIs use different endpoints
      const altUrl = `https://surveys.zoho.${ZOHO_REGION}/api/v1/surveys`;
      const altResponse = await fetch(altUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!altResponse.ok) {
        return res.status(altResponse.status).json({ 
          error: 'Failed to fetch surveys from Zoho',
          message: 'Zoho Survey API endpoint not accessible. Please check API configuration.',
          details: await altResponse.text().catch(() => 'Unknown error')
        });
      }

      const altData = await altResponse.json();
      const surveys = Array.isArray(altData.surveys) ? altData.surveys : 
                     Array.isArray(altData.data) ? altData.data : 
                     Array.isArray(altData) ? altData : [];

      return res.json({ 
        success: true, 
        surveys: surveys.map(s => ({
          survey_id: s.survey_id || s.id || s.surveyId,
          survey_name: s.survey_name || s.name || s.title || 'Untitled Survey',
          response_id: s.response_id || s.id,
          created_at: s.created_at || s.createdAt || s.date_created,
          status: s.status || 'active'
        }))
      });
    }

    const data = await response.json();
    const surveys = Array.isArray(data.surveys) ? data.surveys : 
                   Array.isArray(data.data) ? data.data : 
                   Array.isArray(data) ? data : [];

    res.json({ 
      success: true, 
      surveys: surveys.map(s => ({
        survey_id: s.survey_id || s.id || s.surveyId,
        survey_name: s.survey_name || s.name || s.title || 'Untitled Survey',
        response_id: s.response_id || s.id,
        created_at: s.created_at || s.createdAt || s.date_created,
        status: s.status || 'active'
      }))
    });
  } catch (error) {
    console.error('Error fetching Zoho surveys:', error);
    res.status(500).json({ 
      error: 'Failed to fetch surveys from Zoho',
      message: error.message 
    });
  }
});

// Complete survey endpoint
app.post('/api/surveys/:id/complete', async (req, res) => {
  try {
    const db = readDb();
    const id = String(req.params.id);
    const survey = db.surveys.find(s => String(s.id) === id);
    if (!survey) return res.status(404).json({ error: 'Survey not found' });
    
    const { images, comments, clientInstructions, packingList } = req.body || {};
    
    survey.status = 'completed';
    survey.completedAt = new Date().toISOString();
    survey.surveyData = {
      images: Array.isArray(images) ? images : [],
      comments: comments || '',
      clientInstructions: clientInstructions || ''
    };
    
    // Add packing list data if provided
    if (packingList) {
      survey.packingList = packingList;
      // Auto-assign S.No. if not set
      if (!packingList.serialNo) {
        survey.packingList.serialNo = db.packingListSerialNo || 1001;
        db.packingListSerialNo = (db.packingListSerialNo || 1001) + 1;
      }
    }
    
    writeDb(db);
    
    // Submit survey to Zoho CRM (async, non-blocking)
    submitSurveyToZoho(survey, packingList).then(result => {
      if (result.success) {
        console.log('✅ Survey successfully submitted to Zoho CRM');
      } else {
        console.log(`⚠️  Zoho CRM submission skipped: ${result.reason}`);
      }
    }).catch(err => {
      console.error('Error in Zoho submission:', err);
    });
    
    res.json(survey);
  } catch (error) {
    console.error('Error completing survey:', error);
    res.status(500).json({ error: 'Failed to complete survey' });
  }
});

// Branding endpoints
app.get('/api/branding', (req, res) => {
  try {
    const db = readDb();
    res.json(db.branding || { logoUrl: '' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read branding' });
  }
});

app.put('/api/branding', (req, res) => {
  try {
    const db = readDb();
    const { logoUrl } = req.body || {};
    db.branding = { logoUrl: logoUrl || '' };
    writeDb(db);
    res.json({ success: true, branding: db.branding });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update branding' });
  }
});

// Item Catalog Management
app.get('/api/item-catalog', (req, res) => {
  try {
    const db = readDb();
    res.json(db.itemCatalog || []);
  } catch (error) {
    console.error('Error fetching item catalog:', error);
    res.status(500).json({ error: 'Failed to fetch item catalog' });
  }
});

app.put('/api/item-catalog', (req, res) => {
  try {
    const db = readDb();
    db.itemCatalog = Array.isArray(req.body) ? req.body : [];
    writeDb(db);
    res.json({ success: true, catalog: db.itemCatalog });
  } catch (error) {
    console.error('Error updating item catalog:', error);
    res.status(500).json({ error: 'Failed to update item catalog' });
  }
});

// Inventory Management APIs
app.get('/api/inventory', (req, res) => {
  try {
    const db = readDb();
    if (!db.inventory) {
      db.inventory = { materials: [], transactions: [], pendingCollections: [] };
      writeDb(db);
    }
    res.json(db.inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.put('/api/inventory/materials', (req, res) => {
  try {
    const db = readDb();
    const { username } = req.query;
    const user = db.users[username];
    
    // Only admin and inventoryController can update materials
    if (!user || (user.role !== 'admin' && user.role !== 'inventoryController')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!db.inventory) {
      db.inventory = { materials: [], transactions: [], pendingCollections: [] };
    }
    db.inventory.materials = Array.isArray(req.body) ? req.body : [];
    writeDb(db);
    res.json({ success: true, materials: db.inventory.materials });
  } catch (error) {
    console.error('Error updating inventory materials:', error);
    res.status(500).json({ error: 'Failed to update inventory materials' });
  }
});

// Assign materials to project - automatically deduct from inventory
app.post('/api/inventory/assign', (req, res) => {
  try {
    const db = readDb();
    const { username, projectId, materials } = req.body; // materials: [{id, quantity, materialType: 'new'|'old'}, ...]
    
    if (!projectId || !Array.isArray(materials)) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    
    if (!db.inventory) {
      db.inventory = { materials: [], transactions: [], pendingCollections: [] };
    }
    
    // Ensure all materials have quantityNew and quantityOld (migration)
    db.inventory.materials.forEach(m => {
      if (m.quantityNew === undefined) m.quantityNew = 0;
      if (m.quantityOld === undefined) m.quantityOld = 0;
      // Update total quantity if not in sync
      m.quantity = (m.quantityNew || 0) + (m.quantityOld || 0);
    });
    
    // Check stock availability and deduct
    const updates = [];
    for (const mat of materials) {
      const material = db.inventory.materials.find(m => m.id === mat.id);
      if (!material) {
        return res.status(400).json({ error: `Material with id ${mat.id} not found` });
      }
      
      const quantity = parseInt(mat.quantity) || 0;
      if (quantity < 0) {
        return res.status(400).json({ error: 'Quantity cannot be negative' });
      }
      
      if (quantity === 0) continue; // Skip zero quantities
      
      // Determine material type (old or new)
      const materialType = mat.materialType || 'new'; // Default to 'new' if not specified
      const isOld = materialType === 'old';
      
      // Check availability in the specific pool (old or new)
      const availableInPool = isOld ? (material.quantityOld || 0) : (material.quantityNew || 0);
      const totalAvailable = (material.quantityNew || 0) + (material.quantityOld || 0);
      
      // Check if enough stock (unless admin/inventoryController/supervisor)
      const user = db.users[username];
      if (!user || (user.role !== 'admin' && user.role !== 'inventoryController' && user.role !== 'supervisor')) {
        if (availableInPool < quantity && totalAvailable < quantity) {
          return res.status(400).json({ 
            error: `Insufficient stock for ${material.name}. Available ${isOld ? 'old' : 'new'}: ${availableInPool}, Total: ${totalAvailable}, Required: ${quantity}` 
          });
        }
      }
      
      // Deduct from appropriate pool
      const oldQuantityNew = material.quantityNew || 0;
      const oldQuantityOld = material.quantityOld || 0;
      
      if (isOld) {
        // Try to deduct from old first, then from new if needed
        if (material.quantityOld >= quantity) {
          material.quantityOld -= quantity;
        } else {
          const remaining = quantity - material.quantityOld;
          material.quantityOld = 0;
          material.quantityNew = Math.max(0, (material.quantityNew || 0) - remaining);
        }
      } else {
        // Try to deduct from new first, then from old if needed
        if (material.quantityNew >= quantity) {
          material.quantityNew -= quantity;
        } else {
          const remaining = quantity - material.quantityNew;
          material.quantityNew = 0;
          material.quantityOld = Math.max(0, (material.quantityOld || 0) - remaining);
        }
      }
      
      // Update total quantity
      material.quantity = (material.quantityNew || 0) + (material.quantityOld || 0);
      
      // Log transaction
      db.inventory.transactions.push({
        id: Date.now() + Math.random(),
        type: 'assignment',
        materialId: mat.id,
        materialName: material.name,
        quantity: -quantity,
        materialType: materialType,
        projectId: projectId,
        performedBy: username,
        performedByName: user ? user.name : 'System',
        timestamp: new Date().toISOString(),
        notes: `Assigned to project #${projectId} (${materialType})`
      });
      
      updates.push({ material, oldQuantity: totalAvailable });
    }
    
    writeDb(db);
    res.json({ success: true, materials: db.inventory.materials, updates });
  } catch (error) {
    console.error('Error assigning materials:', error);
    res.status(500).json({ error: 'Failed to assign materials' });
  }
});

// Return materials to inventory
app.post('/api/inventory/return', (req, res) => {
  try {
    const db = readDb();
    const { username, projectId, materials, notes } = req.body;
    
    const user = db.users[username];
    if (!user || (user.role !== 'admin' && user.role !== 'inventoryController')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!Array.isArray(materials)) {
      return res.status(400).json({ error: 'Invalid materials array' });
    }
    
    if (!db.inventory) {
      db.inventory = { materials: [], transactions: [], pendingCollections: [] };
    }
    
    const updates = [];
    for (const mat of materials) {
      const material = db.inventory.materials.find(m => m.id === mat.id);
      if (!material) {
        continue; // Skip if material not found
      }
      
      const quantity = parseInt(mat.quantity) || 0;
      if (quantity <= 0) continue;
      
      // Ensure material has quantityNew and quantityOld
      if (material.quantityNew === undefined) material.quantityNew = 0;
      if (material.quantityOld === undefined) material.quantityOld = 0;
      
      // Add back to old inventory (returned materials)
      material.quantityOld = (material.quantityOld || 0) + quantity;
      material.quantity = (material.quantityNew || 0) + (material.quantityOld || 0);
      
      // Log transaction
      db.inventory.transactions.push({
        id: Date.now() + Math.random(),
        type: 'return',
        materialId: mat.id,
        materialName: material.name,
        quantity: quantity,
        materialType: 'old',
        projectId: projectId || null,
        performedBy: username,
        performedByName: user.name,
        timestamp: new Date().toISOString(),
        notes: notes || `Returned from project #${projectId || 'N/A'} (added to old inventory)`
      });
      
      updates.push({ material });
    }
    
    writeDb(db);
    res.json({ success: true, materials: db.inventory.materials, updates });
  } catch (error) {
    console.error('Error returning materials:', error);
    res.status(500).json({ error: 'Failed to return materials' });
  }
});

// Get pending collections
app.get('/api/inventory/pending-collections', (req, res) => {
  try {
    const db = readDb();
    const { username } = req.query;
    const user = db.users[username];
    
    if (!user || (user.role !== 'admin' && user.role !== 'inventoryController')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!db.inventory) {
      db.inventory = { materials: [], transactions: [], pendingCollections: [] };
    }
    
    res.json(db.inventory.pendingCollections || []);
  } catch (error) {
    console.error('Error fetching pending collections:', error);
    res.status(500).json({ error: 'Failed to fetch pending collections' });
  }
});

// Mark collection as received and add to inventory
app.post('/api/inventory/collections/:collectionId/receive', (req, res) => {
  try {
    const db = readDb();
    const { collectionId } = req.params;
    const { username } = req.body;
    
    const user = db.users[username];
    if (!user || (user.role !== 'admin' && user.role !== 'inventoryController')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!db.inventory) {
      db.inventory = { materials: [], transactions: [], pendingCollections: [] };
    }
    
    const collection = db.inventory.pendingCollections.find(c => String(c.id) === String(collectionId));
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    if (collection.status === 'received') {
      return res.status(400).json({ error: 'Collection already received' });
    }
    
    // Add materials to inventory (as old/recycled materials)
    if (collection.materials && Array.isArray(collection.materials)) {
      for (const mat of collection.materials) {
        const material = db.inventory.materials.find(m => m.id === mat.id);
        if (material) {
          // Ensure material has quantityNew and quantityOld
          if (material.quantityNew === undefined) material.quantityNew = 0;
          if (material.quantityOld === undefined) material.quantityOld = 0;
          
          const quantity = parseInt(mat.quantity) || 0;
          
          // Add to old inventory (returned/recycled materials)
          material.quantityOld = (material.quantityOld || 0) + quantity;
          material.quantity = (material.quantityNew || 0) + (material.quantityOld || 0);
          
          // Log transaction
          db.inventory.transactions.push({
            id: Date.now() + Math.random(),
            type: 'collection',
            materialId: mat.id,
            materialName: material.name,
            quantity: quantity,
            materialType: 'old',
            projectId: collection.projectId,
            performedBy: username,
            performedByName: user.name,
            timestamp: new Date().toISOString(),
            notes: `Collected from completed project #${collection.projectId} (added to old inventory)`
          });
        }
      }
    }
    
    // Update collection status
    collection.status = 'received';
    collection.receivedBy = username;
    collection.receivedByName = user.name;
    collection.receivedAt = new Date().toISOString();
    
    writeDb(db);
    res.json({ success: true, collection, materials: db.inventory.materials });
  } catch (error) {
    console.error('Error receiving collection:', error);
    res.status(500).json({ error: 'Failed to receive collection' });
  }
});

// Get inventory transactions
app.get('/api/inventory/transactions', (req, res) => {
  try {
    const db = readDb();
    const { username } = req.query;
    const user = db.users[username];
    
    if (!user || (user.role !== 'admin' && user.role !== 'inventoryController')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!db.inventory) {
      db.inventory = { materials: [], transactions: [], pendingCollections: [] };
    }
    
    res.json(db.inventory.transactions || []);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Universal file storage system
let fileStorage = new Map(); // In-memory file storage for platforms without file system

// Uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const filename = `${Date.now()}-${nanoid(8)}${path.extname(req.file.originalname) || '.bin'}`;
    
    if (useFileSystem) {
      // Save to file system if available
      const dest = path.join(__dirname, 'uploads');
      fs.mkdirSync(dest, { recursive: true });
      fs.writeFileSync(path.join(dest, filename), req.file.buffer);
      const publicUrl = `/uploads/${filename}`;
      res.json({ url: publicUrl });
    } else {
      // Store in memory for platforms without file system
      fileStorage.set(filename, {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname
      });
      const publicUrl = `/api/file/${filename}`;
      res.json({ url: publicUrl });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Serve files from memory storage
app.get('/api/file/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const file = fileStorage.get(filename);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${file.originalname}"`);
    res.send(file.buffer);
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ error: 'File serve failed' });
  }
});

// Notifications - moved to proper location below

// Mark notification as read - moved to proper location below

// Live Tracking APIs - Admin only
app.get('/api/tracking', (req, res) => {
  try {
    const db = readDb();
    const { username } = req.query;
    
    // Only admin can access tracking data
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }
    
    const user = db.users[username];
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const tracking = db.tracking || {};
    const teamLeaders = db.teamLeaders || [];
    const supervisors = db.supervisors || [];
    const staff = db.staff || [];
    const jobs = db.jobs || [];
    
    // Get all team leaders including promoted staff
    const allTeamLeaders = [
      ...teamLeaders.map(tl => ({ ...tl, isPromoted: false, type: 'teamleader' })),
      ...staff.filter(s => s.isTeamLeader === true).map(s => ({ 
        username: s.username, 
        name: s.name, 
        isPromoted: true,
        type: 'teamleader'
      }))
    ];
    
    // Get all supervisors
    const allSupervisors = supervisors.map(sv => ({
      username: sv.username,
      name: sv.name,
      type: 'supervisor'
    }));
    
    // Combine team leaders and supervisors for tracking
    const allTrackableUsers = [...allTeamLeaders, ...allSupervisors];
    
    // Build tracking data
    const trackingData = allTrackableUsers.map(user => {
      const locationData = tracking[user.username] || {};
      
      // Find current active job for this user (only team leaders have active jobs)
      let activeJob = null;
      if (user.type === 'teamleader') {
        activeJob = jobs.find(j => 
          j.teamLeader === user.name && 
          ['assigned', 'arrived', 'packing-start', 'first-location-completed', 'arrived-second-location', 'unpacking-start'].includes(j.status)
        );
      }
      
      return {
        username: user.username,
        name: user.name,
        type: user.type,
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null,
        lastUpdate: locationData.lastUpdate || null,
        currentJob: activeJob ? activeJob.id : null,
        isPromoted: user.isPromoted || false
      };
    });
    
    res.json(trackingData);
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
});

app.post('/api/tracking', (req, res) => {
  try {
    const db = readDb();
    const { username, latitude, longitude } = req.body;
    
    if (!username || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Initialize tracking object if it doesn't exist
    if (!db.tracking) {
      db.tracking = {};
    }
    
    // Update team leader location
    db.tracking[username] = {
      latitude,
      longitude,
      lastUpdate: new Date().toISOString()
    };
    
    writeDb(db);
    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    console.error('Error updating tracking data:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Location update endpoint (alias for team leader location sharing)
app.post('/api/tracking/update', (req, res) => {
  try {
    const db = readDb();
    const { username, latitude, longitude, timestamp } = req.body;
    
    if (!username || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Initialize tracking object if it doesn't exist
    if (!db.tracking) {
      db.tracking = {};
    }
    
    // Update location for team leaders and supervisors (silent tracking)
    db.tracking[username] = {
      latitude,
      longitude,
      lastUpdate: timestamp || new Date().toISOString()
    };
    
    writeDb(db);
    // Log silently without user-identifying info in production
    console.log(`📍 Location updated: ${latitude}, ${longitude}`);
    res.json({ success: true, message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Notification APIs
// Get all notifications
app.get('/api/notifications', (req, res) => {
  try {
    const db = readDb();
    const notifications = db.notifications || [];
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Create new notification (admin only - checked in frontend)
app.post('/api/notifications', (req, res) => {
  try {
  const db = readDb();
    const { recipient, title, message, type, createdBy } = req.body;
    
    if (!recipient || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Initialize notifications array if it doesn't exist
    if (!db.notifications) {
      db.notifications = [];
    }
    
    // Handle "all" recipients
    if (recipient === 'all') {
      const allPeople = [
        ...db.supervisors || [],
        ...db.teamLeaders || [],
        ...db.staff || []
      ];
      
      const notifications = allPeople.map(person => ({
        id: Date.now() + Math.random(), // Ensure unique IDs
        recipient: person.username,
        recipientName: person.name,
        title,
        message,
        type: type || 'system',
        createdBy: createdBy || 'system',
        createdAt: new Date().toISOString(),
        readBy: []
      }));
      
      db.notifications.push(...notifications);
      writeDb(db);
      
      console.log(`📢 Notifications created: "${title}" for ${allPeople.length} people`);
      res.json({ 
        success: true, 
        count: notifications.length,
        message: `Notification sent to ${allPeople.length} people`
      });
    } else {
      // Single recipient
      let recipientName = recipient;
      const allPeople = [
        ...db.supervisors || [],
        ...db.teamLeaders || [],
        ...db.staff || []
      ];
      const person = allPeople.find(p => p.username === recipient);
      if (person) {
        recipientName = person.name;
      }
      
      // Create notification
      const notification = {
        id: Date.now() + Math.random(), // Ensure unique ID like bulk notifications
        recipient,
        recipientName,
        title,
        message,
        type: type || 'system',
        createdBy: createdBy || 'system',
        createdAt: new Date().toISOString(),
        readBy: []
      };
      
      db.notifications.push(notification);
      writeDb(db);
      
      console.log(`📢 Notification created: "${title}" for ${recipientName}`);
      res.json(notification);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Mark notification as read
app.post('/api/notifications/:id/read', (req, res) => {
  try {
  const db = readDb();
  const id = String(req.params.id);
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const notification = (db.notifications || []).find(n => String(n.id) === id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Initialize readBy array if it doesn't exist
    if (!notification.readBy) {
      notification.readBy = [];
    }
    
    // Add username to readBy if not already there
    if (!notification.readBy.includes(username)) {
      notification.readBy.push(username);
    }
    
  writeDb(db);
    console.log(`✅ Notification #${id} marked as read by ${username}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Initialize database system
const db = initDatabase();
// Ensure admin user exists at startup (in case of previous overwrites)
if (!db.users || !db.users.admin) {
  db.users = db.users || {};
  db.users.admin = {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    email: db.users.admin?.email || 'admin@moveit247.com',
    phone: db.users.admin?.phone || ''
  };
  writeDb(db);
}

// Migration: Fix existing users who can't login
function migrateExistingUsers() {
  const db = readDb();
  let migrated = 0;
  
  // Migrate supervisors
  if (db.supervisors && Array.isArray(db.supervisors)) {
    db.supervisors.forEach(supervisor => {
      if (supervisor.username && supervisor.password && !db.users[supervisor.username]) {
        db.users[supervisor.username] = {
          username: supervisor.username,
          password: supervisor.password,
          role: 'supervisor',
          name: supervisor.name || supervisor.fullName || 'Supervisor',
          email: supervisor.email || '',
          phone: supervisor.phone || ''
        };
        migrated++;
      }
    });
  }
  
  // Migrate team leaders
  if (db.teamLeaders && Array.isArray(db.teamLeaders)) {
    db.teamLeaders.forEach(teamLeader => {
      if (teamLeader.username && teamLeader.password && !db.users[teamLeader.username]) {
        db.users[teamLeader.username] = {
          username: teamLeader.username,
          password: teamLeader.password,
          role: 'teamLeader',
          name: teamLeader.name || teamLeader.fullName || 'Team Leader',
          email: teamLeader.email || '',
          phone: teamLeader.phone || ''
        };
        migrated++;
      }
    });
  }
  
  // Migrate staff
  if (db.staff && Array.isArray(db.staff)) {
    db.staff.forEach(staff => {
      if (staff.username && staff.password && !db.users[staff.username]) {
        db.users[staff.username] = {
          username: staff.username,
          password: staff.password,
          role: 'staff',
          name: staff.name || staff.fullName || 'Staff',
          email: staff.email || '',
          phone: staff.phone || ''
        };
        migrated++;
      }
    });
  }
  
  // Migrate inventory controllers
  if (db.inventoryControllers && Array.isArray(db.inventoryControllers)) {
    db.inventoryControllers.forEach(ic => {
      if (ic.username && ic.password && !db.users[ic.username]) {
        db.users[ic.username] = {
          username: ic.username,
          password: ic.password,
          role: 'inventoryController',
          name: ic.name || ic.fullName || 'Inventory Controller',
          email: ic.email || '',
          phone: ic.phone || ''
        };
        migrated++;
      }
    });
  }
  
  if (migrated > 0) {
    writeDb(db);
    console.log(`✅ Migrated ${migrated} existing users to login system`);
  }
}

// Run migration after a short delay to ensure database is ready
setTimeout(() => {
  migrateExistingUsers();
}, 1000);

app.listen(PORT, () => {
  console.log(`MoveIt247 API listening on http://localhost:${PORT}`);
  console.log(`🌐 Platform: ${useFileSystem ? 'File System' : 'Memory Only'}`);
  console.log(`💾 Database: ${useFileSystem ? 'db.json' : 'In-Memory'}`);
  console.log(`📁 File Storage: ${useFileSystem ? 'uploads/' : 'Memory'}`);
  console.log(`👥 Users: ${Object.keys(db.users || {}).length} | 📋 Jobs: ${(db.jobs || []).length} | 🔔 Notifications: ${(db.notifications || []).length}`);
});


