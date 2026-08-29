FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY client/package.json ./
COPY client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:22-alpine AS backend-server
WORKDIR /app/backend
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./

COPY --from=frontend-builder /app/frontend/build ./public
EXPOSE 4000
CMD ["npm", "start"]
