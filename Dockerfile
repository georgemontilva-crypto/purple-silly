FROM node:22-slim
WORKDIR /app

# Copy everything (patches/ must be present before pnpm install)
COPY . .

# Install dependencies and build (frontend + server)
RUN npm install -g corepack@latest && \
    corepack pnpm install && \
    corepack pnpm run build

ENV NODE_ENV=production

# Railway injects PORT at runtime; server already reads process.env.PORT
EXPOSE 3000

CMD ["node", "dist/index.js"]
