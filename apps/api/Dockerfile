FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev", "-w", "apps/api"]
