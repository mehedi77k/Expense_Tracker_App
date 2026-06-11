FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY . .
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app
EXPOSE 3000
CMD ["node", "src/server.js"]
