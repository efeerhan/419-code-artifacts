# Stage 1: Build the React frontend
FROM node:18-alpine AS client-builder
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build the Flask backend 
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY server/ server/

# Copy the React build artifacts into the Flask static folder:
# 1. Copy index.html
COPY --from=client-builder /app/build/index.html /app/server/static/index.html
# 2. Copy the *contents* of the build/static folder (trailing slash copies contents)
COPY --from=client-builder /app/build/static/ /app/server/static/

# Render sets the port via the PORT environment variable (often 10000)
EXPOSE 10000
CMD ["python", "server/app.py"]
