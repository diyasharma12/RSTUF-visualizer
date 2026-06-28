# ============================================================
# RSTUF TUF Metadata Visualizer — Dockerfile
# Serves FastAPI backend + static frontend on port 8000
# ============================================================

FROM python:3.13-slim AS base

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first for better layer caching
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ /app/backend/

# Copy frontend source
COPY frontend/ /app/frontend/

# Set working directory to backend for uvicorn
WORKDIR /app/backend

# Default environment variables
ENV STORAGE_URL=http://web:8080
ENV MOCK_MODE=false

# Expose the visualizer port
EXPOSE 8000

# Run the FastAPI app with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
