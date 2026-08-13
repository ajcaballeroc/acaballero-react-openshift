FROM node:20-alpine AS build
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && \
    chgrp -R 0 /var/cache/nginx /run /usr/share/nginx/html /etc/nginx && \
    chmod -R g=u /var/cache/nginx /run /usr/share/nginx/html /etc/nginx
EXPOSE 8080
USER 1001
ENTRYPOINT ["/entrypoint.sh"]