FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/worker/package.json apps/worker/
COPY packages/ packages/
RUN npm install

COPY . .

CMD ["npm", "run", "dev", "-w", "apps/worker"]
