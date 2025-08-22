# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/server/package*.json ./apps/server/

# Install dependencies
RUN npm ci --only=production && \
    cd packages/shared && npm ci --only=production && \
    cd ../../apps/server && npm ci --only=production

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

# Build shared package
RUN cd packages/shared && npm run build

# Build server
RUN cd apps/server && npm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:server"]
