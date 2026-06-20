FROM node:20-slim

WORKDIR /app

RUN apt-get update -qq && apt-get install -y -qq openssl git && rm -rf /var/lib/apt/lists/*

# Copy everything at once (monorepo workspaces need all package.json files)
COPY . .

RUN npm install 2>&1 || (echo "npm install failed, retrying with --legacy-peer-deps" && npm install --legacy-peer-deps)

RUN npx prisma generate --schema packages/db/prisma/schema.prisma

RUN npm run build -w packages/shared-types 2>&1 || echo "shared-types build skipped"
RUN npm run build -w apps/web 2>&1 || echo "web build skipped"
RUN npm run build -w apps/api 2>&1 || echo "api build skipped"

RUN cp -r apps/web/dist apps/api/public 2>/dev/null || echo "no web dist to copy"

EXPOSE 4000

CMD echo "--- Running migrations ---" && \
    npx prisma migrate deploy --schema packages/db/prisma/schema.prisma 2>&1; \
    echo "--- Starting API ---" && \
    node apps/api/dist/src/index.js
