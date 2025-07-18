# ----------- Build Stage -----------
FROM public.ecr.aws/docker/library/node:21.2.0-alpine3.18 AS builder

WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

COPY public ./public
COPY src ./src
COPY components.json ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./
COPY next.config.ts ./

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ARG NEXT_PUBLIC_CAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_CAPTCHA_SITE_KEY=${NEXT_PUBLIC_CAPTCHA_SITE_KEY}

RUN npm run build

# ----------- Runtime Stage (Distroless) -----------
FROM gcr.io/distroless/nodejs22

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER nonroot

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node_modules/next/dist/bin/next", "start"]
    