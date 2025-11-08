# Vercel Deployment Guide

This guide will help you deploy your Order Management System to Vercel with both frontend and backend.

## 📋 Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional but recommended)
3. MongoDB Atlas account for production database

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Production Database)

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click "Build a Database"
4. Choose **FREE** tier (M0 Sandbox)
5. Select your preferred region
6. Click "Create Cluster"

### 1.2 Configure Database Access

1. In the left sidebar, click **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Enter username and generate a strong password
5. Under **Database User Privileges**, select **Read and write to any database**
6. Click **Add User**

**⚠️ IMPORTANT**: Save these credentials securely!

### 1.3 Configure Network Access

1. In the left sidebar, click **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - This is required for Vercel serverless functions
4. Click **Confirm**

### 1.4 Get Connection String

1. Click **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` with your database username
6. Replace `<password>` with your database password
7. Add your database name after `.net/`:
   ```
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/orderbook?retryWrites=true&w=majority
   ```

---

## 🚀 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

#### 2.1 Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

#### 2.2 Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)

#### 2.3 Configure Environment Variables

In the Vercel project settings, add these environment variables:

**Frontend Environment Variables:**

```
VITE_API_URL=https://your-project-name.vercel.app/api
```

**Backend Environment Variables:**

```
NODE_ENV=production
JWT_SECRET=<your-128-character-secret>
JWT_EXPIRY=7d
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/orderbook?retryWrites=true&w=majority
ALLOWED_ORIGINS=https://your-project-name.vercel.app,https://your-project-name-git-main.vercel.app
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
PORT=5000
```

**⚠️ IMPORTANT NOTES:**

- Replace `your-project-name` with your actual Vercel project name
- Include both production URL and git branch URLs in ALLOWED_ORIGINS
- Don't include trailing slashes in URLs
- Separate multiple origins with commas (no spaces)

**To generate a strong JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 2.4 Deploy

1. Click **Deploy**
2. Wait for the build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

---

### Option B: Deploy via Vercel CLI

#### 2.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 2.2 Login to Vercel

```bash
vercel login
```

#### 2.3 Deploy

From the project root:

```bash
# First deployment
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? your-project-name
# - Directory? ./ (press Enter)
# - Override settings? No

# Production deployment
vercel --prod
```

#### 2.4 Add Environment Variables

```bash
# Add each environment variable
vercel env add JWT_SECRET
vercel env add MONGODB_URI
vercel env add ALLOWED_ORIGINS
# ... add all other variables

# Or add via dashboard (easier)
```

---

## 🔧 Step 3: Post-Deployment Configuration

### 3.1 Update Frontend API URL

After deployment, update the `VITE_API_URL` environment variable with your actual Vercel URL:

```
VITE_API_URL=https://your-actual-project-name.vercel.app/api
```

Redeploy for changes to take effect.

### 3.2 Update CORS Origins

Update `ALLOWED_ORIGINS` to include your Vercel URL:

```
ALLOWED_ORIGINS=https://your-actual-project-name.vercel.app
```

### 3.3 Seed Initial Data (Optional)

If you need to seed the database with initial data:

1. Update `backend/.env` with your MongoDB Atlas URI
2. Run locally: `cd backend && npm run seed`

Or create an admin user manually in MongoDB Atlas web interface.

---

## ✅ Step 4: Verify Deployment

### 4.1 Check Frontend

1. Visit your Vercel URL: `https://your-project-name.vercel.app`
2. Verify the login page loads correctly
3. Check browser console for errors

### 4.2 Check Backend API

Test the health endpoint:

```bash
curl https://your-project-name.vercel.app/api/health
```

Should return:

```json
{ "status": "ok", "timestamp": "2024-..." }
```

### 4.3 Test Login

1. Try logging in with your credentials
2. Verify you can access the dashboard
3. Test creating/editing orders
4. Check notifications work

---

## 🐛 Troubleshooting

### Build Errors

**Problem**: Build fails on Vercel

**Solution**:

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### API Not Working

**Problem**: 404 or 500 errors on API calls

**Solution**:

- Verify `vercel.json` routing configuration
- Check backend environment variables
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check Vercel function logs

### Database Connection Issues

**Problem**: Cannot connect to MongoDB

**Solution**:

- Verify MongoDB URI is correct
- Check username/password are properly URL-encoded
- Ensure IP whitelist includes 0.0.0.0/0 in MongoDB Atlas
- Test connection string locally first

### CORS Errors

**Problem**: CORS policy blocks requests

**Solution**:

1. **Find your Vercel URL**: Check your deployment logs or Vercel dashboard
2. **Update ALLOWED_ORIGINS** in Vercel environment variables:
   ```
   ALLOWED_ORIGINS=https://your-actual-url.vercel.app,https://your-actual-url-git-main.vercel.app
   ```
3. **Important**:
   - Don't include trailing slashes
   - Include both production and preview deployment URLs
   - Separate multiple URLs with commas (no spaces)
   - Use exact URLs (case-sensitive)
4. **Redeploy** after changing environment variables
5. **Check logs** for "CORS blocked origin" messages to see what origin is being rejected

**Example of correct ALLOWED_ORIGINS:**

```
ALLOWED_ORIGINS=https://orderbook-app.vercel.app,https://orderbook-app-git-main.vercel.app
```

### Rate Limiting Issues

**Problem**: Getting rate limited too quickly

**Solution**:

- Adjust `RATE_LIMIT_MAX_REQUESTS` in environment variables
- Clear rate limit by redeploying or waiting 15 minutes

---

## 📊 Monitoring & Maintenance

### View Logs

In Vercel Dashboard:

1. Go to your project
2. Click on a deployment
3. Click **Functions** tab
4. View real-time logs

### Update Environment Variables

1. Go to Project Settings → Environment Variables
2. Edit or add variables
3. Redeploy for changes to take effect

### Redeploy

```bash
# Via CLI
vercel --prod

# Or push to GitHub (auto-deploys)
git push origin main
```

### Database Backups

Set up automated backups in MongoDB Atlas:

1. Cluster → Backup
2. Enable Cloud Backup
3. Configure backup schedule

---

## 🔒 Security Checklist

Before going live, verify:

- [ ] Strong JWT_SECRET (128+ characters)
- [ ] HTTPS only (Vercel provides this automatically)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Environment variables set correctly
- [ ] CORS configured with specific origins
- [ ] Rate limiting enabled
- [ ] Database user has minimal required permissions
- [ ] `.env` files not committed to git
- [ ] Secure MongoDB password
- [ ] Run security audit: `cd backend && npm run security-audit`

---

## 🎯 Custom Domain (Optional)

### Add Custom Domain

1. Go to Project Settings → Domains
2. Add your domain (e.g., `orderbook.yourdomain.com`)
3. Configure DNS records as instructed
4. Update `ALLOWED_ORIGINS` and `VITE_API_URL` with new domain
5. Redeploy

---

## 📞 Support

If you encounter issues:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
3. Check application logs in Vercel dashboard
4. Review `SECURITY.md` for security best practices

---

## 🎉 You're Live!

Once deployed successfully:

1. Share your app URL with your team
2. Set up monitoring and alerts
3. Configure automated backups
4. Review analytics in Vercel dashboard

**Deployed URL Structure:**

- Frontend: `https://your-project-name.vercel.app`
- API: `https://your-project-name.vercel.app/api`
- Health Check: `https://your-project-name.vercel.app/api/health`

---

**Last Updated**: November 2024  
**Deployment Platform**: Vercel  
**Database**: MongoDB Atlas  
**Framework**: React + Vite + Express
