# ---- build stage ----
FROM node:22-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# ---- production stage ----
FROM node:22-slim AS prod
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 8080
# Apply pending migrations, then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
