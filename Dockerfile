FROM node:18-bullseye-slim

WORKDIR /app

# Copy backend files only
COPY backend/package*.json ./
COPY backend/ ./

# Install OS-level build tools required for some native modules (sqlite3)
RUN apt-get update && \
	apt-get install -y python3 build-essential make g++ && \
	rm -rf /var/lib/apt/lists/*

# Install production dependencies
RUN npm install --production

# Create fallback nested backend path for platforms that run 'node backend/server.js' from /app/backend
RUN mkdir -p /app/backend/backend && \
	cp /app/server.js /app/backend/backend/server.js || true && \
	cp /app/database.js /app/backend/backend/database.js || true

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
