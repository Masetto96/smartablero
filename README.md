![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Raspberry Pi](https://img.shields.io/badge/Raspberry%20Pi-A22846?style=for-the-badge&logo=raspberry-pi&logoColor=white)

# SmarTablero

I made a dashboard to display things I am too lazy to look up, like weather, events, maybe news or discounted pasta. 
It's deployed on a raspberry pi in my living room.

# Usage

## Environment Variables

### Backend (.env)

-  `KEY`: The API key for the weather service.

### Frontend (.env)

-  `VITE_BACKEND_URL`: The backend URL. Use `http://localhost:8000` during development

## Development

Run locally with hot-reload:

```bash
docker-compose up --build
```

## Production Deployment

### Option 1: Deploy on Raspberry Pi (Recommended)

This project uses GitHub Actions to automatically build ARM64 Docker images. No building required on the Pi!

#### Initial Setup on Raspberry Pi

1. **Install Docker** (if not already installed):
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

2. **Clone the repository**:
```bash
git clone https://github.com/Masetto96/smartablero.git
cd smartablero
```

3. **Create backend environment file**:
```bash
# Create backend/.env file with your API keys
echo "KEY=your_aemet_api_key_here" > backend/.env
echo "DEBUG=False" >> backend/.env
echo "RELOAD=False" >> backend/.env
```

4. **Login to GitHub Container Registry** (if images are private):
```bash
# Create a Personal Access Token (PAT) on GitHub with 'read:packages' permission
# GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
echo YOUR_PAT_TOKEN | docker login ghcr.io -u Masetto96 --password-stdin
```

5. **Deploy the application**:
```bash
docker-compose -f docker-compose.pi.yml pull
docker-compose -f docker-compose.pi.yml up -d
```

6. **Access the dashboard**:
   - Frontend: `http://raspberry-pi-ip:3000`
   - Backend API: `http://raspberry-pi-ip:8000/docs`

#### Updating the Application

When you push code changes to GitHub, new images are automatically built. To update your Pi:

```bash
cd smartablero
docker-compose -f docker-compose.pi.yml pull
docker-compose -f docker-compose.pi.yml up -d
```

#### Monitoring

Check logs:
```bash
# All services
docker-compose -f docker-compose.pi.yml logs -f

# Specific service
docker-compose -f docker-compose.pi.yml logs -f frontend
docker-compose -f docker-compose.pi.yml logs -f backend
```

Check status:
```bash
docker-compose -f docker-compose.pi.yml ps
```

#### Troubleshooting

If containers won't start:
```bash
# Check container status
docker ps -a

# Check logs for errors
docker-compose -f docker-compose.pi.yml logs

# Restart services
docker-compose -f docker-compose.pi.yml restart

# Complete reset
docker-compose -f docker-compose.pi.yml down
docker-compose -f docker-compose.pi.yml pull
docker-compose -f docker-compose.pi.yml up -d
```

### Option 2: Traditional Production Build

Build and run locally (slower on Pi):

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

## CI/CD Pipeline

This project uses GitHub Actions to automatically:
- Build multi-architecture Docker images (ARM64 for Raspberry Pi 4)
- Push images to GitHub Container Registry
- Tag images with branch names and commit SHAs

Workflow triggers on:
- Push to `main` or `ref-sevilla` branches
- Manual workflow dispatch

Images are available at:
- Frontend: `ghcr.io/masetto96/smartablero/frontend:ref-sevilla`
- Backend: `ghcr.io/masetto96/smartablero/backend:ref-sevilla`

# Resources

-  Weather API [AEMET Open Data](https://opendata.aemet.es/centrodedescargas/inicio)

<img src="frontend/src/assets/zumzeig.png" width="120" alt="zumzeig"/>

<img src="frontend/src/assets/Logo-Marula-Cafe.png" width="120" alt="zumzeig"/>
