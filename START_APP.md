# 🚀 How to Start the Application

## ⚠️ IMPORTANT: Always Use the Server!

**DO NOT** open `index.html` directly (file:// protocol)  
**DO** use `http://localhost:4000` after starting the server

## ✅ Correct Way to Start

1. **Open terminal in the project folder:**
   ```bash
   cd C:\Users\ahmad\Downloads\backend
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Wait for the message:**
   ```
   Server running on port 4000
   ```

4. **Open your browser and go to:**
   ```
   http://localhost:4000
   ```

5. **Login:**
   - Username: `admin`
   - Password: `admin123`

## ❌ Wrong Way (Will Cause CORS Errors)

- ❌ Opening `index.html` directly
- ❌ Using `file:///C:/Users/ahmad/Downloads/backend/index.html`
- ❌ Double-clicking `index.html`

## 🔍 How to Check if Server is Running

Open a new terminal and run:
```bash
# Check if port 4000 is in use
netstat -ano | findstr :4000
```

Or try accessing: http://localhost:4000

## 🛑 If Server Won't Start

1. **Check if port 4000 is already in use:**
   ```bash
   netstat -ano | findstr :4000
   ```

2. **Kill the process if needed:**
   - Find the PID from step 1
   - Run: `taskkill /PID <pid> /F`

3. **Try starting again:**
   ```bash
   npm start
   ```

## 📝 Quick Reference

```bash
# Start server
npm start

# Check server status
http://localhost:4000

# Stop server
Press Ctrl+C in the terminal
```

