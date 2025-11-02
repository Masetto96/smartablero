# 🚀 Raspberry Pi Quick Setup Guide

This guide will help you deploy SmarTablero to your Raspberry Pi 4 in minutes!

## Prerequisites

- Raspberry Pi 4 with Raspberry Pi OS installed
- Internet connection
- SSH access to your Pi

## Step-by-Step Deployment

### 1. Prepare Your Raspberry Pi

SSH into your Pi:
```bash
ssh pi@your-pi-ip-address
```

### 2. Install Docker (if not already installed)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
exit
# SSH back in
```

### 3. Clone the Repository

```bash
git clone https://github.com/Masetto96/smartablero.git
cd smartablero
```

### 4. Configure Environment Variables

```bash
nano backend/.env
```

Add your configuration:
```env
KEY=your_aemet_api_key_here
DEBUG=False
RELOAD=False
```

Save with `Ctrl+O`, `Enter`, then exit with `Ctrl+X`.

### 5. Login to GitHub Container Registry (Optional)

Only needed if the images are private:

```bash
# First, create a Personal Access Token on GitHub:
# GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
# Required permission: read:packages

echo YOUR_GITHUB_PAT | docker login ghcr.io -u Masetto96 --password-stdin
```

### 6. Deploy!

Use the automated deployment script:

```bash
./deploy-pi.sh
```

Or manually:

```bash
docker-compose -f docker-compose.pi.yml pull
docker-compose -f docker-compose.pi.yml up -d
```

### 7. Access Your Dashboard

Open your browser and navigate to:
- **Dashboard**: `http://your-pi-ip:3000`
- **API Docs**: `http://your-pi-ip:8000/docs`

## Updating Your Deployment

When new code is pushed to GitHub, images are automatically built. To update:

```bash
cd smartablero
./deploy-pi.sh
```

Or manually:
```bash
docker-compose -f docker-compose.pi.yml pull
docker-compose -f docker-compose.pi.yml up -d
```

## Monitoring & Troubleshooting

### View Logs
```bash
# All services
docker-compose -f docker-compose.pi.yml logs -f

# Specific service
docker-compose -f docker-compose.pi.yml logs -f frontend
docker-compose -f docker-compose.pi.yml logs -f backend
```

### Check Service Status
```bash
docker-compose -f docker-compose.pi.yml ps
```

### Restart Services
```bash
docker-compose -f docker-compose.pi.yml restart
```

### Stop Services
```bash
docker-compose -f docker-compose.pi.yml down
```

### Complete Reset
```bash
docker-compose -f docker-compose.pi.yml down -v
docker-compose -f docker-compose.pi.yml pull
docker-compose -f docker-compose.pi.yml up -d
```

## Auto-start on Boot

To make the dashboard start automatically when your Pi boots:

### Option 1: Using systemd (Recommended)

Create a systemd service:

```bash
sudo nano /etc/systemd/system/smartablero.service
```

Add this content:
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

Enable and start:
```bash
sudo systemctl enable smartablero.service
sudo systemctl start smartablero.service

# Check status
sudo systemctl status smartablero.service
```

### Option 2: Using Docker's restart policy

The docker-compose.pi.yml already includes `restart: unless-stopped`, which means containers will automatically restart on boot.

Just make sure Docker starts on boot:
```bash
sudo systemctl enable docker
```

## Performance Tips

1. **Optimize Pi Performance**: Increase GPU memory allocation
   ```bash
   sudo raspi-config
   # Advanced Options → Memory Split → Set to 256MB
   ```

2. **Monitor Resources**:
   ```bash
   docker stats
   ```

3. **Clean Up Old Images**:
   ```bash
   docker system prune -a
   ```

## Common Issues

### Issue: Images won't pull
**Solution**: Check your internet connection and GitHub Container Registry access:
```bash
docker login ghcr.io
docker pull ghcr.io/masetto96/smartablero/frontend:ref-sevilla
```

### Issue: Containers keep restarting
**Solution**: Check logs for errors:
```bash
docker-compose -f docker-compose.pi.yml logs
```

### Issue: Can't access from browser
**Solution**: 
- Check if services are running: `docker-compose -f docker-compose.pi.yml ps`
- Check firewall: `sudo ufw status`
- Verify Pi's IP address: `hostname -I`

## Security Considerations

1. **Change default passwords** if you're using default Pi credentials
2. **Use firewall** to restrict access:
   ```bash
   sudo ufw allow 3000/tcp
   sudo ufw allow 8000/tcp
   sudo ufw enable
   ```
3. **Keep system updated**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## Need Help?

- Check the [main README](./README.md) for more information
- View GitHub Actions logs for build issues: https://github.com/Masetto96/smartablero/actions
- Check container logs: `docker-compose -f docker-compose.pi.yml logs`

---

**Enjoy your SmarTablero! 🎉**
