FROM node:lts-alpine AS builder
WORKDIR /tmp
RUN apk add python3 make build-base
COPY ./package* ./
RUN npm ci

FROM node:lts-alpine AS runner
WORKDIR /tmp
COPY --from=builder /tmp ./
COPY ./ ./
ENTRYPOINT ["npm", "start"]
