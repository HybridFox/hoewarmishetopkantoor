# Stage 0: Build Angular
FROM node:gallium-alpine AS build

WORKDIR /usr/build
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 1: Serve Angular
FROM nginx:1.21.0-alpine

COPY --from=build /usr/build/build/. /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.template
COPY docker-entrypoint.sh /
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
