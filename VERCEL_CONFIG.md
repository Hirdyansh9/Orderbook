# Vercel Configuration for orderbook-blond.vercel.app

## 📋 Environment Variables to Set in Vercel

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

### Add these variables for all environments (Production, Preview, Development):

```env
NODE_ENV=production
JWT_SECRET=103cf383986d5c5849464283148735a4d4e53c1913d695e402a09b8ac898a11037b72230debb897bc696ae64a3d0b83736acc0224d354a41b2bc164b492f16cb
JWT_EXPIRY=7d
MONGODB_URI=mongodb+srv://hirdy:b3WJ3UoQTbUGP8VQ@cluster0.jhwsaek.mongodb.net/handloom-inventory?retryWrites=true&w=majority&appName=Cluster0
ALLOWED_ORIGINS=https://orderbook-blond.vercel.app,https://orderbook-blond-git-main.vercel.app
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
PORT=5000
```

### Frontend Environment Variable:

```env
VITE_API_URL=https://orderbook-blond.vercel.app/api
```

---

## 🚀 Quick Deployment Steps

### 1. Commit and Push Changes

```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 2. Configure Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable listed above
5. Make sure to select all environments (Production, Preview, Development)

### 3. Redeploy

After adding environment variables:
- Click **Deployments** tab
- Click the **⋮** menu on the latest deployment
- Click **Redeploy**

Or trigger a new deployment:
```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Visit https://orderbook-blond.vercel.app
- [ ] Check that the page loads without errors
- [ ] Test health endpoint: https://orderbook-blond.vercel.app/api/health
- [ ] Try logging in with: username=`owner`, password=`password123`
- [ ] Check browser console for errors
- [ ] Verify API calls work (Network tab in DevTools)
- [ ] Test creating/editing orders
- [ ] Check notifications work

---

## 🔍 Debugging

### Check Vercel Function Logs

1. Go to **Deployments** tab
2. Click on your deployment
3. Click **Functions** tab
4. Look for errors or CORS messages

### Common Issues

**CORS Error?**
- Verify ALLOWED_ORIGINS includes: `https://orderbook-blond.vercel.app`
- No trailing slashes
- Exact URL match

**API 404?**
- Check VITE_API_URL is set correctly
- Should be: `https://orderbook-blond.vercel.app/api`

**Database Connection Failed?**
- Verify MongoDB URI is correct
- Check MongoDB Atlas allows 0.0.0.0/0 (all IPs)
- Verify username/password in connection string

---

## 📞 URLs Reference

- **Frontend**: https://orderbook-blond.vercel.app
- **API Base**: https://orderbook-blond.vercel.app/api
- **Health Check**: https://orderbook-blond.vercel.app/api/health
- **Login Endpoint**: https://orderbook-blond.vercel.app/api/auth/login

---

## 🔒 Security Notes

⚠️ **After First Deployment:**

1. Change default password for `owner` account
2. Change default password for `employee` account
3. Review user access and permissions
4. Set up monitoring in Vercel dashboard
5. Configure alerts for errors

---

**Deployment Date**: November 8, 2025  
**Project URL**: https://orderbook-blond.vercel.app  
**Status**: Ready for Deployment ✅
