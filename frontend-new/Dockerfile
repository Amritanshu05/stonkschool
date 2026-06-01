# ==============================================================================
# Builder Stage
# ==============================================================================
FROM oven/bun:1.1-slim AS builder
WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package manifests (caching dependencies)
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the frontend source code
COPY . .

# Accept build-time arguments for env variables baked into client bundle
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Build the Next.js project with standalone output enabled
RUN bun run build

# ==============================================================================
# Runtime Stage
# ==============================================================================
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root system user for security
RUN groupadd -g 10001 nodejs && \
    useradd -u 10001 -g nodejs -s /bin/sh -m nextjs

# Copy Next.js standalone output files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set ownership to nextjs user
RUN chown -R nextjs:nodejs /app

# Run as non-root user
USER nextjs

EXPOSE 3002

# Execute Next.js standalone server
CMD ["node", "server.js"]
