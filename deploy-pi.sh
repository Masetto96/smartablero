#!/bin/bash

# Simple deployment script for Raspberry Pi
# Pulls latest images from GitHub Container Registry and restarts services

set -e

echo "🚀 Deploying SmarTablero to Raspberry Pi..."
echo ""

# Pull latest images
echo "📦 Pulling latest Docker images..."
docker-compose -f docker-compose.pi.yml pull

# Restart services with new images
echo "🔄 Restarting services..."
docker-compose -f docker-compose.pi.yml up -d

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Container status:"
docker-compose -f docker-compose.pi.yml ps

echo ""
echo "📝 To view logs, run:"
echo "   docker-compose -f docker-compose.pi.yml logs -f"
