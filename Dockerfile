# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/server/package*.json ./apps/server/

# Install all dependencies including dev dependencies for build
RUN npm install && \
    cd packages/shared && npm install && \
    cd ../../apps/server && npm install

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server
COPY global.d.ts ./

# Build shared package first
RUN cd packages/shared && npm run build

# Build server
RUN cd apps/server && npm run build

# Remove dev dependencies for smaller image
RUN npm prune --production && \
    cd packages/shared && npm prune --production && \
    cd ../../apps/server && npm prune --production

# Expose port (Render will override this)
EXPOSE $PORT

# Start the application
CMD ["npm", "run", "start:server"]
