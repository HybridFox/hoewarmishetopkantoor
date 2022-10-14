FROM node:gallium-alpine as builder

ENV NODE_ENV build

WORKDIR /app

COPY . /app

RUN npm ci \
    && npm run build

# ---

FROM node:gallium-alpine

ENV NODE_ENV production

EXPOSE 80
RUN apk add libcap && setcap CAP_NET_BIND_SERVICE=+eip /usr/local/bin/node

WORKDIR /app

COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/dist/ /app/dist/
COPY --from=builder /app/src/ /app/src/

RUN npm ci

CMD ["node", "dist/main.js"]
