FROM node:22-alpine

WORKDIR /app

# Copy root package files and install backend deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy client package files and install + build frontend
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

# Copy backend source and public assets
COPY src/ ./src/
COPY public/ ./public/
COPY .env.example ./.env

# Expose port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "src/server.js"]
