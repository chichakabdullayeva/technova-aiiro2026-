FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/
COPY packages/ packages/
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "-w", "apps/web", "--", "--host", "0.0.0.0"]
