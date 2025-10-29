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

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve static frontend (index.html) from project root
app.use(express.static(__dirname));
app.get('/', (req, res) => {
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
    jobs: [],
    notifications: [],
    supervisors: [],
    teamLeaders: [],
    staff: [],
    tracking: {}
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
    const user = matchedKey ? db.users[matchedKey] : undefined;
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ user: { username: user.username, role: user.role, name: user.name, phone: user.phone || '', email: user.email || '', profileImage: user.profileImage || '' } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      if (['supervisors', 'teamLeaders', 'staff'].includes(key) && item.username) {
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
      if (['supervisors', 'teamLeaders', 'staff'].includes(key) && item.username && item.password) {
        const role = key === 'supervisors' ? 'supervisor' : key === 'teamLeaders' ? 'teamLeader' : 'staff';
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
      if (['supervisors', 'teamLeaders', 'staff'].includes(key)) {
        if (item.username) {
          db.users[item.username] = { 
            username: item.username, 
            password: item.password, 
            role: key === 'staff' ? 'staff' : key === 'teamLeaders' ? 'teamleader' : 'supervisor', 
            name: item.name,
            phone: item.phone || '',
            email: item.email || '',
            profileImage: item.profileImage || ''
          };
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
    const db = readDb();
    const id = String(req.params.id);
    const idx = db[key].findIndex(x => String(x[idField]) === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const old = db[key][idx];
    const updated = { ...old, ...req.body };
    db[key][idx] = updated;
    if (['supervisors', 'teamLeaders', 'staff'].includes(key)) {
      if (old.username && db.users[old.username] && old.username !== updated.username) {
        delete db.users[old.username];
      }
      db.users[updated.username] = {
        username: updated.username,
        password: updated.password || db.users[updated.username]?.password || old.password,
        role: key === 'staff' ? 'staff' : key === 'teamLeaders' ? 'teamleader' : 'supervisor',
        name: updated.name
      };
    }
    writeDb(db);
    res.json(updated);
  };
}

function deleteRoute(key, idField = 'id') {
  return (req, res) => {
    const db = readDb();
    const id = String(req.params.id);
    const idx = db[key].findIndex(x => String(x[idField]) === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const [removed] = db[key].splice(idx, 1);
    if (['supervisors', 'teamLeaders', 'staff'].includes(key) && removed?.username) {
      delete db.users[removed.username];
    }
    writeDb(db);
    res.json({ ok: true });
  };
}

// Jobs
app.get('/api/jobs', listRoute('jobs'));
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
  const { rating, signature, notes, tipAmount, boxesCollected, boxesCount } = req.body || {};
  const job = db.jobs.find(j => String(j.id) === id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  
  job.status = 'waiting-approval';
  job.completionData = {
    rating: rating || 0,
    signature: signature || null,
    notes: notes || '',
    tipAmount: tipAmount || 0,
    boxesCollected: boxesCollected || 'no',
    boxesCount: boxesCount || 0,
    completedAt: new Date().toISOString()
  };
  
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
    job.bills.push({
      id: Date.now(), // Simple ID generation
      description: billData.description,
      amount: parseFloat(billData.amount),
      fileUrl: billData.fileUrl,
      notes: billData.notes || '',
      attachedBy: billData.attachedBy,
      attachedAt: billData.attachedAt || new Date().toISOString()
    });
    
    writeDb(db);
    res.json(job);
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

// Live Tracking APIs
app.get('/api/tracking', (req, res) => {
  try {
    const db = readDb();
    const tracking = db.tracking || {};
    const teamLeaders = db.teamLeaders || [];
    const jobs = db.jobs || [];
    
    // Build tracking data with team leader info
    const trackingData = teamLeaders.map(tl => {
      const locationData = tracking[tl.username] || {};
      
      // Find current active job for this team leader
      const activeJob = jobs.find(j => 
        j.teamLeader === tl.name && 
        ['assigned', 'arrived', 'packing-start', 'first-location-completed', 'arrived-second-location', 'unpacking-start'].includes(j.status)
      );
      
      return {
        username: tl.username,
        name: tl.name,
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null,
        lastUpdate: locationData.lastUpdate || null,
        currentJob: activeJob ? activeJob.id : null
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
    
    // Update team leader location with timestamp
    db.tracking[username] = {
      latitude,
      longitude,
      lastUpdate: timestamp || new Date().toISOString()
    };
    
    writeDb(db);
    console.log(`📍 Location updated for ${username}: ${latitude}, ${longitude}`);
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
        id: Date.now(),
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


