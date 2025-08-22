# Least Count Card Game - Run Instructions

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Install Dependencies
```powershell
# From the root directory
cd "e:\Personal\My Sites\LeastCount"

# Install all packages
npm install
```

### 2. Build Shared Package
```powershell
# Build shared types package first
cd packages\shared
npm run build
```

### 3. Start Development Servers

#### Option A: Manual Start (Recommended for debugging)
```powershell
# Terminal 1 - Start Server
cd apps\server
npm run dev

# Terminal 2 - Start Client  
cd apps\client
npm run dev
```

#### Option B: Production Build
```powershell
# Build everything
cd apps\server
npm run build

cd ..\client
npm run build

# Start production server
cd ..\server
npm start
```

## 🎮 Access the Game

- **Client**: http://localhost:5173 (or 5174 if port conflict)
- **Server**: http://localhost:3001 (API only)

## 🌐 Production Deployment

### 🚀 Deploy Server to Render (Option A: Simple)

1. **Simple render.yaml approach:**
   - The render.yaml is now simplified to work around build command limitations
   - Uses root-level npm scripts with postinstall hooks

2. **Manual deployment steps:**
   ```powershell
   # Make sure all dependencies are installed locally first
   npm run install:all
   
   # Test the build process locally
   npm run build:server
   ```

### 🐳 Deploy Server to Render (Option B: Docker)

If the simple approach fails, use Docker deployment:

1. **Create Dockerfile** (already created in root)
2. **In Render dashboard:**
   - Choose "Docker" instead of "Node.js"
   - Set Dockerfile path to `./Dockerfile`
   - No build command needed

### 🌐 Deploy Client to Netlify

Netlify deployment works better with monorepos:

1. **Update client environment:**
   ```
   # In apps/client/.env.production
   VITE_SERVER_URL=https://your-render-server-url.onrender.com
   ```

2. **Netlify will use the netlify.toml configuration automatically**

### 🔧 Troubleshooting Deployment Issues

#### Issue 1: Render Build Command Too Long
**Solution**: Use the simplified render.yaml with postinstall hooks

#### Issue 2: Missing TypeScript Types  
**Solution**: Already fixed with `npm install --save-dev @types/express @types/uuid`

#### Issue 3: Monorepo Dependencies
**Solutions**:
1. Use Docker deployment (Option B above)
2. Or manually flatten dependencies in server package.json

### 🏗️ Alternative: Railway Deployment

If Render continues to have issues, try Railway:

1. **Create railway.toml:**
   ```toml
   [build]
   command = "npm run build:server"
   
   [deploy]
   startCommand = "npm run start:server"
   ```

2. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repo
   - Deploy with one click

### 🔄 Update Client for Production Server

Update `apps/client/src/store/gameStore.ts` to use environment variable:
```typescript
const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001', {
  transports: ['websocket'],
});
```

## 📋 Step-by-Step Deployment Guide

### Step 1: Prepare Your Repository
```powershell
# Initialize git if not done
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/least-count.git
git push -u origin main
```

### Step 2: Deploy Server to Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` configuration
5. Click "Create Web Service"
6. Wait for deployment (5-10 minutes)
7. **Copy your server URL** (e.g., `https://least-count-server.onrender.com`)

### Step 3: Update Environment Variables
1. **Update client environment:**
   - Edit `apps/client/.env.production`
   - Replace `https://your-render-server-url.onrender.com` with your actual Render URL

2. **Update server CORS:**
   - Edit `apps/server/src/index.ts`
   - Replace `https://your-netlify-domain.netlify.app` with your future Netlify domain

### Step 4: Deploy Client to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Netlify will auto-detect the `netlify.toml` configuration
5. Click "Deploy site"
6. Wait for deployment (3-5 minutes)
7. **Copy your Netlify URL** (e.g., `https://amazing-name-123456.netlify.app`)

