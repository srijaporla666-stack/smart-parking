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

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
