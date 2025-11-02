# GitHub Actions Setup Checklist

Before pushing your code, ensure you have the following configured:

## 1. GitHub Repository Settings

### Enable GitHub Actions
- Go to your repo: https://github.com/Masetto96/smartablero
- Navigate to **Settings** → **Actions** → **General**
- Under "Actions permissions", ensure actions are enabled
- Under "Workflow permissions", select **"Read and write permissions"**
- Check **"Allow GitHub Actions to create and approve pull requests"**

### Make Packages Public (Optional but Recommended)

If you want to avoid logging in on your Pi:

1. Push code and let GitHub Actions build images first
2. Go to: https://github.com/Masetto96?tab=packages
3. Find `smartablero/frontend` and `smartablero/backend` packages
4. Click on each package
5. Go to **Package settings** (bottom right)
6. Under "Danger Zone" → **Change package visibility** → Select **Public**

## 2. Repository Secrets (Optional)

If you need private environment variables in builds:

- Go to **Settings** → **Secrets and variables** → **Actions**
- Add secrets like API keys if needed in the build process

## 3. First Deployment

### Push Your Code

```bash
# From your development machine
git add .
git commit -m "Add GitHub Actions for automated Docker builds"
git push origin ref-sevilla
```

### Watch the Build

1. Go to: https://github.com/Masetto96/smartablero/actions
2. Click on the latest workflow run
3. Watch the build progress (takes 5-15 minutes)
4. Once complete, images are available at:
   - `ghcr.io/masetto96/smartablero/frontend:ref-sevilla`
   - `ghcr.io/masetto96/smartablero/backend:ref-sevilla`

## 4. Deploy to Raspberry Pi

Follow the instructions in [DEPLOYMENT.md](./DEPLOYMENT.md)

Quick summary:
```bash
# On your Pi
git clone https://github.com/Masetto96/smartablero.git
cd smartablero
nano backend/.env  # Add your API keys
./deploy-pi.sh
```

## 5. Verify Deployment

Check if containers are running:
```bash
docker-compose -f docker-compose.pi.yml ps
```

Access your dashboard:
- Frontend: http://your-pi-ip:3000
- Backend: http://your-pi-ip:8000/docs

## Troubleshooting

### Build fails in GitHub Actions

**Check logs**: https://github.com/Masetto96/smartablero/actions

Common issues:
- Dockerfile syntax errors → Check the Actions log
- Missing dependencies → Verify package.json and requirements.txt
- Build timeout → GitHub Actions has time limits (rare for this project)

### Can't pull images on Pi

**Issue**: Authentication required
```bash
# Login to GitHub Container Registry
echo YOUR_GITHUB_PAT | docker login ghcr.io -u Masetto96 --password-stdin
```

Or make packages public (see step 1 above)

### Images are too large

Current optimizations:
- ✅ Multi-stage builds (frontend)
- ✅ Slim base images (Python slim, Alpine)
- ✅ .dockerignore files
- ✅ Layer caching optimization

To reduce further:
- Remove unnecessary dependencies from requirements.txt / package.json
- Use smaller base images (already using slim/alpine)

## What Was Set Up

### New Files Created
1. `.github/workflows/docker-build.yml` - Automated CI/CD pipeline
2. `docker-compose.pi.yml` - Production compose for Pi (no building)
3. `backend/.dockerignore` - Excludes unnecessary files from build
4. `deploy-pi.sh` - One-command deployment script
5. `DEPLOYMENT.md` - Comprehensive deployment guide
6. `GITHUB_SETUP.md` - This checklist

### Files Modified
1. `frontend/.dockerignore` - Enhanced exclusion rules
2. `frontend/Dockerfile.prod` - Optimized with better caching
3. `backend/Dockerfile` - Optimized with selective copying
4. `README.md` - Added deployment documentation

### Key Features
- ✅ Automatic ARM64 builds on every push
- ✅ No building required on Raspberry Pi
- ✅ Smart layer caching for faster builds
- ✅ Health checks for containers
- ✅ Proper logging and monitoring
- ✅ Easy one-command deployment

## Next Steps

1. ✅ Push code to trigger first build
2. ✅ Wait for GitHub Actions to complete
3. ✅ Deploy to your Raspberry Pi
4. 🎉 Enjoy your dashboard!

---

**Need help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
