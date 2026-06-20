FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/ai-engine/package.json apps/ai-engine/
COPY packages/ packages/
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev", "-w", "apps/ai-engine"]
