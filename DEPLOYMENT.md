# Smart Parking - Deployment Guide (Free Tier)

## Step 1: Prepare Backend for Railway

### 1.1 Update `backend/server.js`
Change the hardcoded PORT and JWT_SECRET to use environment variables:

```javascript
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_for_demo';
```

### 1.2 Add a start script to `backend/package.json`
Add this to the scripts section:
```json
"start": "node server.js"
```

### 1.3 Add `.env` file locally
Create `backend/.env`:
```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development
```

## Step 2: Deploy Backend on Railway (FREE)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → Choose "Deploy from GitHub"
4. Select your repository
5. Railway will auto-detect Node.js
6. Add environment variables:
   - `JWT_SECRET`: Generate a strong secret (use `openssl rand -base64 32`)
   - `NODE_ENV`: `production`
7. Deploy! (Takes ~2 minutes)
8. **Copy your Railway URL** (e.g., `https://smart-parking-production.up.railway.app`)

## Step 3: Update Frontend API URL

### 3.1 Create `frontend/.env.production`
```
VITE_API_URL=https://your-railway-url.up.railway.app
```

### 3.2 Update `frontend/src/App.jsx` or create an API config file
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Use API_URL in all fetch calls:
fetch(`${API_URL}/api/areas`)
```

### 3.3 Update `frontend/vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

## Step 4: Deploy Frontend on Vercel (FREE)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project" → Import your repository
4. Vercel auto-detects React/Vite
5. Add environment variables:
   - `VITE_API_URL`: Your Railway backend URL
6. Deploy! (Takes ~1 minute)

## Step 5: Connect Frontend to Backend

After Vercel deploys, update the environment variable with your actual Railway URL:

1. In Vercel dashboard: Project Settings → Environment Variables
2. Add: `VITE_API_URL = https://your-railway-backend-url.up.railway.app`
3. Redeploy from Vercel dashboard

## Database Note

⚠️ **SQLite Limitation**: SQLite stores data in the file system. On Railway/Vercel, files are ephemeral (deleted on redeploy).

**Solution (Optional but Recommended)**: 
- Upgrade to PostgreSQL on Railway (free tier available)
- Change `backend/database.js` to use `pg` package instead of `sqlite3`

For now, your data will reset on Railway deploys. To persist data:
- Use Railway's PostgreSQL add-on (Free tier)
- Or use a managed database service (MongoDB Atlas free tier, etc.)

## Troubleshooting

- **CORS errors**: Already handled with `app.use(cors())`
- **API 404**: Ensure `VITE_API_URL` is correct in frontend env vars
- **Database errors on Railway**: SQLite doesn't persist. Use PostgreSQL instead.

## Cost

- **Vercel**: Free ✓
- **Railway**: Free tier includes $5/month credit (more than enough)
- **Total Monthly**: $0

---

**Questions?** Check your:
- Railway deployment logs: Dashboard → Deployments → Logs
- Vercel deployment logs: Dashboard → Deployments → Logs
