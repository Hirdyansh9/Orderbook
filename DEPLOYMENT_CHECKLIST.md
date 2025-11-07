# 🚀 Quick Deployment Checklist

## Before Deploying

- [ ] All code committed to git
- [ ] `.env` files are in `.gitignore`
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with credentials saved
- [ ] Network access set to 0.0.0.0/0 in MongoDB Atlas

## Vercel Setup

- [ ] GitHub repository created and code pushed
- [ ] Vercel account created
- [ ] Project imported to Vercel from GitHub
- [ ] Framework preset set to "Vite"

## Environment Variables in Vercel

Copy these to Vercel Project Settings → Environment Variables:

### Required Variables:

```
NODE_ENV=production
JWT_SECRET=<generate-with-crypto>
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/orderbook
ALLOWED_ORIGINS=https://your-project.vercel.app
VITE_API_URL=https://your-project.vercel.app/api
BCRYPT_ROUNDS=12
JWT_EXPIRY=7d
```

### Generate JWT Secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## After First Deployment

- [ ] Update `VITE_API_URL` with actual Vercel URL
- [ ] Update `ALLOWED_ORIGINS` with actual Vercel URL
- [ ] Redeploy to apply environment variable changes
- [ ] Test health endpoint: `/api/health`
- [ ] Test login functionality
- [ ] Create first user/seed database
- [ ] Verify all features work

## Security Check

- [ ] Run: `cd backend && npm run security-audit`
- [ ] Verify HTTPS is enabled (automatic with Vercel)
- [ ] Check CORS configuration
- [ ] Verify rate limiting is active
- [ ] Test authentication flow

## Monitoring

- [ ] Check Vercel deployment logs
- [ ] Monitor MongoDB Atlas metrics
- [ ] Set up error alerts (optional)

## Done! 🎉

Your app should be live at: `https://your-project-name.vercel.app`
