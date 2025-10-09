# Development Workflow

## Branch Strategy

### Branches
- **`main`** - Production branch (auto-deploys to Railway)
- **`development`** - Development branch (test here first)
- **`feature/*`** - Feature branches (optional, for larger features)

## Development Process

### 1. Making Changes

```bash
# Always work on development branch
git checkout development

# Make your changes
# Test locally with: npm run dev (frontend) and npm start (backend)

# Commit changes
git add .
git commit -m "Brief description of changes"
git push origin development
```

### 2. Testing Locally

**Frontend:**
```bash
cd frontend
npm run dev
# Visit http://localhost:5173
```

**Backend:**
```bash
cd backend
npm run dev  # Uses .env.local for local database
# API runs on http://localhost:3000
```

### 3. Deploying to Production

**Only after testing in development:**

```bash
# Switch to main
git checkout main

# Merge development
git merge development

# Push to production
git push origin main
```

Railway will automatically deploy `main` to production.

## Best Practices

### ✅ DO:
- Always work on `development` branch
- Test locally before pushing
- Write clear commit messages
- Test changes on Railway staging (if available) before merging to main

### ❌ DON'T:
- Push directly to `main` (except for hotfixes)
- Deploy untested code
- Make breaking changes without warning
- Skip local testing

## Testing Chat Features

Since chat requires multiple users, test it by:
1. Opening two browser windows (one incognito)
2. Sign in as different users
3. Test messaging between them

Or test on Railway development environment with real users.

## Emergency Rollback

If something breaks in production:

```bash
# Check recent commits
git log

# Revert to previous commit
git revert HEAD
git push origin main

# Or hard reset (use carefully!)
git reset --hard <commit-hash>
git push --force origin main
```

## Current Setup

- **Production URL**: https://app.deancallanm.com
- **Repository**: https://github.com/joshr9/hvac-maintenance-app
- **Deployment**: Railway (auto-deploy from `main`)

## Questions?

Contact the development team or refer to Railway dashboard for deployment logs.
