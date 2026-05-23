FROM node:18-alpine

WORKDIR /app

# Copy backend files only
COPY backend/package*.json ./
COPY backend/server.js ./
COPY backend/database.js ./
COPY backend/schema.sql ./

# Install dependencies
RUN npm install

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