### Step 5: Final Configuration Update
1. **Update server CORS with actual Netlify domain:**
   ```typescript
   origin: process.env.NODE_ENV === 'production' 
     ? ['https://amazing-name-123456.netlify.app'] // Your actual Netlify URL
     : ['http://localhost:5173', 'http://localhost:5174']
   ```

2. **Commit and push changes:**
   ```powershell
   git add .
   git commit -m "Update production URLs"
   git push
   ```

3. **Redeploy** (both services will auto-redeploy from GitHub)

### 🎯 Free Tier Limitations
- **Render Free**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Netlify Free**: 100GB bandwidth/month, 300 build minutes/month

### 🔄 Auto-Deployments
Both platforms will automatically redeploy when you push to your main branch!

## 🤖 Bot Testing

Test the game with AI bots from the server directory:

```powershell
cd apps\server

# Quick test - 2 bots, 1 game
npm run test-quick

# Medium test - 4 bots, multiple games  
npm run test-medium

# Full stress test - 6 bots, extensive testing
npm run test-full

# Custom test with all scenarios
npm run test-bots
```

## 🎯 Host Controls Features

### Creating a Room
1. Choose your name
2. Select "Create New Room" 
3. Choose elimination points (100-300, default 200)
4. Room code will be generated

### Host Controls Panel (In Lobby)
- **Room Info**: Code, player count, current settings
- **Game Rules**: Adjust elimination points, declare threshold, penalties
- **End Room**: Immediately close room for all players

### During Game
- Host can end the room at any time
- If host disconnects, room automatically closes

## 🔧 Troubleshooting

### Port Already in Use
```powershell
# Kill existing Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Build Errors
```powershell
# Clean and rebuild
cd packages\shared
npm run clean
npm run build

cd ..\..\apps\server  
npm run clean
npm run build

cd ..\client
npm run build
```

### Client Not Loading
1. Ensure server is running on port 3001
2. Check browser console for errors
3. Verify shared package is built

## 📁 Project Structure

```
LeastCount/
├── packages/
│   └── shared/           # Shared TypeScript types
├── apps/
│   ├── server/          # Node.js + Socket.io backend
│   │   ├── src/
│   │   │   ├── game/    # Game logic
│   │   │   └── bot/     # AI bot system
│   │   └── package.json
│   └── client/          # React + Vite frontend
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   └── store/
│       └── package.json
└── package.json         # Root workspace config
```

## 🎲 Game Rules

- **Objective**: Get the lowest score by forming valid sets/runs
- **Hand Size**: 7 cards (configurable)
- **Declare Threshold**: ≤10 points to show (configurable)
- **Elimination**: At 200 points (configurable 100-300)
- **Penalty**: 40 points for invalid show (configurable)

### Card Values
- A = 1, 2-10 = face value, J = 11, Q = 12, K = 13
- Jokers = 0 points, wild in runs only

### Valid Combinations
- **Set**: 3+ cards of same rank (different suits)
- **Run**: 3+ consecutive cards of same suit
- **Pickup Rule**: Can only pick from ends of discard pile

## 🏆 Host Features

### Room Management
- Set elimination points when creating room
- End room at any time with confirmation
- Auto-close if host disconnects

### Rule Configuration
- **Elimination Points**: 100, 150, 200, 250, 300
- **Declare Threshold**: 5-25 points
- **Bad Declare Penalty**: 20-80 points
- **Hand Size**: 5-10 cards

### Real-time Updates
- Rules changes notify all players immediately
- Room state synchronized across all clients
- Visual feedback for all host actions

## 🐛 Common Issues

1. **"Module not found" errors**: Rebuild shared package
2. **Socket connection fails**: Check server is running on 3001
3. **Build fails**: Clear node_modules and reinstall
4. **Game doesn't start**: Ensure 2+ players in room
5. **Host controls missing**: Refresh page to restore connection

## 📞 Support

- Check terminal output for detailed error messages
- Bot tests help verify server functionality
- Use browser developer tools for client debugging
- Server logs show all socket events and game state changes
