FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./backend/
COPY backend/server.js ./backend/
COPY backend/database.js ./backend/
COPY backend/schema.sql ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]
