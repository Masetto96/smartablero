# SmarTablero - Raspberry Pi Deployment

Simple deployment guide for running SmarTablero on a Raspberry Pi using pre-built Docker images.

## Quick Start

**One-time setup** → **Deploy** → **Update when needed**

---

## 1. Initial Setup (One Time Only)

### Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Log out and back in for the group changes to take effect.

### Clone Repository

```bash
git clone https://github.com/Masetto96/smartablero.git
cd smartablero
```

### Configure API Keys

```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit and add your API keys
nano backend/.env
```

Get your API keys:
- **AEMET Weather**: https://opendata.aemet.es/centrodedescargas/inicio
- **The Guardian News**: https://open-platform.theguardian.com/access/

### Login to GitHub Container Registry (Optional)

Only needed if images are private:

```bash
echo YOUR_PAT_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

To make images public instead:
1. Go to https://github.com/Masetto96\?tab\=packages
2. Click each package → Package Settings → Change visibility → Public

---

## 2. Deploy

```bash
./deploy-pi.sh
```

That's it! Access your dashboard at:
- **Frontend**: http://raspberry-pi-ip:3000
- **API docs**: http://raspberry-pi-ip:8000/docs

---

## 3. Update (After Pushing New Code)

When you push code to the `master` branch, GitHub Actions builds new ARM64 images automatically.

Update your Pi:

```bash
cd smartablero
./deploy-pi.sh
```

---

## Useful Commands

### View logs
```bash
docker-compose -f docker-compose.pi.yml logs -f
```

### Check status
```bash
docker-compose -f docker-compose.pi.yml ps
```

### Restart services
```bash
docker-compose -f docker-compose.pi.yml restart
```

### Stop everything
```bash
docker-compose -f docker-compose.pi.yml down
```

---

## Auto-start on Boot (Optional)

Create systemd service:

```bash
sudo nano /etc/systemd/system/smartablero.service
```

Paste:

```ini
[Unit]
Description=SmarTablero Dashboard
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/pi/smartablero
ExecStart=/usr/bin/docker-compose -f docker-compose.pi.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.pi.yml down
User=pi

[Install]
WantedBy=multi-user.target
```

Enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable smartablero.service
sudo systemctl start smartablero.service
```

---

## How It Works

1. **Push to master** → GitHub Actions builds ARM64 images → Pushes to ghcr.io
2. **Run deploy-pi.sh** → Pulls latest images → Restarts containers
3. **Resource limits**: Optimized for Raspberry Pi 4 (2GB RAM)
   - Frontend: 128MB (nginx is lightweight)
   - Backend: 768MB (Python + FastAPI)
   - Total: ~900MB, leaving ~600MB headroom

---

## Troubleshooting

### Containers won't start
```bash
docker-compose -f docker-compose.pi.yml logs
docker-compose -f docker-compose.pi.yml down
docker-compose -f docker-compose.pi.yml pull
docker-compose -f docker-compose.pi.yml up -d
```

### Check memory usage
```bash
free -h
docker stats
```

### Backend not responding
```bash
docker-compose -f docker-compose.pi.yml logs backend
curl http://localhost:8000/docs
```
