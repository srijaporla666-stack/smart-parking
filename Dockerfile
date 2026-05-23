FROM node:18-bullseye-slim

WORKDIR /app

# Copy backend files only
COPY backend/package*.json ./
COPY backend/ ./

# Install OS-level build tools required for native modules (sqlite3)
RUN apt-get update && \
	apt-get install -y python3 build-essential make g++ pkg-config && \
	rm -rf /var/lib/apt/lists/*

# Force npm to build native modules from source inside this container
ENV npm_config_build_from_source=true

# Install production dependencies (build-from-source will compile sqlite3 against container glibc)
RUN npm install --production || (npm rebuild --build-from-source && npm install --production)

# Ensure sqlite3 native addon is built against the container's libs
RUN npm rebuild sqlite3 --build-from-source || true

# Create fallback nested backend path for platforms that run 'node backend/server.js' from /app/backend
RUN mkdir -p /app/backend/backend && \
	cp /app/server.js /app/backend/backend/server.js || true && \
	cp /app/database.js /app/backend/backend/database.js || true

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
