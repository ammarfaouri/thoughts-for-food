FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
COPY scripts ./scripts
RUN npm ci

FROM deps AS build
WORKDIR /app

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
RUN npm run prisma:generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN apk add --no-cache openssl

COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
RUN npm prune --omit=dev

USER node

EXPOSE 5000
CMD ["node", "dist/index.js"]
