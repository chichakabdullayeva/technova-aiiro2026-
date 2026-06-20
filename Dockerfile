FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/db/package.json packages/db/

RUN npm install --legacy-peer-deps

COPY tsconfig.base.json ./
COPY apps/api apps/api/
COPY apps/web apps/web/
COPY packages packages/

RUN npx prisma generate --schema packages/db/prisma/schema.prisma
RUN npm run build -w packages/shared-types
RUN npm run build -w apps/web
RUN npm run build -w apps/api
RUN cp -r apps/web/dist apps/api/public

EXPOSE 4000

CMD npx prisma migrate deploy --schema packages/db/prisma/schema.prisma && \
    npx ts-node packages/db/prisma/seed.ts && \
    node apps/api/dist/src/index.js
