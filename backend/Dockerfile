# Optimized for Raspberry Pi (ARM64, 2GB RAM)
FROM python:3.10-slim

WORKDIR /app

# Set Python to run in unbuffered mode and disable bytecode generation
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install dependencies with minimal footprint
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    # Clean up unnecessary files
    find /usr/local -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true && \
    find /usr/local -type f -name '*.pyc' -delete 2>/dev/null || true && \
    find /usr/local -type f -name '*.pyo' -delete 2>/dev/null || true && \
    rm -rf /root/.cache

# Copy application code (changes more frequently)
COPY main.py .
COPY sky_icon_mapping.json .
COPY routers/ ./routers/

# Create non-root user for security and resource isolation
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 8000

# Use environment variables to control hot reloading
# For production, use --workers 1 to limit memory usage on RPi
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 $([ \"$RELOAD\" = \"True\" ] && echo --reload)"]