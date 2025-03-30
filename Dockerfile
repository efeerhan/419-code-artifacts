# Stage 1: Building the React frontend

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
COPY --from=client-builder /app/build/ server/static/
EXPOSE 5001

CMD ["python", "server/app.py"]