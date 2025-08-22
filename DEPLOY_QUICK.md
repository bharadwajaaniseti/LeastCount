# 🚀 Quick Deployment Guide

## Before You Deploy

1. **Fix dependencies locally:**
   ```bash
   cd apps/server
   npm install --save-dev @types/express @types/uuid
   ```

2. **Test builds work:**
   ```bash
   cd ../../
   npm run build:server
   npm run build:client  
   ```

3. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Fix deployment dependencies"
   git push
   ```

## Option 1: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Railway will auto-detect the railway.toml
4. Deploy will happen automatically
5. Copy your Railway URL

## Option 2: Render with Docker

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Choose "Docker" environment
5. Set Dockerfile path: `./Dockerfile`
6. Deploy

## Option 3: Render Simple

1. Go to [render.com](https://render.com)  
2. Connect GitHub repo
3. Use these settings:
   - Environment: Node
   - Build Command: `npm run build:server`
   - Start Command: `npm run start:server`

## Deploy Client to Netlify

1. Update `apps/client/.env.production` with your server URL
2. Commit and push changes
3. Go to [netlify.com](https://netlify.com)
4. Connect GitHub repo
5. Netlify will auto-detect netlify.toml

## Final Steps

1. Update server CORS with Netlify URL
2. Commit and push
3. Both services redeploy automatically

Done! 🎉
