# 1. Base Image
FROM node:20-alpine

# 2. Set Working Directory
WORKDIR /app

# 3. Copy package files (better layer caching)
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 4. Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 5. Copy Source Code
COPY . .

# 6. Generate Prisma Client
# Required for Prisma 7 to work correctly in container
RUN npx prisma generate

# 7. Build Application
RUN pnpm run build

# 8. Expose Port
EXPOSE 3000

# 9. Start Command
# Run migrations before starting the app
# Use 'exec' to ensure node receives OS signals (SIGTERM, etc.) correctly
CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/src/main.js"]