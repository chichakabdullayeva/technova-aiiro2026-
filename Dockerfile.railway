FROM node:20-slim

WORKDIR /app

# Install openssl for Prisma
RUN apt-get update -qq && apt-get install -y -qq openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/db/package.json packages/db/

# Install ALL dependencies (including devDeps for build)
RUN npm install

# Copy source
COPY tsconfig.base.json ./
COPY apps/api apps/api/
COPY apps/web apps/web/
COPY packages packages/

# Generate Prisma client
RUN npx prisma generate --schema packages/db/prisma/schema.prisma

# Build shared-types
RUN npm run build -w packages/shared-types

# Build frontend
RUN npm run build -w apps/web

# Build API
RUN npm run build -w apps/api

# Copy built frontend into API's public directory
RUN cp -r apps/web/dist apps/api/public

# Expose
EXPOSE 4000

# Start: migrate + seed + serve
CMD npx prisma migrate deploy --schema packages/db/prisma/schema.prisma && \
    npx ts-node packages/db/prisma/seed.ts && \
    node apps/api/dist/src/index.js
