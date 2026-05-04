FROM node:20-alpine

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN npm ci --prefix server

# Copy source and build TypeScript
COPY server/ ./server/
RUN npm run build --prefix server

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "server/dist/index.js"]
