# 🚀 Quick Deployment Guide

## ✅ Issues Fixed

1. **✅ Type Dependencies**: Added `@types/express` and `@types/uuid` to root package.json
2. **✅ Render Port**: Removed static PORT from render.yaml (Render assigns its own)
3. **✅ CORS Configuration**: Updated server to allow `https://least-count.netlify.app`
4. **✅ Environment Variables**: Updated client to connect to `https://leastcount.onrender.com`
5. **✅ Global Types**: Added backup `global.d.ts` for monorepo builds

## Ready to Deploy!

### Step 1: Commit All Changes
```bash
git add .
git commit -m "Fix deployment: Add global types, remove static port, update CORS"
git push
```

### Step 2: Trigger Render Redeploy
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your "least-count-server" service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Monitor build logs for success

### Step 3: Verify Netlify Auto-Redeploy
1. Netlify should auto-redeploy when you push
2. Check [Netlify Dashboard](https://app.netlify.com) for deploy status
3. Once both are deployed, connection indicator should turn green

## Expected Results

- **Server**: https://leastcount.onrender.com (accessible)
- **Client**: https://least-count.netlify.app (green connection indicator)
- **Full functionality**: Host controls, game play, bots all working

## If Still Having Issues

Try the Docker deployment method:
1. In Render, delete current service
2. Create new Web Service
3. Choose "Docker" environment
4. Repository root contains `Dockerfile`
5. No build command needed

Done! 🎉
